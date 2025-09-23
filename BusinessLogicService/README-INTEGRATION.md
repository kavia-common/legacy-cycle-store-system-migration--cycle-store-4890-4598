# BusinessLogicService – Local Integration Notes

- Default dev port: 4001 (set PORT=4001)
- Exposed endpoints (bootstrap):
  - GET /inventory
  - POST /sales

These endpoints are used by the API Gateway. For production, integrate with DataService for persistence and add authentication.
