# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Project Overview

This frontend is part of the CTSE Assignment 1 food ordering microservices app. It uses React + Vite, TailwindCSS and integrates with backend microservices for:

- User authentication and profile management (`user-service`)
- Restaurant and menu management (`restaurant-service`)
- Order placement and tracking (`order-service`)
- Notification delivery (`notification-service`)

## Setup & Run

1. Install dependencies

```bash
cd frontend
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## Environment & API endpoints

Make sure the backend services are running and the following URLs are accessible (check the root `docker-compose.yml` or each service config):

- Auth: `http://localhost:5000` (change as needed)
- Restaurants: `http://localhost:5001`
- Orders: `http://localhost:5002`
- Notifications: `http://localhost:5003`

## Build for production

```bash
npm run build
```

## Commit message guidance

Add your change details and purpose, for example:

- `docs(frontend): update README with project setup and architecture details`
- `chore: add instructions for running microservices with frontend`

