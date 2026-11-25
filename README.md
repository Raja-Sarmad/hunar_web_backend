# hunar_web-backend

Express + MongoDB API for the HUNAR marketplace.

Sibling of `hunar_web` (frontend).

## Setup

```bash
cd hunar_web-backend
cp .env.example .env
# fill MONGODB_URI + JWT_SECRET
npm install
npm run seed
npm run dev
```

API runs at `http://localhost:5000`.

Frontend (`hunar_web`) should have:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Demo accounts (after seed)

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@hunar.pk` | `admin123` |
| Customer | `fatima@example.com` | `demo123` |
| Provider | `ayesha@example.com` | `demo123` |
