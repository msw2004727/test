# main.py (整合「怪獸養成」遊戲)

# --- 1. COMMON IMPORTS & SETUP ---
from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
import logging
import firebase_admin # type: ignore
from firebase_admin import credentials, firestore # type: ignore
import os

# --- 2. LOGGING CONFIGURATION ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
app_logger = logging.getLogger(__name__)

# --- 3. FLASK APP INITIALIZATION ---
app = Flask(__name__) # 主 Flask 應用程式實例
CORS(app, resources={r"/*": {"origins": "*"}}) # 允許所有來源的跨域請求

# --- 提前引入 MD_firebase_config ---
# 這樣即使 Firebase 初始化失敗，MD_firebase_config 模組本身也是存在的
# 只是它內部的 db 變數可能為 None
try:
    import MD_firebase_config
    app_logger.info("MD_firebase_config.py 模組已導入。")
except ImportError:
    app_logger.error("【嚴重錯誤】無法導入 MD_firebase_config.py。MD 遊戲的資料庫功能將完全不可用。", exc_info=True)
    # 設定一個假的 MD_firebase_config 以避免後續 NameError，但功能會受限
    class FakeMDConfig:
        db = None
        def set_firestore_client(self, client):
            app_logger.warning("正在使用 FakeMDConfig 設定 Firestore client，因為 MD_firebase_config.py 導入失敗。")
            self.db = client
    MD_firebase_config = FakeMDConfig() # type: ignore


# --- 4. FIREBASE INITIALIZATION (Centralized) ---
firebase_initialized_successfully = False
db = None # 這個 db 是 main.py 範圍內的 Firestore 客戶端
firebase_app_instance = None

# 檢查 Firebase app 是否已經初始化
if not firebase_admin._apps:
    app_logger.info("Firebase Admin SDK 尚未初始化，開始初始化程序...")
    try:
        # 優先嘗試從環境變數 GOOGLE_APPLICATION_CREDENTIALS 初始化
        if os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
            firebase_app_instance = firebase_admin.initialize_app()
            app_logger.info("Firebase Admin SDK 已透過 GOOGLE_APPLICATION_CREDENTIALS 環境變數成功初始化。")
            firebase_initialized_successfully = True
        else:
            # 其次嘗試從本地的 serviceAccountKey.json 檔案初始化
            cred_path = 'serviceAccountKey.json'
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_app_instance = firebase_admin.initialize_app(cred)
                app_logger.info(f"Firebase Admin SDK 已透過 '{cred_path}' 成功初始化。")
                firebase_initialized_successfully = True
            else:
                # 最後嘗試從環境變數 FIREBASE_SERVICE_ACCOUNT_KEY_JSON
                service_account_key_json_str_md = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_JSON')
                if service_account_key_json_str_md:
                    import json
                    try:
                        service_account_info_md = json.loads(service_account_key_json_str_md)
                        cred_md = credentials.Certificate(service_account_info_md)
                        firebase_app_instance = firebase_admin.initialize_app(cred_md)
                        app_logger.info("Firebase Admin SDK 已透過 FIREBASE_SERVICE_ACCOUNT_KEY_JSON 環境變數成功初始化。")
                        firebase_initialized_successfully = True
                    except json.JSONDecodeError as json_err:
                        app_logger.error(f"解析 FIREBASE_SERVICE_ACCOUNT_KEY_JSON 時發生錯誤: {json_err}")
                    except Exception as e_cred_json:
                        app_logger.error(f"使用 JSON 字串憑證初始化 Firebase 時發生錯誤: {e_cred_json}", exc_info=True)
                else:
                    app_logger.error(
                        f"找不到 Firebase 服務帳戶金鑰檔案 '{cred_path}'，"
                        "且 GOOGLE_APPLICATION_CREDENTIALS 與 FIREBASE_SERVICE_ACCOUNT_KEY_JSON 環境變數均未設定。"
                        "Firestore 功能將無法使用。"
                    )

        if firebase_initialized_successfully and firebase_app_instance:
            db = firestore.client(app=firebase_app_instance) # 設定 main.py 的 db
            app_logger.info("Firestore client 獲取成功 (來自初次初始化)。")
            if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
                MD_firebase_config.set_firestore_client(db) # 將 main.py 的 db 設定給 MD_firebase_config
        elif firebase_initialized_successfully and not firebase_app_instance:
             app_logger.error("Firebase 初始化聲稱成功，但無法獲取 app instance。")
             firebase_initialized_successfully = False
             if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
                MD_firebase_config.set_firestore_client(None)
    except Exception as e_fb_init:
        app_logger.error(f"Firebase Admin SDK 初始化過程中發生錯誤: {e_fb_init}", exc_info=True)
        if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
            MD_firebase_config.set_firestore_client(None)
