# Business APIs

Core endpoints exposed by BusinessLogicService:

- GET /inventory — list inventory items
- POST /inventory — create inventory item
- POST /sales — process a sale
- GET /customers — list customers
- POST /customers — create customer
- GET /support-tickets — list support tickets
- POST /support-tickets — create support ticket

Docs: /docs (Swagger UI). To export OpenAPI JSON, run:
node generate_openapi.js (outputs to BusinessLogicService/interfaces/openapi.json)

Dependencies:
- DataService at $DATA_SERVICE_BASE_URL
- NotificationService at $NOTIFICATION_SERVICE_BASE_URL

Auth:
- If present, Authorization header is forwarded to downstream services.
