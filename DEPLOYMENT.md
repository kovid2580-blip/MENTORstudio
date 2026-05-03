# Deployment

## Backend

Deploy `backend` to Render as a Docker web service.

Settings:

```txt
Root Directory=backend
Health Check Path=/api/health
```

Required environment variables:

```txt
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-url
APP_JWT_SECRET=replace-with-a-long-secret
```

## Frontend

Deploy `frontend` to Vercel.

Required environment variable:

```txt
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url
```
