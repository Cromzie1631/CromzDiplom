# Деплой PA9 на продакшн (Vultr)

## Текущий адрес
**https://pa9-64.176.64.242.nip.io**

Сервер: Ubuntu 22.04 на Vultr  
Путь: `/opt/CromzDiplom`

---

## Обновление кода

```bash
cd /opt/CromzDiplom
git pull
docker compose down
docker compose up -d --build
```

---

## Первичная настройка (один раз)

### 1. Nginx

Скопировать конфиг:
```bash
sudo cp /opt/CromzDiplom/scripts/nginx/pa9.conf /etc/nginx/sites-available/pa9
sudo ln -s /etc/nginx/sites-available/pa9 /etc/nginx/sites-enabled/
```

Проверить и перезагрузить:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Docker Compose

Запустить:
```bash
cd /opt/CromzDiplom
docker compose up -d --build
```

Проверить:
```bash
docker ps
# Должны быть: pa9-gui, pa9-api, pa9-web
```

---

## Мониторинг

### Логи

```bash
# API (создание/удаление сессий)
docker logs -f pa9-api

# Session Manager
docker logs -f pa9-gui

# Web (Next.js)
docker logs -f pa9-web
```

### Активные сессии

```bash
# Зайти в контейнер pa9-gui
docker exec -it pa9-gui bash

# Посмотреть процессы
ps aux | grep -E "Xvfb|x11vnc|websockify|java"

# Посмотреть папки сессий
ls -la /workspace/sessions/
```

### Проверка WebSocket

```bash
# Создать сессию
curl -X POST http://localhost:3001/api/session

# Проверить WS (нужен wscat)
wscat -c ws://localhost:3001/api/session/SESSION_ID/ws
```

---

## Troubleshooting

### Сессии не создаются

```bash
# Проверить логи pa9-gui
docker logs pa9-gui

# Проверить, что pa9-gui доступен из api
docker exec pa9-api curl http://pa9-gui:6090/internal/sessions

# Перезапустить
docker compose restart pa9-gui
```

### WebSocket не подключается

```bash
# Проверить nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Проверить, что Upgrade headers проходят
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3001/api/session/test/ws
```

### PA9 не запускается в сессии

```bash
# Проверить, что .jar файлы на месте
docker exec pa9-gui ls -la /app/*.jar

# Проверить Java
docker exec pa9-gui java -version

# Проверить Xvfb
docker exec pa9-gui ps aux | grep Xvfb
```

### Сессии не удаляются (idle)

По умолчанию TTL = 30 минут. Проверить:
```bash
# Логи session manager
docker logs pa9-gui | grep "Cleaning up idle"

# Изменить TTL (в docker-compose.yml)
environment:
  - SESSION_IDLE_MINUTES=15
```

---

## Очистка

### Удалить все сессии

```bash
# Остановить контейнеры
docker compose down

# Удалить папки сессий
rm -rf /opt/CromzDiplom/workspace/sessions/*

# Запустить заново
docker compose up -d
```

### Полная пересборка

```bash
cd /opt/CromzDiplom
docker compose down
docker system prune -a --volumes
docker compose up -d --build
```

---

## Архитектура

```
Пользователь
    ↓
Nginx (80/443)
    ↓
Next.js (3000) ← статика, SSR
    ↓
Express API (3001) ← /api/session/*
    ↓ HTTP                  ↓ WebSocket Proxy
Session Manager (6090)      /api/session/:id/ws
    ↓                           ↓
Создаёт контейнеры:      Проксирует на:
- Xvfb :100, :101...     ws://pa9-gui:6900, 6901...
- x11vnc :5900, 5901...
- websockify :6900, 6901...
- PA9 (java)
```

Каждая сессия = отдельный набор процессов в одном контейнере `pa9-gui`.

---

## Безопасность

- Порты 3000 и 3001 слушают только на `127.0.0.1`
- WebSocket проксируется через nginx
- Сессии изолированы по папкам
- Автоудаление по idle timeout
- Нет публичных VNC портов

**TODO для продакшн:**
- Добавить аутентификацию (JWT/OAuth)
- Настроить HTTPS (Let's Encrypt)
- Rate limiting для создания сессий
- Мониторинг ресурсов (CPU/RAM)