else:
    app_logger.info("Firebase Admin SDK 先前已初始化。")
    try:
        # 假設總是使用預設的 app (如果有多個 app，這裡的邏輯可能需要調整)
        if firebase_admin.get_app():
            firebase_app_instance = firebase_admin.get_app()
            db = firestore.client(app=firebase_app_instance) # 設定 main.py 的 db
            firebase_initialized_successfully = True
            app_logger.info("已獲取先前初始化的 Firebase app 的 Firestore client。")
            if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
                MD_firebase_config.set_firestore_client(db) # 將 main.py 的 db 設定給 MD_firebase_config
        else:
            app_logger.error("Firebase Admin SDK 先前已初始化，但無法獲取預設 app instance。")
            firebase_initialized_successfully = False
            if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
                MD_firebase_config.set_firestore_client(None)
    except Exception as e_get_app:
        app_logger.error(f"獲取已初始化的 Firebase app 時發生錯誤: {e_get_app}", exc_info=True)
        firebase_initialized_successfully = False
        if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
            MD_firebase_config.set_firestore_client(None)

if not firebase_initialized_successfully:
    app_logger.error("Firebase 初始化最終失敗。資料庫相關功能將不可用。")
    # 即使初始化失敗，也確保 MD_firebase_config.db 是 None
    if MD_firebase_config and hasattr(MD_firebase_config, 'set_firestore_client'):
        MD_firebase_config.set_firestore_client(None)


# --- 5. CONFIGURATION LOADING & FLASK SECRET KEY ---
# (這部分的設定載入邏輯保持不變 - 針對其他遊戲)
interrogation_game_config = None
try:
    import config as ig_config # 「審問挑戰」遊戲的設定檔
    interrogation_game_config = ig_config
    app_logger.info("「審問挑戰」遊戲設定模組 (config.py) 成功導入。")
except ImportError as e_ig_cfg:
    app_logger.warning(f"載入「審問挑戰」遊戲設定 (config.py) 失敗: {e_ig_cfg}。")

haiguitang_specific_config = None
try:
    import haiguitang_config as hg_actual_config
    haiguitang_specific_config = hg_actual_config
    app_logger.info("AI 海龜湯遊戲設定模組 (haiguitang_config.py) 的相關變數已導入。")
except ImportError as e_hg_cfg:
    app_logger.warning(f"載入 AI 海龜湯遊戲設定 (haiguitang_config.py) 失敗: {e_hg_cfg}。")


APP_SECRET_KEY_TO_USE = None
if interrogation_game_config and hasattr(interrogation_game_config, 'APP_SECRET_KEY'):
    APP_SECRET_KEY_TO_USE = interrogation_game_config.APP_SECRET_KEY
    app_logger.info("Flask Secret Key 已從「審問挑戰」遊戲的 config.py 設定。")
elif haiguitang_specific_config and hasattr(haiguitang_specific_config, 'APP_SECRET_KEY') and getattr(haiguitang_specific_config, 'APP_SECRET_KEY'):
    APP_SECRET_KEY_TO_USE = haiguitang_specific_config.APP_SECRET_KEY
    app_logger.info("Flask Secret Key 已從 AI 海龜湯遊戲的 haiguitang_config.py 設定。")

if APP_SECRET_KEY_TO_USE:
    app.secret_key = APP_SECRET_KEY_TO_USE
else:
    app.secret_key = "default_fallback_secret_key_for_flask_0123456789abcdef"
    app_logger.warning("未能在任何設定檔中找到 APP_SECRET_KEY，已使用預設的 Flask Secret Key。")

