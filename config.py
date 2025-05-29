# config.py

# 模擬 API 金鑰，請替換為您的真實金鑰
DEEPSEEK_API_KEY = "sk-19179bb0c0c94acaa53ca82dc1d28bbf"
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions" # 請確認此 URL 是否正確

# 應用程式相關設定
APP_SECRET_KEY = "your_strong_secret_key" # 用於 Flask session 等
```python
# utils.py
import random
from datetime import datetime, timedelta

def get_zodiac_sign(day, month):
    """根據日期和月份計算星座"""
    zodiac_signs = [
        {"sign": "摩羯座", "start_month": 12, "start_day": 22, "end_month": 1, "end_day": 19},
        {"sign": "水瓶座", "start_month": 1, "start_day": 20, "end_month": 2, "end_day": 18},
        {"sign": "雙魚座", "start_month": 2, "start_day": 19, "end_month": 3, "end_day": 20},
        {"sign": "白羊座", "start_month": 3, "start_day": 21, "end_month": 4, "end_day": 19},
        {"sign": "金牛座", "start_month": 4, "start_day": 20, "end_month": 5, "end_day": 20},
        {"sign": "雙子座", "start_month": 5, "start_day": 21, "end_month": 6, "end_day": 21},
        {"sign": "巨蟹座", "start_month": 6, "start_day": 22, "end_month": 7, "end_day": 22},
        {"sign": "獅子座", "start_month": 7, "start_day": 23, "end_month": 8, "end_day": 22},
        {"sign": "處女座", "start_month": 8, "start_day": 23, "end_month": 9, "end_day": 22},
        {"sign": "天秤座", "start_month": 9, "start_day": 23, "end_month": 10, "end_day": 23},
        {"sign": "天蠍座", "start_month": 10, "start_day": 24, "end_month": 11, "end_day": 22},
        {"sign": "射手座", "start_month": 11, "start_day": 23, "end_month": 12, "end_day": 21}
    ]
    # 處理摩羯座跨年份的情況
    if (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "摩羯座"
    for z in zodiac_signs:
        if (month == z["start_month"] and day >= z["start_day"]) or \
           (month == z["end_month"] and day <= z["end_day"]) or \
           (z["start_month"] < month < z["end_month"]) or \
           (month == z["start_month"] and month == z["end_month"] and z["start_day"] <= day <= z["end_day"]):
            # 修正邊界條件和單月星座
            if z["start_month"] == month and day >= z["start_day"]:
                 return z["sign"]
            if z["end_month"] == month and day <= z["end_day"]:
                 return z["sign"]
            if z["start_month"] < month < z["end_month"]:
                 return z["sign"]
    return "未知星座"


def get_confession_meter_text_and_color(percentage):
    """根據頑抗度百分比獲取文字描述和顏色"""
    if percentage > 80: return {"text": "態度強硬", "colorClass": "confession-color-white"}
    if percentage > 60: return {"text": "故作鎮定", "colorClass": "confession-color-green"}
    if percentage > 40: return {"text": "略顯動搖", "colorClass": "confession-color-blue"}
    if percentage > 20: return {"text": "心虛慌亂", "colorClass": "confession-color-pink"}
    if percentage > 0: return {"text": "瀕臨崩潰", "colorClass": "confession-color-red"}
    return {"text": "已然認罪", "colorClass": "confession-color-purple"}

def generate_random_suspect_name_and_gender():
    """隨機生成嫌犯姓名和性別"""
    last_names = ["李", "王", "張", "劉", "陳", "楊", "黃", "趙", "吳", "周"]
    first_names_male = ["偉", "強", "磊", "軍", "勇", "傑", "濤", "明", "超", "鵬"]
    first_names_female = ["芳", "娜", "敏", "靜", "麗", "豔", "丹", "萍", "婷", "雪"]
    
    last_name = random.choice(last_names)
    gender = random.choice(["男性", "女性"])
    first_name = random.choice(first_names_male) if gender == "男性" else random.choice(first_names_female)
    return {"name": last_name + first_name, "gender": gender}

def clean_ai_json_response(raw_response):
    """清理 AI 可能返回的非標準 JSON 字串"""
    if not isinstance(raw_response, str):
        return None
    
    str_response = raw_response.strip()
    
    # 嘗試移除常見的 markdown 格式
    if str_response.startswith("```json"):
        str_response = str_response[7:]
        if str_response.endswith("```"):
            str_response = str_response[:-3]
    elif str_response.startswith("```"):
        str_response = str_response[3:]
        if str_response.endswith("```"):
            str_response = str_response[:-3]
            
    str_response = str_response.strip()
    
    # 確保是從 '{' 開始，到 '}' 結束
    first_brace = str_response.find('{')
    last_brace = str_response.rfind('}')
    
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return str_response[first_brace : last_brace + 1]
    
    # 如果沒有大括號，可能不是有效的 JSON，或者 AI 返回了純文字
    # 在這種情況下，我們可能需要根據 API 的具體行為來決定如何處理
    # 這裡暫時返回清理後的字串，讓調用者決定
    return str_response

