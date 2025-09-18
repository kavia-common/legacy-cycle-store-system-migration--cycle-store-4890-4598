# BusinessLogicService

Business Logic layer for the Cycle Store system. Provides REST endpoints to manage inventory, process sales, manage customers, and support tickets. Secured via JWT and RBAC. Integrates with the DataService for persistence.

## Run

- Copy `.env.example` to `.env` and set values (do not commit secrets).
- Install dependencies and start:
  - npm install
  - npm run dev

Docs available at `/docs`.

## Env vars

- APP_NAME, NODE_ENV, PORT, HOST
- JWT_SECRET, JWT_AUD, JWT_ISS
- DATA_SERVICE_BASE_URL, DATA_SERVICE_TIMEOUT

## Endpoints (JWT required)

- GET /inventory (perm: inventory:read)
- POST /inventory (perm: inventory:write)
- GET /inventory/:id (perm: inventory:read)
- PUT /inventory/:id (perm: inventory:write)
- DELETE /inventory/:id (perm: inventory:write)
- POST /sales (perm: sales:write)
- GET /customers (perm: customers:read)
- POST /customers (perm: customers:write)
- GET /support-tickets (perm: tickets:read)
- POST /support-tickets (perm: tickets:write)
