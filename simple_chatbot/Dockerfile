# Python 런타임 환경을 기반으로 이미지 생성
FROM python:3.11-slim

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