```python
# data_generators.py
import random
import json
import requests # 用於實際 API 呼叫
from datetime import datetime, timedelta
from utils import get_zodiac_sign, generate_random_suspect_name_and_gender, clean_ai_json_response
from config import DEEPSEEK_API_KEY, DEEPSEEK_API_URL

class AIIntegration:
    """處理與外部 AI (如 DeepSeek) 的互動"""

    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.api_url = DEEPSEEK_API_URL

    def call_deepseek_api(self, system_prompt, user_prompt, is_json_response=False):
        """
        實際呼叫 DeepSeek API 的方法。
        注意：這是一個簡化的版本，您可能需要根據 DeepSeek 的具體 API 文件調整。
        """
        if not self.api_key or self.api_key == "YOUR_DEEPSEEK_API_KEY_HERE":
            print("警告：DeepSeek API 金鑰未設定。將返回模擬數據。")
            return self._get_mock_response(system_prompt, user_prompt, is_json_response)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "model": "deepseek-chat", # 或其他適用模型
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False
        }
        if is_json_response:
             # 某些模型支援強制 JSON 輸出，可以查閱 DeepSeek 文件
             # payload["response_format"] = {"type": "json_object"}
             pass


        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()  # 如果 HTTP 狀態碼是 4xx 或 5xx，則拋出異常
            
            result = response.json()
            
            if result.get("choices") and result["choices"][0].get("message") and result["choices"][0]["message"].get("content"):
                content = result["choices"][0]["message"]["content"]
                if is_json_response:
                    return clean_ai_json_response(content)
                return content
            else:
                print(f"錯誤：DeepSeek API 返回非預期結構: {result}")
                return self._get_mock_response(system_prompt, user_prompt, is_json_response, error_message="API 結構錯誤")

        except requests.exceptions.RequestException as e:
            print(f"錯誤：呼叫 DeepSeek API 失敗: {e}")
            return self._get_mock_response(system_prompt, user_prompt, is_json_response, error_message=str(e))
        except json.JSONDecodeError as e:
            print(f"錯誤：解析 DeepSeek API JSON 回應失敗: {e}")
            # 嘗試返回原始文本，如果它看起來像 JSON 但解析失敗
            raw_text = response.text if 'response' in locals() else "無原始文本"
            if is_json_response:
                 cleaned = clean_ai_json_response(raw_text)
                 if cleaned: return cleaned # 嘗試返回清理後的
            return self._get_mock_response(system_prompt, user_prompt, is_json_response, error_message=f"JSON 解析錯誤: {raw_text[:200]}")


    def _get_mock_response(self, system_prompt, user_prompt, is_json_response, error_message=None):
        """生成模擬 AI 回應，用於未設定 API 金鑰或 API 呼叫失敗時"""
        print(f"系統提示: {system_prompt[:100]}...")
        print(f"用戶提示: {user_prompt[:100]}...")
        
        if error_message:
            print(f"模擬回應原因: {error_message}")

        if "生成一段豐富的個性概述" in system_prompt:
            return "此人性格內向，不善言辭，但觀察力敏銳。面對壓力時可能選擇沉默或逃避。重視家庭，或許可以從親情角度尋找突破口。"
        elif "生成一個新的謀殺案情節" in system_prompt:
            mock_json = {
                "autopsyReport": "被害者王大明，男性，約45歲，死於頭部鈍器重擊。死亡時間約為昨晚10點至12點之間。現場位於其書房，有明顯掙扎痕跡。##書桌上的古董檯燈##似乎是兇器。",
                "evidence": [
                    {"text": "在##古董檯燈##底部發現模糊指紋，非被害者所有。", "id": "ev_mock_1"},
                    {"text": "鄰居稱昨晚約11點聽到被害者家中傳出激烈爭吵聲，似乎是##男女混雜的聲音##。", "id": "ev_mock_2"},
                    {"text": "嫌犯##李小華##的手機定位顯示其昨晚10點半至11點半之間在被害者家附近。", "id": "ev_mock_3"}
                ],
                "doubts": [
                    {"text": "嫌犯##李小華##聲稱昨晚獨自在家看電影，但無法提供具體電影名稱或細節。", "id": "db_mock_1"},
                    {"text": "據查，嫌犯與被害者有##大額金錢往來##，且近期關係緊張。", "id": "db_mock_2"}
                ]
            }
            return json.dumps(mock_json, ensure_ascii=False) if is_json_response else str(mock_json)
        elif "你是偵訊遊戲中的開場警官" in system_prompt:
            return "李小華，我們現在就一起謀殺案對你進行詢問。根據法律，你有權保持緘默，但你所說的一切都可能成為呈堂證供。你也有權聘請律師在場陪同。"
        elif "你是謀殺案嫌犯" in system_prompt and "開場陳述" in user_prompt : # 嫌犯對開場白的回應
             return "警官，我不明白你們在說什麼。我是清白的，我相信法律會還我公道。無罪推定不是嗎？(嘆氣)"
        elif "你是謀殺案嫌犯" in system_prompt: # 嫌犯一般回應
            return "我不知道你在說什麼。@@那晚@@我真的在家。"
        elif "提供偵訊技巧提示" in system_prompt:
            return "觀察嫌犯的微表情，尋找破綻。"
        elif "判斷當偵訊員直接『要求認罪』時" in system_prompt: # 要求認罪
            mock_json = {"confess": False, "defiantResponse": "你少在那邊想套我話了！我什麼都沒做！"}
            return json.dumps(mock_json, ensure_ascii=False) if is_json_response else str(mock_json)
        elif "補充資訊或線索" in system_prompt: # 關鍵字補充
            return f"關於用戶提到的關鍵字，警方正在進一步調查，目前尚無線索。"
        elif "生成一個描述嫌犯當前外在表現的JSON對象" in system_prompt:
            mock_json = {
                "facialExpression": "眼神閃爍，不敢直視",
                "bodyLanguage": "雙手緊握，微微顫抖",
                "microAction": "頻繁吞嚥口水",
                "voiceTone": "聲音略顯沙啞，帶有緊張"
            }
            return json.dumps(mock_json, ensure_ascii=False) if is_json_response else str(mock_json)
        
        return "AI 模擬回應：無法理解請求。" if not is_json_response else json.dumps({"error": "無法理解請求"})


class DataGenerator:
    """負責生成遊戲數據，如嫌犯、案件等"""

    def __init__(self):
        self.ai_integration = AIIntegration()

    def generate_initial_suspect_details(self, name_gender_info):
        """生成嫌犯的詳細初始資料"""
        name = name_gender_info["name"]
        gender = name_gender_info["gender"]
        
        # 年齡 (18-55)
        birth_year_offset = random.randint(18, 55)
        birth_date_obj = datetime.now() - timedelta(days=birth_year_offset * 365 + random.randint(0, 364))
        age = datetime.now().year - birth_date_obj.year
        dob_str = birth_date_obj.strftime("%Y年%m月%d日")
        zodiac = get_zodiac_sign(birth_date_obj.day, birth_date_obj.month)
        
        blood_types = ["A型", "B型", "AB型", "O型"]
        educations = ["國中畢業", "高中職畢業", "專科學校", "大學畢業", "大學肄業", "碩士畢業", "博士班研究"]
        birthplaces = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "嘉義市"]
        occupations = ["辦公室職員", "工程師", "教師", "服務生", "計程車司機", "自由工作者", "待業中", "學生"]
        health_conditions = ["大致良好", "輕微高血壓", "過敏體質", "偶發性偏頭痛", "睡眠品質不佳"]
        mannerisms = ["嗯...", "那個...", "對啊。", "蛤？", "隨便啦。", "我跟你說喔...", "啊就...", "是不是？", "無"]

        suspect_profile = {
            "name": name,
            "gender": gender,
            "age": age,
            "dob": dob_str,
            "zodiac": zodiac,
            "bloodType": random.choice(blood_types),
            "education": random.choice(educations),
            "birthplace": random.choice(birthplaces),
            "occupation": random.choice(occupations),
            "healthStatus": random.choice(health_conditions),
            "mannerism": random.choice(mannerisms),
            "heartRate": random.randint(65, 85),
            "bloodPressure": f"{random.randint(110, 130)}/{random.randint(70, 85)}",
        }

        # 生成個性概述 (透過 AI)
        system_personality_prompt = "你是一位遊戲NPC設計師。請根據以下提供的嫌犯詳細資料，生成一段豐富且多面向的個性概述（約80-120字，包含多個方面）。這段描述將作為偵訊技巧的關鍵參考，暗示嫌犯可能的弱点或應對方式，並影響其在被要求認罪時的決定。不要包含任何額外的說明、標籤或JSON格式。請務必使用繁體中文回答。"
        user_personality_prompt = f"為以下背景的審問遊戲嫌犯 {name} 生成一段豐富的個性概述：\n年紀：{age}歲\n性別：{gender}\n星座：{zodiac}\n血型：{suspect_profile['bloodType']}\n學歷：{suspect_profile['education']}\n出生地：{suspect_profile['birthplace']}\n職業：{suspect_profile['occupation']}\n健康狀態：{suspect_profile['healthStatus']}\n口頭禪：{suspect_profile['mannerism']}\n\n請綜合以上所有資訊，描寫一個立體的角色個性。請務必使用繁體中文回答。"
        
        personality_response = self.ai_integration.call_deepseek_api(system_personality_prompt, user_personality_prompt)
        suspect_profile["personality"] = personality_response.strip().replace("```json", "").replace("```", "") if personality_response else "性格複雜，需謹慎應對。"
        
        # 生成初始外在表現 (透過 AI)
        initial_observables = self.generate_suspect_observable_state_internal(suspect_profile, "遊戲剛開始，偵訊室氣氛嚴肅。")
        suspect_profile.update(initial_observables)
        
        return suspect_profile

    def generate_new_case_details(self, suspect_name, suspect_gender, suspect_age):
        """生成新的案件詳情 (透過 AI)"""
        system_prompt = "你是一個專門生成JSON格式案件劇情的AI。你的任務是為一個審問遊戲生成一個全新的謀殺案概要。你的回應必須**僅僅是**一個合法的JSON對象，包含三個頂層鍵：'autopsyReport' (字串), 'evidence' (字串陣列), 'doubts' (字串陣列)。在 'evidence' 和 'doubts' 的字串中，若提及具體的物品、地點、時間或事件，請用 ## 將其包裹起來。**絕對不要**在JSON對象之外包含任何文字。請務必使用繁體中文回答。"
        user_prompt = f"生成一個新的謀殺案情節。嫌犯是 {suspect_name} ({suspect_gender}, {suspect_age}歲)。請確保案件有基本邏輯性，證據和疑點要有關聯性。死因請多樣化。請務必使用繁體中文回答。"
        
        raw_response = self.ai_integration.call_deepseek_api(system_prompt, user_prompt, is_json_response=True)
        
        try:
            case_data = json.loads(raw_response)
            if isinstance(case_data, dict) and \
               'autopsyReport' in case_data and \
               isinstance(case_data.get('evidence'), list) and \
               isinstance(case_data.get('doubts'), list):
                # 給證據和疑點加上 ID
                case_data['evidence'] = [{"text": item, "id": f"ev_gen_{i}"} for i, item in enumerate(case_data['evidence'])]
                case_data['doubts'] = [{"text": item, "id": f"db_gen_{i}"} for i, item in enumerate(case_data['doubts'])]
                return case_data
        except (json.JSONDecodeError, TypeError) as e:
            print(f"錯誤：解析案件詳情 JSON 失敗: {e}，原始回應: {raw_response}")

        # 如果 AI 回應失敗或格式錯誤，返回預設案件
        return {
            "autopsyReport": f"被害者趙六，死於家中，初步判斷為他殺，死亡時間約為昨晚。現場發現 ##一把沾血的剪刀##。",
            "evidence": [{"text": "在被害者附近找到一把 ##沾血的剪刀##。", "id": "ev_fallback_1"}],
            "doubts": [{"text": f"嫌犯 {suspect_name} 聲稱當時獨自在家。", "id": "db_fallback_1"}]
        }

    def generate_opening_dialogue(self, suspect_name, suspect_personality, suspect_mannerism, case_autopsy_report_summary):
        """生成警官開場白和嫌犯初步回應 (透過 AI)"""
        dialogues = []
        
        # 警官開場白
        officer_system_prompt = "你是偵訊遊戲中的開場警官。你的任務是簡述案情並告知嫌犯權利。請務必使用繁體中文回答。"
        officer_user_prompt = f"向嫌犯 {suspect_name} 簡述偵查案件（基於以下案情概要：{case_autopsy_report_summary[:50]}...）並告知其在台灣法律下的基本權利（你有權保持緘默；有權選任辯護人；你所說的一切都可能作為證據）。請直接給出完整的開場陳述，語氣嚴肅而專業。請務必使用繁體中文回答。"
        officer_opening_text = self.ai_integration.call_deepseek_api(officer_system_prompt, officer_user_prompt)
        
        if officer_opening_text and not officer_opening_text.startswith("AI (DS) Error"):
            dialogues.append({"speaker": "警官", "text": officer_opening_text, "tone": "平緩"})
        else:
            dialogues.append({"speaker": "警官", "text": f"{suspect_name}，我們就一宗謀殺案向你進行詢問。你有權保持緘默，所說的話將可能成為證據。你也有權聘請律師。", "tone": "平緩"})

        # 嫌犯回應
        suspect_rebuttal_system_prompt = f"你是謀殺案嫌犯 {suspect_name} (個性: {suspect_personality}, 口頭禪: {suspect_mannerism})。你剛聽完警官的開場陳述及權利告知。請務必使用繁體中文回答，並在回應中適當自然地使用你的口頭禪（如果有的話）。"
        suspect_rebuttal_user_prompt = "針對警官的開場陳述，生成一段簡短的狡辯回應，並提及台灣法律的無罪推定原則。請務必使用繁體中文回答。"
        suspect_rebuttal_text = self.ai_integration.call_deepseek_api(suspect_rebuttal_system_prompt, suspect_rebuttal_user_prompt)

        if suspect_rebuttal_text and not suspect_rebuttal_text.startswith("AI (DS) Error"):
            dialogues.append({"speaker": "AI", "text": suspect_rebuttal_text})
        else:
            dialogues.append({"speaker": "AI", "text": "警官，我不明白。我是清白的，法律不是說無罪推定嗎？"})
            
        return dialogues

    def generate_interrogation_tip(self, suspect_name, suspect_personality, suspect_mannerism, confession_meter_text):
        """生成偵訊提示 (透過 AI)"""
        system_prompt = "你是資深偵探，提供偵訊技巧提示。請務必使用繁體中文回答。你的提示庫應包含至少30種不同的技巧，並根據以下資訊選擇一個合適且盡量不重複的、簡短扼要的提示（一句話，不超過20字）。"
        user_prompt = f"根據目前嫌犯 {suspect_name} 的個性（{suspect_personality}）、口頭禪（{suspect_mannerism}）和頑抗度（{confession_meter_text}），提供一句簡短扼要的偵訊技巧提示。請務必使用繁體中文回答。"
        tip = self.ai_integration.call_deepseek_api(system_prompt, user_prompt)
        
        if tip and not tip.startswith("AI (DS) Error"):
            return tip[:30] # 限制長度
        return "保持冷靜，觀察細節。"


    def get_ai_response_to_player(self, game_state, player_message, is_demand_confession=False):
        """獲取 AI 對玩家訊息的回應 (透過 AI)"""
        suspect = game_state["suspect"]
        case_details = game_state["caseDetails"]
        
        evidence_text = "；".join([e["text"].replace("##", "") for e in case_details["evidence"]])
        doubts_text = "；".join([d["text"].replace("##", "") for d in case_details["doubts"]])

        system_prompt = ""
        user_prompt = ""

        if is_demand_confession:
            system_prompt = f"""你是遊戲中的嫌犯AI決策模組。根據以下嫌犯資料和當前情況，判斷当偵訊員直接『要求認罪』時，嫌犯是否會認罪。你的回答必須是 JSON 格式，只有一個鍵 'confess'，其值為布林值 (true 或 false)。如果判斷為不認罪 (false)，請同時提供一個 'defiantResponse' 鍵，其值為一段簡短、符合嫌犯個性的繁體中文抗拒回應（可適當加入嫌犯口頭禪 "{suspect['mannerism']}"，若口頭禪為"無"則忽略）。請務必使用繁體中文思考並回應。
嫌犯資料：
姓名：{suspect['name']}，個性概述：{suspect['personality']}，口頭禪: {suspect['mannerism']}
目前頑抗度：{game_state['confessionMeter']}% ({utils.get_confession_meter_text_and_color(game_state['confessionMeter'])['text']})
情境：偵訊員剛剛非常強硬地『要求你立刻認罪』。
考量因素：年紀較輕、社會經驗不足、個性膽小者，在頑抗度較低時更容易屈服。年紀較大、有社會歷練、個性頑固或大膽者，即使頑抗度稍低，也可能繼續抵抗。
請判斷是否認罪，並以JSON格式輸出。"""
            user_prompt = "偵訊員要求認罪，我該認嗎？請以JSON格式 {'confess': boolean, 'defiantResponse': '若不認罪時的簡短回應'} 回答。"
            
            raw_response = self.ai_integration.call_deepseek_api(system_prompt, user_prompt, is_json_response=True)
            try:
                decision = json.loads(raw_response)
                if isinstance(decision, dict) and 'confess' in decision:
                    return decision
            except (json.JSONDecodeError, TypeError) as e:
                print(f"錯誤：解析 AI 認罪決定 JSON 失敗: {e}，回應: {raw_response}")
            # Fallback
            return {"confess": (game_state["confessionMeter"] < 15), "defiantResponse": "你少在那邊想套我話了！"}

        else: # 一般提問
            system_prompt = f"""你是謀殺案嫌犯 {suspect['name']} (個性: {suspect['personality']}, 口頭禪: {suspect['mannerism']}, 健康狀態: {suspect['healthStatus']})。
你目前的頑抗度被描述為「{utils.get_confession_meter_text_and_color(game_state['confessionMeter'])['text']}」。
生理狀態：心率 {suspect['heartRate']} bpm，血壓 {suspect['bloodPressure']}。
外在表現：表情 {suspect['facialExpression']}，肢體 {suspect['bodyLanguage']}，微動作 {suspect.get('microAction', '無明顯')}，語氣 {suspect['voiceTone']}。
你的主要目標是針對玩家的提問進行直接、簡潔的回應，盡可能不洩露過多資訊，除非你的頑抗度很低（例如低於30）或情緒變得非常不穩定，那時才可能開始多話、語無倫次或試圖轉移話題。
如果你的口頭禪不是"無"，請在對話中自然地（但不要過於頻繁）使用它。
如果你的情緒變得激動、慌亂或試圖胡言亂語，你可以用多個簡短的對話框來回應（用 "||" 分隔每個對話框的內容）。
回答時，如果提到案件相關的關鍵物品或地點，請在該詞彙前後加上 @@，例如 @@槌子@@。
你的回答應該簡潔有力，除非特定情境下需要展現慌亂。請務必使用繁體中文回答。"""
            user_prompt = f"目前對你不利的證據有：{evidence_text}。調查人員對你的疑點是：{doubts_text}。審問者（玩家）用「{game_state['selectedTone']}」的語氣問你：「{player_message}」。請務必使用繁體中文回答。"
            
            response_text = self.ai_integration.call_deepseek_api(system_prompt, user_prompt)
            if response_text and not response_text.startswith("AI (DS) Error"):
                return response_text.split("||") # 允許多個對話框
            return ["我不知道你在說什麼。"]


    def get_keyword_info(self, keyword):
        """獲取關鍵字補充資訊 (透過 AI)"""
        system_prompt = "你是一位偵探助手，提供案件線索。請務必使用繁體中文回答。"
        user_prompt = f"在一個謀殺案的審問情境中，提到了關鍵字「{keyword}」。請針對這個關鍵字，提供一段簡短（約30-50字）的補充資訊或線索，這段資訊應該對玩家（審問者）有所幫助。請直接給出補充資訊，不要有額外的開頭或結尾。請務必使用繁體中文回答。"
        info = self.ai_integration.call_deepseek_api(system_prompt, user_prompt)
        
        if info and not info.startswith("AI (DS) Error"):
            return info
        return f"關於「{keyword}」的更多資訊目前無法取得。"

    def generate_suspect_observable_state_internal(self, suspect_profile, last_ai_message=""):
        """內部使用：生成嫌犯外在表現 (透過 AI)"""
        system_prompt = "你是一個專門輸出JSON的AI。你的任務是根據提供的資訊，生成一個描述嫌犯當前外在表現的JSON對象。**絕對不要**在JSON對象之外包含任何文字。你的回應必須**僅僅是**一個合法的JSON對象。請務必使用繁體中文回答所有描述性的值。"
        user_prompt = f"""嫌犯 {suspect_profile['name']} (個性: {suspect_profile['personality']})。
目前心率: {suspect_profile['heartRate']} bpm，血壓: {suspect_profile['bloodPressure']} mmHg。
頑抗度描述為「{utils.get_confession_meter_text_and_color(suspect_profile.get('confessionMeter', 100))['text']}」。
他剛剛說了 (或被問了): "{last_ai_message or '偵訊剛開始'}"。
請生成一個合法的JSON對象，包含以下四個鍵值對，每個值都是一段簡短的描述 (每項約5-10字):
"facialExpression": (例如："嘴角微微抽動")
"bodyLanguage": (例如："雙手緊握放在桌上")
"microAction": (例如："手指不自覺地輕敲桌面")
"voiceTone": (例如："語氣平淡，聽不出情緒")。
請務必使用繁體中文回答所有描述性的值。"""

        raw_response = self.ai_integration.call_deepseek_api(system_prompt, user_prompt, is_json_response=True)
        try:
            observables = json.loads(raw_response)
            if isinstance(observables, dict) and all(k in observables for k in ["facialExpression", "bodyLanguage", "microAction", "voiceTone"]):
                return observables
        except (json.JSONDecodeError, TypeError) as e:
            print(f"錯誤：解析外在表現 JSON 失敗: {e}，回應: {raw_response}")
        
        return {"facialExpression": "鎮定自若", "bodyLanguage": "姿態放鬆", "microAction": "無明顯", "voiceTone": "語氣平穩"}

    def generate_game_analysis(self, game_state):
        """遊戲結束後生成分析報告 (透過 AI)"""
        dialogue_summary = "\n".join([f"{msg['speaker']}: {msg['text'][:50]}..." for msg in game_state["dialogueHistory"][-10:]]) # 最近10條對話摘要
        suspect = game_state["suspect"]
        
        system_prompt = "你是案件分析員，負責在審問遊戲結束後提供心理攻防分析。你的回應必須是 JSON 格式，包含四個鍵：'interrogationStyle', 'techniqueAnalysis', 'playerPersonalityTrait', 'achievementTitle'。每個鍵的值都是一段文字描述。**絕對不要**在JSON對象之外包含任何文字。請務必使用繁體中文回答。"
        user_prompt = f"""審問遊戲已結束。嫌犯 {suspect['name']} { '已認罪' if game_state['confessionMeter'] <= 0 else '未認罪'}。總共耗費 {game_state['round']} 回合。頑抗度最終為 {utils.get_confession_meter_text_and_color(game_state['confessionMeter'])['text']} ({game_state['confessionMeter']}%）。
嫌犯個性為：{suspect['personality']}。
部分對話記錄摘要：
{dialogue_summary}
請根據以上資訊，生成JSON格式的心理攻防分析。請務必使用繁體中文回答。"""

        raw_response = self.ai_integration.call_deepseek_api(system_prompt, user_prompt, is_json_response=True)
        try:
            analysis_data = json.loads(raw_response)
            if isinstance(analysis_data, dict) and all(k in analysis_data for k in ['interrogationStyle', 'techniqueAnalysis', 'playerPersonalityTrait', 'achievementTitle']):
                return analysis_data
        except (json.JSONDecodeError, TypeError) as e:
            print(f"錯誤：解析遊戲分析 JSON 失敗: {e}，回應: {raw_response}")

        return {
            "interrogationStyle": "分析生成失敗。",
            "techniqueAnalysis": "請檢查API連線或提示詞。",
            "playerPersonalityTrait": "未能分析。",
            "achievementTitle": "偵訊新手"
        }

```python
# game_manager.py
import uuid
import random
from datetime import datetime
from data_generators import DataGenerator, generate_random_suspect_name_and_gender
from utils import get_confession_meter_text_and_color