# --- [[[ 「怪獸養成」遊戲設定載入開始 ]]] ---
# 載入「怪獸養成」遊戲的核心設定
# 這需要在 Firebase 初始化之後，並且在註冊 Blueprint 之前
# 以便路由函式可以透過 app.config 訪問這些設定
if firebase_initialized_successfully:
    try:
        from MD_config_services import load_all_game_configs_from_firestore
        with app.app_context(): # 確保在應用程式上下文中操作 app.config
            app.config['MD_GAME_CONFIGS'] = load_all_game_configs_from_firestore()
            if app.config.get('MD_GAME_CONFIGS') and app.config['MD_GAME_CONFIGS'].get("dna_fragments") is not None: # 簡單檢查
                app_logger.info("「怪獸養成」遊戲核心設定已成功載入並儲存到 app.config。")
            else:
                app_logger.error("「怪獸養成」遊戲核心設定載入失敗或內容不完整！將影響遊戲功能。")
    except ImportError as e_md_cfg_srv:
        app_logger.error(f"無法導入 MD_config_services: {e_md_cfg_srv}。「怪獸養成」遊戲設定將無法載入。", exc_info=True)
        with app.app_context():
            app.config['MD_GAME_CONFIGS'] = {} # 提供一個空字典以避免後續錯誤
    except Exception as e_load_md_cfg:
        app_logger.error(f"載入「怪獸養成」遊戲核心設定時發生未知錯誤: {e_load_md_cfg}", exc_info=True)
        with app.app_context():
            app.config['MD_GAME_CONFIGS'] = {}
else:
    app_logger.error("Firebase 未成功初始化，無法載入「怪獸養成」遊戲核心設定。")
    with app.app_context(): # 即使 Firebase 初始化失敗，也確保 MD_GAME_CONFIGS 存在
        app.config['MD_GAME_CONFIGS'] = {}
# --- [[[ 「怪獸養成」遊戲設定載入結束 ]]] ---


# --- 6. "審問挑戰" (INTERROGATION GAME) SECTION ---
# (這部分的程式碼保持不變)
app_logger.info("--- 初始化「審問挑戰」遊戲 ---")
class InterrogationDummyGameManager:
    def __init__(self, db_client=None): # 確保 db_client 可以傳入
        self.db = db_client
        app_logger.warning("使用 InterrogationDummyGameManager，「審問挑戰」遊戲功能將受限。")
    def create_new_game(self, user_id, nickname): return {"error": "「審問挑戰」遊戲的 GameManager 未正確載入"}
    def get_game_state(self, game_id): return {"error": "「審問挑戰」遊戲的 GameManager 未正確載入"}
    def handle_player_action(self, game_id, msg, tone, demand): return {"error": "「審問挑戰」遊戲的 GameManager 未正確載入"}
    def get_keyword_details(self, game_id, keyword): return {"error": "「審問挑戰」遊戲的 GameManager 未正確載入"}
    def apply_cheat_code(self, game_id, code): return {"error": "「審問挑戰」遊戲的 GameManager 未正確載入"}

interrogation_game_modules_loaded = False
try:
    from game_manager import GameManager as InterrogationGameManager # 假設 game_manager.py 在同目錄
    interrogation_game_modules_loaded = True
    app_logger.info("「審問挑戰」遊戲核心模組 (game_manager.py) 成功導入。")
except ImportError as e_ig_main:
    app_logger.error(f"載入「審問挑戰」遊戲核心模組 (game_manager.py) 失敗: {e_ig_main}。")
    InterrogationGameManager = InterrogationDummyGameManager # type: ignore

# 將 main.py 中初始化的 db 傳遞給 InterrogationGameManager
interrogation_game_mgr = InterrogationGameManager(db=db)
if interrogation_game_modules_loaded:
    app_logger.info("「審問挑戰」遊戲的 GameManager 已實例化。")
else:
    app_logger.warning("「審問挑戰」遊戲的 GameManager 使用的是 Dummy 實例。")


@app.route('/') # 主路由
def home_shared():
    app_logger.info("訪問了主頁 / (共用登陸頁)")
    return jsonify({
        "message": "歡迎來到整合後端 API！",
        "available_games": {
            "interrogation_challenge": "/game/new (POST), /game/<game_id> (GET), ...",
            "monster_養成": "/api/MD/health (GET), /api/MD/game-configs (GET), ..."
        }
    })

