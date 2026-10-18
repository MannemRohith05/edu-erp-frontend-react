# EduERP Frontend

React + TypeScript frontend for the EduERP application. It includes role-based dashboards for admins, teachers, and students and connects to the Spring Boot backend through the API layer in `src/services/api.ts`.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios

## Run Locally

```powershell
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Environment Variables

Create a `.env` file if you want to override defaults:

```env
VITE_API_URL=http://localhost:8080/api
VITE_BASE_PATH=/
```

## Build

```powershell
npm run build
```
