# frontend-react/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# ✅ 기존 dist 폴더를 완전히 삭제
RUN rm -rf dist && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html  
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 5175
