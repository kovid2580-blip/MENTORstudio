# MENTORstudio

This repository contains a full-stack starter for the project described in your document: a real-time mentor-student platform with authentication, sessions, chat, editor sync, and video signaling support.

## Stack

- `frontend`: Next.js, TypeScript, Tailwind CSS
- `backend`: Spring Boot, Spring Security, Spring Data JPA, WebSocket, JWT
- `database`: H2 for local starter setup, PostgreSQL-ready dependency included

## Included Modules

- Mentor and student role-based registration and login
- JWT token generation
- Session creation, join, list, fetch, and end APIs
- WebSocket chat messaging
- WebSocket code sync channel
- WebSocket signaling channel for WebRTC
- Plain black-and-white frontend starter pages

## Project Layout

```text
.
|-- backend
|   |-- pom.xml
|   `-- src
|-- frontend
|   |-- package.json
|   `-- app
`-- README.md
```

## Backend API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Sessions

- `POST /api/sessions/create`
- `POST /api/sessions/{sessionId}/join`
- `POST /api/sessions/{sessionId}/end`
- `GET /api/sessions`
- `GET /api/sessions/{sessionId}`

### Chat

- `GET /api/chat/{sessionId}`

### WebSocket

- Endpoint: `/ws`
- App destinations:
  - `/app/chat`
  - `/app/code`
  - `/app/signal`
- Topic destinations:
  - `/topic/session/{id}/chat`
  - `/topic/session/{id}/code`
  - `/topic/session/{id}/signal`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

## Environment

Frontend example:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Backend defaults:

- H2 in-memory database enabled
- H2 console enabled at `/h2-console`
- JWT secret configured in `backend/src/main/resources/application.yml`

## Important Note

The frontend structure is ready, and the backend scaffold is written, but I could not run Maven validation in this environment because `mvn` is not installed here. The backend may need a quick compile pass once Maven or a wrapper is available.

## Recommended Next Build Steps

1. Connect the frontend forms to the auth and session APIs.
2. Add Monaco editor and STOMP client integration.
3. Add WebRTC media controls and signaling handling.
4. Move from H2 to PostgreSQL for deployment.
5. Add deployment files for Vercel and Render or Railway.
