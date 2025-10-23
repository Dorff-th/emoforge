// src/config/constants.ts
// export const SERVICE_URLS = {
//   AUTH: "http://app1.127.0.0.1.nip.io:5173",
//   POST: "http://app2.127.0.0.1.nip.io:5174",
//   DIARY: "http://app3.127.0.0.1.nip.io:5175",
//   // 필요하면 Diary, Admin 등도 추가 가능
// };

export const SERVICE_URLS = { 
  AUTH: import.meta.env.VITE_APP_AUTH_URL,
  POST: import.meta.env.VITE_APP_POST_URL,
  DIARY: import.meta.env.VITE_APP_DIARY_URL,
}
