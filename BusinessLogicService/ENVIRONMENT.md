# BusinessLogicService Environment

Set these variables via .env (managed by orchestration). Do not commit secrets.

- PORT: default 4001
- HOST: default 0.0.0.0
- DATA_SERVICE_BASE_URL: e.g. http://dataservice:3001/api/v1
- NOTIFICATION_SERVICE_BASE_URL: e.g. http://notification:3003/api/v1
- HTTP_TIMEOUT_MS: default 8000
- HTTP_RETRIES: default 2
- LOG_LEVEL: info|debug|warn|error
- SUPPORT_INBOX: email address for support notifications
