import os
from flask import Flask, request, render_template, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)

# Google API 키 설정
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.")
genai.configure(api_key=GOOGLE_API_KEY)

# Gemini 모델 초기화
model = genai.GenerativeModel('gemini-2.5-flash')
chat = model.start_chat(history=[])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat_api():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'error': '메시지가 제공되지 않았습니다.'}), 400

    try:
        response = chat.send_message(user_message)
        bot_response = response.text
        return jsonify({'response': bot_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)