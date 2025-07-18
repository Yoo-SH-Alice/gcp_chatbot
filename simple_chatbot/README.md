# Flask 및 Google AI 기반 챗봇

## 1. 프로젝트 개요

본 프로젝트는 Flask 웹 프레임워크와 Google AI Studio API를 사용하여 사용자와 실시간으로 대화하는 간단한 웹 기반 챗봇을 구현합니다. 사용자의 질문에 지능적으로 답변하는 것을 목표로 하며, API 키와 같은 민감 정보는 `.env` 파일을 통해 안전하게 관리합니다. 최종 애플리케이션은 Docker 컨테이너화하여 Google Cloud Run에 배포할 수 있도록 설계되었습니다.

## 2. 주요 기능

- **실시간 채팅:** 웹 UI를 통해 사용자와 챗봇이 메시지를 주고받는 인터페이스 제공
- **지능형 응답:** Google의 최신 언어 모델을 활용하여 자연스러운 대화 생성
- **안전한 API 키 관리:** `python-dotenv`를 사용하여 API 키를 코드와 분리하여 관리
- **쉬운 확장성:** Flask를 기반으로 하여 향후 기능 추가 및 확장이 용이
- **클라우드 배포:** Docker를 통해 컨테이너화하고 Google Cloud Run에 배포 가능

## 3. 프로젝트 구조

```
simple_chatbot/
├── .env                # Google API 키 저장을 위한 환경 변수 파일
├── .gitignore          # Git 버전 관리 제외 목록
├── app.py              # Flask 애플리케이션 및 Google AI 연동 로직
├── requirements.txt    # Python 패키지 의존성 목록
├── Dockerfile          # Cloud Run 배포를 위한 Docker 이미지 설정 파일
├── templates/
│   └── index.html      # 챗봇 UI를 위한 HTML 파일
└── static/
    ├── script.js       # 사용자 입력 및 서버 통신을 위한 JavaScript
    └── style.css       # 채팅 UI 스타일링을 위한 CSS
```

## 4. 로컬 환경 설정 및 실행 방법

### 사전 준비
- Python 3.11 이상
- `pip` (Python 패키지 관리자)
- Google AI Studio에서 발급받은 API 키

### 실행 순서
1. **저장소 복제**
   ```bash
   git clone <저장소_URL>
   cd simple_chatbot
   ```

2. **Anaconda 가상 환경 생성 및 활성화**
   ```bash
   conda create -n chatbot_env python=3.11 -y
   conda activate chatbot_env
   ```

3. **필요한 패키지 설치**
   ```bash
   pip install -r requirements.txt
   ```

4. **`.env` 파일 생성 및 API 키 설정**
   프로젝트 루트 디렉터리에 `.env` 파일을 생성하고 아래 내용을 추가합니다.
   ```
   GOOGLE_API_KEY='여기에_발급받은_API_키를_입력하세요'
   ```

5. **Flask 서버 실행**
   ```bash
   flask run
   ```

6. **챗봇 접속**
   웹 브라우저를 열고 `http://127.0.0.1:5000` 주소로 접속하여 챗봇을 테스트합니다.

## 5. Google Cloud Run 배포 계획

### 사전 준비
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) 설치 및 `gcloud` CLI 인증
- [Docker](https://www.docker.com/products/docker-desktop/) 설치
- Google Cloud 프로젝트 내에서 Artifact Registry 또는 Container Registry API 활성화

### 배포 순서
1. **`Dockerfile` 작성**
   프로젝트 루트에 다음과 같이 `Dockerfile`을 작성하여 애플리케이션을 컨테이너화합니다.
   ```Dockerfile
   # Python 런타임 환경을 기반으로 이미지 생성
   FROM python:3.9-slim

   # 작업 디렉터리 설정
   WORKDIR /app

   # 의존성 파일 복사 및 설치
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # 프로젝트 소스 코드 복사
   COPY . .

   # Gunicorn을 사용하여 애플리케이션 실행
   # Cloud Run은 PORT 환경 변수를 통해 8080 포트를 자동으로 주입
   CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
   ```
   **참고:** `gunicorn`은 프로덕션 환경에 권장되는 WSGI 서버입니다. `requirements.txt`에 `gunicorn`을 추가해야 합니다.

2. **Docker 이미지 빌드**
   Google Cloud 프로젝트 ID를 변수로 설정하고 Docker 이미지를 빌드합니다.
   ```bash
   export PROJECT_ID="YOUR_GCP_PROJECT_ID"
   docker build -t gcr.io/${PROJECT_ID}/gemini-chatbot:v1 .
   ```

3. **Docker 이미지 푸시**
   빌드한 이미지를 Google Container Registry(GCR) 또는 Artifact Registry로 푸시합니다.
   ```bash
   docker push gcr.io/${PROJECT_ID}/gemini-chatbot:v1
   ```

4. **Cloud Run에 배포**
   `gcloud` 명령어를 사용하여 이미지를 Cloud Run에 배포합니다. 이때 `--set-env-vars` 플래그를 사용하여 `.env` 파일에 저장했던 API 키를 안전하게 환경 변수로 주입합니다.
   ```bash
   gcloud run deploy gemini-chatbot-service \
     --image gcr.io/${PROJECT_ID}/gemini-chatbot:v1 \
     --platform managed \
     --region asia-northeast3 \
     --allow-unauthenticated \
     --set-env-vars="GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY"
   ```
   - `gemini-chatbot-service`: 원하는 서비스 이름으로 변경 가능
   - `region`: 원하는 리전으로 변경 (예: `us-central1`)
   - `YOUR_GOOGLE_API_KEY`: 실제 Google API 키로 대체

배포가 완료되면 Cloud Run에서 제공하는 URL을 통해 웹 챗봇에 접속할 수 있습니다.

```