# --- "審問挑戰" 遊戲的 API 端點 ---
# (這部分的路由保持不變)
@app.route('/game/new', methods=['POST'])
def interrogation_new_game():
    if not interrogation_game_modules_loaded or interrogation_game_mgr.__class__ == InterrogationDummyGameManager:
        return jsonify({"error": "「審問挑戰」遊戲服務暫不可用 (GameManager 未載入)。"}), 503
    data = request.get_json(silent=True)
    user_id = data.get('userId') if data else None
    officer_nickname = data.get('officerNickname') if data else "未知警官"
    try:
        game_state = interrogation_game_mgr.create_new_game(user_id, officer_nickname)
        if game_state and "error" not in game_state :
            return jsonify(game_state), 201
        else:
            error_msg = game_state.get('error', '內部錯誤') if game_state else '內部錯誤'
            return jsonify({"error": f"無法創建新遊戲 (「審問挑戰」)：{error_msg}"}), 500
    except Exception as e:
        app_logger.error(f"創建新遊戲時發生錯誤 (「審問挑戰」): {e}", exc_info=True)
        return jsonify({"error": f"創建新遊戲時發生內部伺服器錯誤 (「審問挑戰」): {str(e)}"}), 500


@app.route('/game/<game_id>', methods=['GET'])
def interrogation_get_game(game_id):
    if not interrogation_game_modules_loaded or interrogation_game_mgr.__class__ == InterrogationDummyGameManager:
        return jsonify({"error": "「審問挑戰」遊戲服務暫不可用 (GameManager 未載入)。"}), 503
    game_state = interrogation_game_mgr.get_game_state(game_id)
    if game_state: return jsonify(game_state)
    return jsonify({"error": "找不到遊戲 (「審問挑戰」)"}), 404

@app.route('/game/<game_id>/action', methods=['POST'])
def interrogation_player_action(game_id):
    if not interrogation_game_modules_loaded or interrogation_game_mgr.__class__ == InterrogationDummyGameManager:
        return jsonify({"error": "「審問挑戰」遊戲服務暫不可用 (GameManager 未載入)。"}), 503
    data = request.get_json()
    if not data: return jsonify({"error": "請求 body 為空或非 JSON 格式"}), 400
    player_message = data.get('message', '')
    player_tone = data.get('tone')
    is_demand_confession = data.get('isDemandConfession', False)
    game_state_before_action = interrogation_game_mgr.get_game_state(game_id)
    if not game_state_before_action: return jsonify({"error": "找不到遊戲 (「審問挑戰」)"}), 404
    if game_state_before_action.get("gameOver", False): return jsonify({"error": "遊戲已結束 (「審問挑戰」)"}), 400
    try:
        updated_game_state = interrogation_game_mgr.handle_player_action(game_id, player_message, player_tone, is_demand_confession)
        if "error" in updated_game_state: return jsonify(updated_game_state), 400
        return jsonify(updated_game_state)
    except Exception as e:
        app_logger.error(f"處理行動時發生錯誤 (「審問挑戰」 game_id: {game_id}): {e}", exc_info=True)
        current_state_on_error = interrogation_game_mgr.get_game_state(game_id)
        return jsonify({"error": f"處理行動時發生內部伺服器錯誤: {str(e)}", "currentGameState": current_state_on_error }), 500

@app.route('/game/<game_id>/keyword', methods=['GET'])
def interrogation_get_keyword_info(game_id):
    if not interrogation_game_modules_loaded or interrogation_game_mgr.__class__ == InterrogationDummyGameManager:
        return jsonify({"error": "「審問挑戰」遊戲服務暫不可用 (GameManager 未載入)。"}), 503
    keyword = request.args.get('keyword')
    if not keyword: return jsonify({"error": "缺少 'keyword' 查詢參數"}), 400
    game_state = interrogation_game_mgr.get_game_state(game_id)
    if not game_state: return jsonify({"error": "找不到遊戲 (「審問挑戰」)"}), 404
    if game_state.get("gameOver", False): return jsonify({"error": "遊戲已結束 (「審問挑戰」)"}), 400
    try:
        keyword_data = interrogation_game_mgr.get_keyword_details(game_id, keyword)
        if "error" in keyword_data: return jsonify(keyword_data), 404
        return jsonify(keyword_data)
    except Exception as e:
        app_logger.error(f"獲取關鍵字資訊時發生錯誤 (「審問挑戰」 game_id: {game_id}, keyword: {keyword}): {e}", exc_info=True)
        return jsonify({"error": f"獲取關鍵字資訊時發生內部伺服器錯誤: {str(e)}"}), 500

