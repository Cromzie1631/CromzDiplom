# Развёртывание Multi-Session PA9

## Быстрый старт

```bash
# 1. Соберите образ PA9
docker compose build pa9-gui

# 2. Запустите инфраструктуру
docker compose up -d --build

# 3. Проверьте
docker ps
# Должны быть: pa9-traefik, pa9-api, pa9-web

# 4. Откройте сайт
open http://pa9-64.176.64.242.nip.io
```

## Настройка Nginx на хосте

Создайте `/etc/nginx/sites-available/pa9`:

```nginx
server {
    listen 80;
    server_name pa9-64.176.64.242.nip.io *.pa9-64.176.64.242.nip.io;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/pa9 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Проверка

1. **Traefik Dashboard**: http://127.0.0.1:8080
2. **Создание сессии**:
   ```bash
   curl -X POST http://localhost:3001/api/session
   ```
3. **Список контейнеров**:
   ```bash
   docker ps | grep pa9-session
   ```

## Мониторинг

```bash
# Логи API (создание/удаление сессий)
docker logs -f pa9-api

# Логи Traefik (роутинг)
docker logs -f pa9-traefik

# Активные сессии
docker ps --filter "name=pa9-session"

# Использование ресурсов
docker stats
```

## Очистка

```bash
# Удалить все сессионные контейнеры
docker ps -a --filter "name=pa9-session" -q | xargs docker rm -f

# Удалить папки сессий
rm -rf workspace/sessions/*

# Полная перезагрузка
docker compose down
docker compose up -d --build
```

## Troubleshooting

### Сессия не создаётся

```bash
# Проверьте логи API
docker logs pa9-api

# Проверьте Docker socket
ls -la /var/run/docker.sock

# Проверьте образ PA9
docker images | grep cromzdiplom-pa9-gui
```

### VNC не подключается

```bash
# Проверьте Traefik labels
docker inspect pa9-session-XXXXX | grep traefik

# Проверьте Traefik роуты
curl http://127.0.0.1:8080/api/http/routers
```

### Сессии не удаляются

```bash
# Проверьте TTL (по умолчанию 2 часа)
# Сессии удаляются автоматически каждую минуту

# Ручное удаление
curl -X DELETE http://localhost:3001/api/session/SESSIONID
```
