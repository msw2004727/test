# main.py - Flask 後端主程式

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ✅ 允許前端跨域請求

@app.route("/api/MD/game-configs")
def get_game_configs():
    # ✅ 回傳一個測試用的遊戲設定範本，可後續改為讀資料庫或 JSON 檔
    return jsonify({
        "dna_fragments": [],
        "rarities": {},
        "skills": {},
        "personalities": [],
        "titles": ["新手"],
        "health_conditions": [],
        "newbie_guide": [
            {"title": "歡迎", "content": "這是預設的新手指南內容。"}
        ],
        "value_settings": {
            "max_farm_slots": 10,
            "max_monster_skills": 3,
            "max_battle_turns": 30
        },
        "npc_monsters": []
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