class GameManager:
    """管理遊戲的核心邏輯和狀態"""

    def __init__(self):
        self.games = {}  # 儲存活躍遊戲的狀態，以 game_id 為鍵
        self.data_generator = DataGenerator()

    def _get_default_game_state(self):
        """返回一個預設的遊戲狀態結構"""
        name_gender_info = generate_random_suspect_name_and_gender()
        initial_suspect_details = self.data_generator.generate_initial_suspect_details(name_gender_info)
        
        case_details = self.data_generator.generate_new_case_details(
            initial_suspect_details["name"],
            initial_suspect_details["gender"],
            initial_suspect_details["age"]
        )
        
        opening_dialogues = self.data_generator.generate_opening_dialogue(
            initial_suspect_details["name"],
            initial_suspect_details["personality"],
            initial_suspect_details["mannerism"],
            case_details["autopsyReport"]
        )

        initial_tip = self.data_generator.generate_interrogation_tip(
            initial_suspect_details["name"],
            initial_suspect_details["personality"],
            initial_suspect_details["mannerism"],
            get_confession_meter_text_and_color(100)['text'] # 初始頑抗度
        )

        return {
            "gameId": str(uuid.uuid4()),
            "userId": None, # 可由前端傳入或後端生成
            "round": 0,
            "confessionMeter": 100,
            "suspect": initial_suspect_details,
            "caseDetails": case_details,
            "dialogueHistory": opening_dialogues,
            "selectedTone": "平緩",
            "gameOver": False,
            "gameAnalysis": {"interrogationStyle": "", "techniqueAnalysis": "", "playerPersonalityTrait": "", "achievementTitle": ""},
            "interrogationTip": initial_tip,
            "createdAt": datetime.utcnow().isoformat(),
            "lastUpdatedAt": datetime.utcnow().isoformat()
        }

    def create_new_game(self, user_id=None):
        """創建一個新遊戲"""
        game_state = self._get_default_game_state()
        if user_id:
            game_state["userId"] = user_id
        
        self.games[game_state["gameId"]] = game_state
        print(f"新遊戲已創建: {game_state['gameId']}，嫌犯: {game_state['suspect']['name']}")
        return game_state

    def get_game_state(self, game_id):
        """獲取指定遊戲的狀態"""
        return self.games.get(game_id)

    def _update_suspect_status(self, game_state, last_ai_message=""):
        """更新嫌犯的生理狀態和外在表現"""
        suspect = game_state["suspect"]
        
        # 模擬心率和血壓變化
        hr_change = random.randint(-5, 10) if game_state["confessionMeter"] < 50 else random.randint(-5, 5)
        suspect["heartRate"] = max(60, min(140, suspect["heartRate"] + hr_change))
        
        bp = [int(x) for x in suspect["bloodPressure"].split('/')]
        bp_sys_change = random.randint(-5, 10) if game_state["confessionMeter"] < 50 else random.randint(-5, 5)
        bp_dia_change = random.randint(-3, 6) if game_state["confessionMeter"] < 50 else random.randint(-3, 3)
        bp[0] = max(90, min(190, bp[0] + bp_sys_change))
        bp[1] = max(60, min(120, bp[1] + bp_dia_change))
        suspect["bloodPressure"] = f"{bp[0]}/{bp[1]}"

        # 更新外在表現 (透過 AI)
        # 為了避免在 game_state 中直接傳遞 confessionMeter 給 generate_suspect_observable_state_internal
        # 我們可以複製一份 suspect_profile 並加入 confessionMeter
        temp_suspect_profile_for_ai = suspect.copy()
        temp_suspect_profile_for_ai['confessionMeter'] = game_state['confessionMeter']

        new_observables = self.data_generator.generate_suspect_observable_state_internal(
            temp_suspect_profile_for_ai, # 使用包含 confessionMeter 的臨時副本
            last_ai_message
        )
        suspect.update(new_observables)
        game_state["lastUpdatedAt"] = datetime.utcnow().isoformat()


    def handle_player_action(self, game_id, player_message, player_tone, is_demand_confession=False):
        """處理玩家的行動 (提問或要求認罪)"""
        game_state = self.get_game_state(game_id)
        if not game_state or game_state["gameOver"]:
            return {"error": "遊戲不存在或已結束"}

        game_state["round"] += 1
        game_state["selectedTone"] = player_tone
        
        # 記錄玩家行動
        action_text = "偵訊員要求立即認罪！" if is_demand_confession else player_message
        game_state["dialogueHistory"].append({"speaker": "Player", "text": action_text, "tone": player_tone})

        # 獲取 AI 回應
        ai_responses_data = self.data_generator.get_ai_response_to_player(
            game_state, player_message, is_demand_confession
        )

        if is_demand_confession:
            if ai_responses_data.get("confess") is True:
                game_state["confessionMeter"] = 0
                game_state["dialogueHistory"].append({"speaker": "AI", "text": f"{game_state['suspect']['name']}: ...好吧，我承認...是我做的。"})
                return self._handle_confession(game_id) # 遊戲結束
            else:
                response_text = ai_responses_data.get("defiantResponse", "你休想套我話！")
                game_state["dialogueHistory"].append({"speaker": "AI", "text": response_text})
                self._update_suspect_status(game_state, response_text)
        else: # 一般提問
            last_ai_message_for_status_update = ""
            for response_part in ai_responses_data: # ai_responses_data 可能是個列表
                game_state["dialogueHistory"].append({"speaker": "AI", "text": response_part})
                last_ai_message_for_status_update += response_part + " "
            
            # 更新頑抗度 (簡化邏輯)
            decrease = random.randint(3, 12)
            if player_tone == "挑釁" and random.random() < 0.4: decrease += 5
            if player_tone == "憤怒" and random.random() < 0.2: decrease -= 3
            if len(player_message) > 30 and random.random() < 0.3: decrease += 3
            
            game_state["confessionMeter"] = max(0, game_state["confessionMeter"] - decrease)

            if game_state["confessionMeter"] <= 0:
                game_state["dialogueHistory"].append({"speaker": "AI", "text": f"{game_state['suspect']['name']}: ...我...我受不了了...是我做的..."})
                return self._handle_confession(game_id) # 遊戲結束
            else:
                self._update_suspect_status(game_state, last_ai_message_for_status_update.strip())
        
        # 更新偵訊提示
        game_state["interrogationTip"] = self.data_generator.generate_interrogation_tip(
            game_state["suspect"]["name"],
            game_state["suspect"]["personality"],
            game_state["suspect"]["mannerism"],
            get_confession_meter_text_and_color(game_state["confessionMeter"])['text']
        )
        game_state["lastUpdatedAt"] = datetime.utcnow().isoformat()
        return game_state

    def _handle_confession(self, game_id):
        """處理嫌犯認罪，結束遊戲"""
        game_state = self.get_game_state(game_id)
        if not game_state: return {"error": "遊戲不存在"}

        game_state["gameOver"] = True
        game_state["confessionMeter"] = 0 # 確保為0
        
        # 生成遊戲分析
        game_state["gameAnalysis"] = self.data_generator.generate_game_analysis(game_state)
        game_state["lastUpdatedAt"] = datetime.utcnow().isoformat()
        print(f"遊戲 {game_id} 結束，嫌犯已認罪。")
        return game_state

    def get_keyword_details(self, game_id, keyword):
        """獲取關鍵字的補充資訊"""
        game_state = self.get_game_state(game_id)
        if not game_state:
            return {"error": "遊戲不存在"}
        
        info = self.data_generator.get_keyword_info(keyword)
        return {"keyword": keyword, "information": info}

