# hunar_web-backend

Express + MongoDB API for the HUNAR marketplace.

Sibling of `hunar_web` (frontend).

## Local setup

```bash
cd hunar_web-backend
cp .env.example .env
# fill MONGODB_URI + JWT_SECRET
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`.

## Deploy on Vercel

1. Push this repo to GitHub
2. Vercel → **Add New Project** → import `hunar_web-backend`
3. **Root Directory:** leave as repo root
4. Add Environment Variables:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/hunar?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret
ADMIN_EMAIL=admin@hunar.pk
ADMIN_PASSWORD=admin123
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
```

5. Deploy
6. Open `https://YOUR-BACKEND.vercel.app/api/health` — should return `{ "ok": true }`

Frontend env:

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.vercel.app/api
```

Also allow Atlas Network Access `0.0.0.0/0`.

## Demo accounts (after seed)

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@hunar.pk` | `admin123` |
| Customer | `fatima@example.com` | `demo123` |
| Provider | `ayesha@example.com` | `demo123` |
