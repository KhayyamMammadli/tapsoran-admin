# TapSoran Admin (React)

Real React (Vite + TypeScript + MUI) admin panel.

## Setup
```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

`.env` içində:
- `VITE_API_URL` — server URL (məs: http://localhost:4000)

## Login
Backend-də olan `/auth/login` endpoint-i ilə giriş edir. Giriş üçün **SUPER_ADMIN** istifadəçisi lazımdır.

## Mövcud səhifələr
- Dashboard (kateqoriyalar, chatlər, feed count)
- Kateqoriyalar (GET /categories)
- Sorğular (Feed) (GET /requests/feed) — yalnız SELLER rolu
- Chatlər (GET /conversations)

## Növbəti addım (istəsən)
Backend-ə admin üçün endpoint-lər əlavə edək:
- GET/POST/PUT/DELETE `/admin/categories`
- GET `/admin/users`
- GET `/admin/requests`
- GET `/admin/conversations`


## Default Super Admin
- Email: superadmin@tapsoran.az
- Password: TapSoran@12345

Server: http://localhost:4000