@app.route('/game/<game_id>/cheat', methods=['POST'])
def interrogation_apply_cheat(game_id):
    if not interrogation_game_modules_loaded or interrogation_game_mgr.__class__ == InterrogationDummyGameManager:
        return jsonify({"error": "「審問挑戰」遊戲服務暫不可用 (GameManager 未載入)。"}), 503
    data = request.get_json()
    if not data or 'cheat_code' not in data: return jsonify({"error": "請求 body 為空或缺少 'cheat_code'"}), 400
    cheat_code = data.get('cheat_code')
    try:
        updated_game_state = interrogation_game_mgr.apply_cheat_code(game_id, cheat_code)
        if "error" in updated_game_state:
             error_message = updated_game_state["error"]
             status_code = 400
             if "遊戲不存在" in error_message: status_code = 404
             return jsonify(updated_game_state), status_code
        return jsonify(updated_game_state)
    except Exception as e:
        app_logger.error(f"處理作弊指令時發生錯誤 (「審問挑戰」 game_id: {game_id}, code: {cheat_code}): {e}", exc_info=True)
        return jsonify({"error": f"處理作弊指令時發生內部伺服器錯誤: {str(e)}"}), 500

@app.route('/leaderboard', methods=['GET'])
def get_interrogation_game_leaderboard():
    if not firebase_initialized_successfully or not db:
        return jsonify({"error": "資料庫服務暫不可用 (Firestore 未就緒)。"}), 503
    if not interrogation_game_modules_loaded:
        return jsonify({"error": "「審問挑戰」遊戲服務暫不可用。"}), 503
    try:
        leaderboard_ref = db.collection('leaderboard') # type: ignore
        query = leaderboard_ref.order_by('rounds', direction=firestore.Query.ASCENDING).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10) # type: ignore
        results = []
        for doc in query.stream():
            entry = doc.to_dict()
            if entry is None: continue
            entry['id'] = doc.id
            if 'timestamp' in entry and hasattr(entry['timestamp'], 'isoformat'):
                entry['timestamp'] = entry['timestamp'].isoformat()
            entry.setdefault('officerNickname', '未知警官')
            entry.setdefault('achievementTitle', '無')
            results.append(entry)
        return jsonify(results), 200
    except Exception as e:
        app_logger.error(f"獲取「審問挑戰」排行榜時發生錯誤: {e}", exc_info=True)
        if "ensure this Firestore query has a composite index" in str(e) or \
           (hasattr(e, 'details') and "ensure this Firestore query has a composite index" in e.details()): # type: ignore
            error_msg = f"獲取排行榜失敗，資料庫缺少必要的複合索引。錯誤詳情: {str(e)}"
            return jsonify({"error": error_msg, "needs_firestore_index": True}), 500
        return jsonify({"error": f"獲取「審問挑戰」排行榜時發生內部錯誤: {str(e)}"}), 500

# --- 7. "AI 海龜湯" (HAIGUITANG GAME) SECTION ---
# (這部分的程式碼保持不變)
app_logger.info("--- 初始化 AI 海龜湯遊戲 ---")

class HaiguitangDummyStoryLoader:
    def __init__(self, stories_file_path=None):
        app_logger.warning("使用 HaiguitangDummyStoryLoader。")
    def get_predefined_story(self, genre): return None
    def get_available_genres(self): return []

class HaiguitangDummyGameManager:
    def __init__(self, story_loader=None): # 確保 story_loader 可以傳入
        app_logger.warning("使用 HaiguitangDummyGameManager。")
        self.story_loader = story_loader
    def start_new_game(self, genre, nickname): return {"success": False, "error": "HG GameManager未載入"}
    def get_game_public_state(self, game_id): return {"error": "HG GameManager未載入"}
    def make_guess(self, game_id, question): return {"success": False, "error": "HG GameManager未載入"}
    def attempt_to_solve(self, game_id, attempt): return {"success": False, "error": "HG GameManager未載入"}
    def apply_haiguitang_cheat_code(self, game_id, code): return {"success": False, "error": "HG GameManager未載入"}

HaiguitangStoryLoaderModule = None
HaiguitangAIModule = None
HaiguitangGameManagerModule = None

try:
    from haiguitang_story_loader import HaiguitangStoryLoader as HSL_Actual # 假設在同目錄
    HaiguitangStoryLoaderModule = HSL_Actual
    app_logger.info("AI 海龜湯故事載入器 (haiguitang_story_loader.py) 成功導入。")
except ImportError as e_hgsl:
    app_logger.error(f"無法導入 HaiguitangStoryLoader: {e_hgsl}。")
    HaiguitangStoryLoaderModule = HaiguitangDummyStoryLoader # type: ignore

try:
    import haiguitang_ai as hg_ai_module # 假設在同目錄
    HaiguitangAIModule = hg_ai_module
    app_logger.info("AI 海龜湯 AI 模組 (haiguitang_ai.py) 成功導入。")
