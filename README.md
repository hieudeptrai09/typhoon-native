# typhoon-native

Ứng dụng React Native (Expo SDK 54) tra cứu dữ liệu bão Tây Bắc Thái Bình Dương.
Chỉ nhắm tới Android và iOS — không có giao diện web.

## Cấu trúc

| Thư mục               | Vai trò                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| `app/(tabs)`, `app/*` | Màn hình, định tuyến bằng expo-router                                            |
| `app/api/v1`          | API routes, chạy trên server chứ không nằm trong bundle của app                  |
| `be/`                 | Truy vấn Supabase qua HTTP RPC, chỉ được import từ `+api.ts`                     |
| `lib/`                | Component, hook, type, util dùng chung cho phía app                              |
| `db/`                 | Schema và các hàm SQL (`db/functions.sql` là nguồn thật của các RPC trong `be/`) |

## Chạy dev

```bash
npm install
cp .env.example .env.local   # điền SUPABASE_URL và SUPABASE_PUBLISHABLE_KEY
npm start
```

Trong dev, Metro chính là server phục vụ `app/api/v1`, nên các màn hình gọi đường dẫn tương đối
là chạy được ngay.

## Build và deploy

API routes phải được deploy trước, vì bản build không có dev server:

```bash
npm run deploy:preview   # export web (chỉ để lấy server bundle) rồi đẩy lên EAS Hosting
npm run build:preview    # APK, đọc EXPO_PUBLIC_API_ORIGIN từ eas.json
```

`web.output: "server"` trong `app.json` và hai package `react-dom` / `react-native-web` chỉ tồn tại
để `expo export --platform web` dựng được server bundle cho API routes — app không render trên web.

## Lệnh khác

```bash
npm test         # jest (chỉ test cho lib/utils)
npm run lint
npm run format
npm run facts    # sinh dữ liệu fun fact, kết nối Postgres trực tiếp qua be/direct.ts
```
