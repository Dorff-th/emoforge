# ============================================
# frontend-react/Dockerfile (배포용)
# ============================================

# 1️⃣ Nginx 기반 정적 파일 서빙만 수행
FROM nginx:alpine

# 2️⃣ 로컬에서 미리 빌드된 dist 폴더를 복사
#    (dist 폴더는 EC2 업로드 전에 반드시 npm run build 완료 상태여야 함)
COPY ./dist /usr/share/nginx/html

# 3️⃣ 커스텀 Nginx 설정 적용 (optional)
#    nginx/default.conf 파일이 존재해야 함
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# 4️⃣ 프론트엔드 컨테이너가 사용할 포트 (5173 → 80으로 변경 권장)
EXPOSE 80

# 5️⃣ 기본 실행 명령
CMD ["nginx", "-g", "daemon off;"]