except ImportError as e_hgai:
    app_logger.error(f"無法導入 AI 海龜湯 AI 模組 (haiguitang_ai.py): {e_hgai}。")
    # HaiguitangAIModule 保持為 None

try:
    from haiguitang_game_manager import HaiguitangGameManager as HGM_Actual # 假設在同目錄
    HaiguitangGameManagerModule = HGM_Actual
    app_logger.info("AI 海龜湯遊戲管理器 (haiguitang_game_manager.py) 成功導入。")
except ImportError as e_hgm:
    app_logger.error(f"無法導入 HaiguitangGameManager (haiguitang_game_manager.py): {e_hgm}。")
    # HaiguitangGameManagerModule 保持為 None

haiguitang_story_loader_instance = None
if HaiguitangStoryLoaderModule:
    stories_file = getattr(haiguitang_specific_config, 'PREDEFINED_STORIES_FILE_PATH', "stories.json") \
                   if haiguitang_specific_config else "stories.json"
    haiguitang_story_loader_instance = HaiguitangStoryLoaderModule(stories_file_path=stories_file)
else:
    haiguitang_story_loader_instance = HaiguitangDummyStoryLoader()

hgm = None # type: ignore
if HaiguitangGameManagerModule and haiguitang_story_loader_instance:
    try:
        # 將 main.py 中初始化的 db (如果 HaiguitangAIModule 需要) 和 AI 模組傳遞給 HaiguitangGameManager
        hgm = HaiguitangGameManagerModule( # type: ignore
            story_loader=haiguitang_story_loader_instance,
            db_client=db, # 假設 GameManager 需要 db
            ai_module=HaiguitangAIModule # 傳遞 AI 模組
            )
        app_logger.info("AI 海龜湯遊戲的 HaiguitangGameManager 已實例化。")
    except TypeError as te:
        app_logger.error(f"實例化 HaiguitangGameManager 時發生 TypeError: {te}。可能 __init__ 參數不匹配。")
        hgm = HaiguitangDummyGameManager(story_loader=haiguitang_story_loader_instance) # type: ignore
    except Exception as e_hgm_init:
        app_logger.error(f"實例化 HaiguitangGameManager 時發生其他錯誤: {e_hgm_init}", exc_info=True)
        hgm = HaiguitangDummyGameManager(story_loader=haiguitang_story_loader_instance) # type: ignore
else:
    hgm = HaiguitangDummyGameManager(story_loader=haiguitang_story_loader_instance) # type: ignore
    if not HaiguitangGameManagerModule: app_logger.warning("HG GameManager 模組未載入，使用 Dummy。")
    if not haiguitang_story_loader_instance or haiguitang_story_loader_instance.__class__ == HaiguitangDummyStoryLoader: # type: ignore
         app_logger.warning("HG StoryLoader 未正確實例化，GameManager 使用 Dummy。")


# --- "AI 海龜湯" 遊戲的 API 端點 ---
@app.route('/haiguitang/game/start', methods=['POST'])
def haiguitang_start_game():
    if not hgm or hgm.__class__ == HaiguitangDummyGameManager:
        return jsonify({"success": False, "error": "AI 海龜湯遊戲服務暫不可用 (管理器未就緒)。"}), 503
    try:
        data = request.get_json()
        if not data or 'genre' not in data:
            return jsonify({"success": False, "error": "請求中缺少 'genre' 參數。"}), 400
        genre = data['genre']
        player_nickname = data.get('nickname', "匿名海龜玩家")
        result = hgm.start_new_game(genre, player_nickname) # type: ignore
        if result and result.get("success"): return jsonify(result), 201
        else:
            error_message = result.get('error', '未知錯誤') if result else '未知錯誤'
            status_code = 502 if "AI服務" in error_message else 500
            return jsonify({"success": False, "error": error_message}), status_code
    except Exception as e:
        app_logger.error(f"啟動 AI 海龜湯遊戲時發生錯誤: {e}", exc_info=True)
        return jsonify({"success": False, "error": f"伺服器內部錯誤: {str(e)}"}), 500