```python
# main.py
from flask import Flask, request, jsonify
from flask_cors import CORS # 用於處理跨域請求
from game_manager import GameManager
from config import APP_SECRET_KEY
import utils # 確保 utils 被導入，即使 Flask 看似沒直接用它

app = Flask(__name__)
app.secret_key = APP_SECRET_KEY
CORS(app) # 允許所有來源的跨域請求，生產環境中應更嚴格配置

game_mgr = GameManager()

@app.route('/')
def home():
    return "審問挑戰遊戲後端 API"

@app.route('/game/new', methods=['POST'])
def new_game():
    """
    開始一個新遊戲
    可以選擇性地在請求 body 中傳入 'user_id'
    """
    data = request.get_json(silent=True) # silent=True 避免在沒有 JSON body 時拋錯
    user_id = data.get('userId') if data else None
    
    try:
        game_state = game_mgr.create_new_game(user_id)
        if game_state:
            return jsonify(game_state), 201
        else:
            # 這種情況理論上不應發生，除非 _get_default_game_state 內部有問題
            return jsonify({"error": "無法創建新遊戲，內部錯誤"}), 500
    except Exception as e:
        app.logger.error(f"創建新遊戲時發生錯誤: {e}", exc_info=True)
        return jsonify({"error": f"創建新遊戲時發生內部伺服器錯誤: {str(e)}"}), 500


@app.route('/game/<game_id>', methods=['GET'])
def get_game(game_id):
    """獲取指定遊戲的當前狀態"""
    game_state = game_mgr.get_game_state(game_id)
    if game_state:
        return jsonify(game_state)
    return jsonify({"error": "找不到遊戲"}), 404

@app.route('/game/<game_id>/action', methods=['POST'])
def player_action(game_id):
    """
    處理玩家的行動 (提問或要求認罪)
    請求 body 應包含:
    {
        "message": "你的問題...", (如果不是要求認罪)
        "tone": "平緩" | "憤怒" | "挑釁",
        "isDemandConfession": true | false (可選，預設 false)
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "請求 body 為空或非 JSON 格式"}), 400

    player_message = data.get('message', '')
    player_tone = data.get('tone')
    is_demand_confession = data.get('isDemandConfession', False)

    if not player_tone:
        return jsonify({"error": "缺少 'tone' 參數"}), 400
    if not is_demand_confession and not player_message:
         return jsonify({"error": "非要求認罪時，缺少 'message' 參數"}), 400


    game_state = game_mgr.get_game_state(game_id)
    if not game_state:
        return jsonify({"error": "找不到遊戲"}), 404
    if game_state.get("gameOver", False):
        return jsonify({"error": "遊戲已結束", "gameState": game_state}), 400 # 返回遊戲狀態供前端參考

    try:
        updated_game_state = game_mgr.handle_player_action(game_id, player_message, player_tone, is_demand_confession)
        if "error" in updated_game_state: # GameManager 可能返回錯誤
             return jsonify(updated_game_state), 400 # 或其他適當的狀態碼
        return jsonify(updated_game_state)
    except Exception as e:
        app.logger.error(f"處理玩家行動時發生錯誤 (遊戲ID: {game_id}): {e}", exc_info=True)
        # 嘗試返回當前遊戲狀態，以便前端至少能看到出錯前的狀態
        current_state_on_error = game_mgr.get_game_state(game_id)
        error_response = {
            "error": f"處理行動時發生內部伺服器錯誤: {str(e)}",
            "currentGameState": current_state_on_error # 可能為 None
        }
        return jsonify(error_response), 500


@app.route('/game/<game_id>/keyword', methods=['GET'])
def get_keyword_info(game_id):
    """
    獲取關鍵字的補充資訊
    查詢參數: ?keyword=關鍵字內容
    """
    keyword = request.args.get('keyword')
    if not keyword:
        return jsonify({"error": "缺少 'keyword' 查詢參數"}), 400

    game_state = game_mgr.get_game_state(game_id)
    if not game_state:
        return jsonify({"error": "找不到遊戲"}), 404
    if game_state.get("gameOver", False):
         return jsonify({"error": "遊戲已結束，無法查詢關鍵字"}), 400
    
    try:
        keyword_data = game_mgr.get_keyword_details(game_id, keyword)
        if "error" in keyword_data:
            return jsonify(keyword_data), 404 # 或其他適當的狀態碼
        return jsonify(keyword_data)
    except Exception as e:
        app.logger.error(f"獲取關鍵字資訊時發生錯誤 (遊戲ID: {game_id}, 關鍵字: {keyword}): {e}", exc_info=True)
        return jsonify({"error": f"獲取關鍵字資訊時發生內部伺服器錯誤: {str(e)}"}), 500


if __name__ == '__main__':
    # 注意：在生產環境中，應使用 Gunicorn 或 uWSGI 等 WSGI 伺服器運行 Flask 應用
    app.run(debug=True, port=5001) # 使用與前端不同的端口
```
# requirements.txt
Flask>=2.0
Flask-CORS>=3.0
requests>=2.20
