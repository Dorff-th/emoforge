import jwt, base64, hmac, hashlib

# === 1. Spring에서 발급된 실제 토큰 그대로 ===
token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYWthb184OTI1OWYzN0BkdW1teS5sb2NhbCIsInV1aWQiOiIzMmI4YjNhNi0xMzRmLTQ4YTUtYTNiYi1jNmUzM2Y5ODgxNDgiLCJyb2xlIjoiVVNFUiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTk5MTkyNjcsImV4cCI6MTc2MDUyNDA2N30.TwrmyIIj7_WwLE9h73AMTFCbnDbuSd3I0IhQUmffN4U"

# === 2. Spring 설정파일에 있는 secret 문자열을 여기에 그대로 입력 ===
spring_secret = "mySecretKey123456789012345678901234567890"

# === 3. 시도 조합 (plain / base64 decode) ===
for mode in ["plain", "base64"]:
    try:
        key = spring_secret.encode() if mode == "plain" else base64.b64decode(spring_secret)
        print(f"\n--- Trying {mode} key ---")
        payload = jwt.decode(token, key, algorithms=["HS256"])
        print("✅ SUCCESS:", payload)
    except Exception as e:
        print("❌ FAIL:", e)

# === 4. 수동 서명 비교 ===
header, payload, sig = token.split(".")
raw = f"{header}.{payload}".encode()
sig_calc = base64.urlsafe_b64encode(hmac.new(key, raw, hashlib.sha256).digest()).rstrip(b"=")
print("\nExpected signature:", sig)
print("Calculated signature:", sig_calc.decode())