@app.route('/haiguitang/game/<game_id>/state', methods=['GET'])
def haiguitang_get_game_state(game_id):
    if not hgm or hgm.__class__ == HaiguitangDummyGameManager:
        return jsonify({"error": "AI 海龜湯遊戲服務暫不可用 (管理器未就緒)。"}), 503
    try:
        state = hgm.get_game_public_state(game_id) # type: ignore
        if "error" in state: return jsonify(state), 404
        return jsonify(state), 200
    except Exception as e:
        app_logger.error(f"獲取 AI 海龜湯遊戲狀態時發生錯誤 (game_id: {game_id}): {e}", exc_info=True)
        return jsonify({"error": f"伺服器內部錯誤: {str(e)}"}), 500

@app.route('/haiguitang/game/<game_id>/guess', methods=['POST'])
def haiguitang_make_guess(game_id):
    if not hgm or hgm.__class__ == HaiguitangDummyGameManager:
        return jsonify({"success": False, "error": "AI 海龜湯遊戲服務暫不可用 (管理器未就緒)。"}), 503
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({"success": False, "error": "請求中缺少 'question' 參數。"}), 400
        player_question = data['question']
        result = hgm.make_guess(game_id, player_question) # type: ignore
        if result and result.get("success"): return jsonify(result), 200
        elif result and "error" in result:
             error_msg = result["error"]
             status_code = 500
             if "找不到" in error_msg: status_code = 404
             elif "結束" in error_msg: status_code = 400
             elif "AI 服務" in error_msg: status_code = 502
             return jsonify(result), status_code
        else:
            return jsonify({"success": False, "error": '未知內部錯誤'}), 500
    except Exception as e:
        app_logger.error(f"處理 AI 海龜湯猜測時發生錯誤 (game_id: {game_id}): {e}", exc_info=True)
        return jsonify({"success": False, "error": f"伺服器內部錯誤: {str(e)}"}), 500

@app.route('/haiguitang/game/<game_id>/solve', methods=['POST'])
def haiguitang_attempt_solve(game_id):
    if not hgm or hgm.__class__ == HaiguitangDummyGameManager:
        return jsonify({"success": False, "error": "AI 海龜湯遊戲服務暫不可用 (管理器未就緒)。"}), 503
    try:
        data = request.get_json()
        if not data or 'solution_attempt' not in data:
            return jsonify({"success": False, "error": "請求中缺少 'solution_attempt' 參數。"}), 400
        solution_attempt = data['solution_attempt']
        result = hgm.attempt_to_solve(game_id, solution_attempt) # type: ignore
        if result and result.get("success"): return jsonify(result), 200
        elif result and "error" in result:
             error_msg = result["error"]
             status_code = 404 if "找不到" in error_msg else (400 if "結束" in error_msg else 500)
             return jsonify(result), status_code
        else:
            return jsonify({"success": False, "error": result.get('error', '未知錯誤') if result else '未知錯誤'}), 500
    except Exception as e:
        app_logger.error(f"處理 AI 海龜湯解答嘗試時發生錯誤 (game_id: {game_id}): {e}", exc_info=True)
        return jsonify({"success": False, "error": f"伺服器內部錯誤: {str(e)}"}), 500

@app.route('/haiguitang/game/<game_id>/cheat', methods=['POST'])
def haiguitang_apply_cheat(game_id):
    if not hgm or hgm.__class__ == HaiguitangDummyGameManager:
        return jsonify({"success": False, "error": "AI 海龜湯遊戲服務暫不可用 (管理器未就緒)。"}), 503
    try:
        data = request.get_json()
        if not data or 'cheat_code' not in data:
            return jsonify({"success": False, "error": "請求中缺少 'cheat_code' 參數。"}), 400
        cheat_code = data['cheat_code']
        result = hgm.apply_haiguitang_cheat_code(game_id, cheat_code) # type: ignore
        if result and result.get("success"): return jsonify(result), 200
        elif result and "error" in result:
             error_msg = result["error"]
             status_code = 404 if "找不到" in error_msg else (400 if "無效" in error_msg or "結束" in error_msg else 500)
             return jsonify(result), status_code
        else:
            return jsonify({"success": False, "error": result.get('error', '未知錯誤') if result else '未知錯誤'}), 500
    except Exception as e:
        app_logger.error(f"處理 AI 海龜湯作弊碼時發生錯誤 (game_id: {game_id}, code: {cheat_code}): {e}", exc_info=True)
        return jsonify({"success": False, "error": f"伺服器內部錯誤: {str(e)}"}), 500

@app.route('/haiguitang/leaderboard/add', methods=['POST'])
def hai_gui_tang_add_score_route():
    if not HaiguitangAIModule or not hasattr(HaiguitangAIModule, 'add_score_to_leaderboard'):
        return jsonify({"error": "AI 海龜湯排行榜服務暫不可用 (AI 模組問題)。"}), 503
    if not firebase_initialized_successfully: # 確保 db 已初始化
        return jsonify({"error": "AI 海龜湯排行榜服務暫不可用 (資料庫問題)。"}), 503
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "請求 body 為空或非 JSON 格式。"}), 400

        nickname = data.get('nickname')
        rounds_taken = data.get('rounds')
        story_solution_length = data.get('story_solution_length')
        player_title_earned = data.get('title_earned')
        genre = data.get('genre')

        if not all([nickname,
                    isinstance(rounds_taken, int),
                    isinstance(story_solution_length, int),
                    player_title_earned, # 確保 player_title_earned 不是 None 或空字串
                    genre and isinstance(genre, str)]):
            return jsonify({"error": "缺少必要參數或參數類型不正確 (包含暱稱、回合、解答字數、稱號、劇本類型)。"}), 400

        result = HaiguitangAIModule.add_score_to_leaderboard( # type: ignore
            nickname=nickname,
            rounds_taken=rounds_taken,
            story_solution_length=story_solution_length,
            player_title_override=player_title_earned,
            genre=genre,
            db_client=db # 確保將 db client 傳遞給排行榜函式
        )
        if result.get("success"): return jsonify(result), 201
        else: return jsonify(result), 500
    except Exception as e:
        app_logger.error(f"新增 AI 海龜湯排行榜分數時發生錯誤: {e}", exc_info=True)
        return jsonify({"error": f"伺服器內部錯誤: {str(e)}"}), 500

@app.route('/haiguitang/leaderboard', methods=['GET'])
def hai_gui_tang_get_leaderboard_route():
    if not HaiguitangAIModule or not hasattr(HaiguitangAIModule, 'get_leaderboard_scores'):
        return jsonify({"error": "AI 海龜湯排行榜服務暫不可用 (AI 模組問題)。"}), 503
    if not firebase_initialized_successfully: # 確保 db 已初始化
        return jsonify({"error": "AI 海龜湯排行榜服務暫不可用 (資料庫問題)。"}), 503
    try:
        limit = request.args.get('limit', default=10, type=int)
        result = HaiguitangAIModule.get_leaderboard_scores(limit, db_client=db) # 確保將 db client 傳遞給排行榜函式
        if result.get("success"):
            return jsonify(result.get("leaderboard", [])), 200
        else:
            error_msg = result.get('error', '獲取排行榜時發生未知錯誤')
            if "可能缺少索引" in error_msg:
                 return jsonify({"error": f"獲取排行榜失敗，資料庫可能缺少必要的索引。詳細資訊: {error_msg}", "needs_firestore_index": True}), 500
            return jsonify({"error": error_msg}), 500
    except Exception as e:
        app_logger.error(f"獲取 AI 海龜湯排行榜時發生錯誤: {e}", exc_info=True)
        return jsonify({"error": f"伺服器內部錯誤: {str(e)}"}), 500

# --- 整合「怪獸養成 (MD)」遊戲的路由 ---
app_logger.info("--- 準備開始整合「怪獸養成 (MD)」遊戲的路由 ---")
try:
    app_logger.info("嘗試從 MD_routes 導入 md_bp...")
    from MD_routes import md_bp  # 從 MD_routes.py 導入 Blueprint
    app_logger.info("md_bp 從 MD_routes 導入成功。")

    app_logger.info("嘗試註冊 md_bp 到 Flask app...")
    app.register_blueprint(md_bp) # 註冊 Blueprint 到主 app
    app_logger.info("「怪獸養成」遊戲的 Blueprint (md_bp) 已成功註冊。")
except ImportError as e_md_routes:
    app_logger.error(f"【錯誤】載入「怪獸養成」遊戲的路由 (MD_routes.py) 失敗: {e_md_routes}", exc_info=True)
except Exception as e_reg_bp:
    app_logger.error(f"【錯誤】註冊「怪獸養成」遊戲的 Blueprint 時發生錯誤: {e_reg_bp}", exc_info=True)
app_logger.info("--- 「怪獸養成 (MD)」遊戲路由整合流程結束 ---")


# --- 8. FLASK APP RUN ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    app_logger.info(f"Flask 應用程式準備以 debug_mode={debug_mode} 在 port={port} 啟動。")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)

