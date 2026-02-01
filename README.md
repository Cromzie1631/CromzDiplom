# PA9 Online - Веб-версия PA9

Полнофункциональный веб-сайт с встроенным Java GUI приложением PA9, доступным через браузер.

## Структура проекта

```
pa9-site/
├── web/              # Next.js frontend
├── server/           # Express API backend
├── pa9-runtime/      # Docker контейнер для PA9 с VNC
├── workspace/        # Рабочая директория для .pa9 файлов (создается автоматически)
└── docker-compose.yml
```

## Предварительные требования

1. **Docker и Docker Compose** должны быть установлены
2. **Файлы PA9** из репозитория https://github.com/Cromzie1631/cromzie:
   - PA9.jar
   - Все необходимые .jar модули (Electro.jar, Hydro.jar, Mechan.jar, Thermo.jar и др.)

## Установка

### Шаг 1: Подготовка файлов PA9

**Вариант 1: Использование скрипта (рекомендуется)**

1. Клонируйте репозиторий с PA9:
   ```bash
   git clone https://github.com/Cromzie1631/cromzie.git ../cromzie
   ```

2. Запустите скрипт для автоматического копирования файлов:
   ```bash
   cd pa9-runtime
   ./setup-pa9.sh ../cromzie
   cd ..
   ```

**Вариант 2: Ручное копирование**

1. Клонируйте или скачайте репозиторий с PA9:
   ```bash
   git clone https://github.com/Cromzie1631/cromzie.git
   cd cromzie
   ```

2. Скопируйте все .jar файлы в директорию `pa9-runtime/`:
   ```bash
   cp *.jar /path/to/pa9-site/pa9-runtime/
   ```

Убедитесь, что в `pa9-runtime/` находятся:
- PA9.jar
- Electro.jar
- Hydro.jar
- Mechan.jar
- Thermo.jar
- И все другие необходимые зависимости

### Шаг 2: Запуск проекта

Запустите все сервисы одной командой:

```bash
docker compose up --build
```

Это команда:
- Соберет все Docker образы
- Запустит три контейнера:
  - `pa9-gui` - PA9 с VNC (порт 6080)
  - `api` - Backend API (порт 3001)
  - `web` - Frontend сайт (порт 3000)

### Шаг 3: Открытие в браузере

После запуска откройте в браузере:

- **Главная страница**: http://localhost:3000
- **PA9 Online**: http://localhost:3000/pa9
- **Исследования**: http://localhost:3000/research

### Доступ с других устройств

Сайт работает на всех устройствах в локальной сети. С телефона, планшета или другого компьютера откройте:

- **http://ВАШ_IP:3000** (например, http://192.168.1.100:3000)

IP-адрес можно узнать: `ipconfig` (Windows) или `ifconfig` (Mac/Linux). Убедитесь, что порты 3000 и 6080 открыты в файрволе.

## Использование

### PA9 Online страница

1. **Загрузка файлов**: Нажмите "Выбрать файл" и загрузите .pa9 файл
2. **Открытие в PA9**: 
   - Скопируйте путь к рабочей папке (кнопка "Копировать путь")
   - В PA9 откройте File → Open
   - Вставьте путь `/workspace` и выберите нужный файл
3. **Сохранение файлов**: 
   - В PA9 сохраните файл в `/workspace`
   - Нажмите "Обновить список" на веб-странице
   - Скачайте файл через кнопку "Скачать"

### Примеры проектов

При первом запуске в `workspace/` добавлены примеры из cromzie (Demo1.pa9, Motor.pa9, sin.pa9 и др.). Чтобы снова скопировать примеры:

```bash
./scripts/copy-examples.sh
```

### Управление файлами

- Все .pa9 файлы сохраняются в директории `./workspace/` на хосте
- Максимальный размер файла: 20MB
- Разрешены только файлы с расширениями: .pa9, .txt, .png, .csv

## Разработка

### Локальная разработка (без Docker)

#### Frontend:
```bash
cd web
npm install
npm run dev
```

#### Backend:
```bash
cd server
npm install
npm run dev
```

#### PA9 Runtime:
Требуется Docker для запуска PA9 с VNC.

### Переменные окружения

#### Frontend (.env.local):
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_VNC_URL=http://localhost:6080/vnc.html
```

#### Backend:
```
PORT=3001
WORKSPACE_DIR=/workspace
```

## Структура страниц

1. **Главная (/)** - Информация о PA9, возможности системы
2. **PA9 Online (/pa9)** - Встроенный интерфейс PA9 через noVNC + управление файлами
3. **Исследования (/research)** - Информация о кафедре и научных исследованиях

## Изображения

В директории `web/public/` находятся placeholder изображения:
- `pa9-logo.png` - Логотип PA9 (замените на реальное изображение)
- `research-lab.png` - Изображение лаборатории (замените на реальное)

Замените эти файлы на реальные изображения для продакшн использования.

## Troubleshooting

### PA9 не запускается в контейнере

1. Проверьте логи контейнера:
   ```bash
   docker logs pa9-gui
   ```

2. Убедитесь, что все .jar файлы скопированы в `pa9-runtime/`

3. Проверьте логи PA9:
   ```bash
   docker exec pa9-gui cat /var/log/pa9.log
   ```

### VNC не доступен

1. Проверьте, что контейнер `pa9-gui` запущен:
   ```bash
   docker ps
   ```

2. Проверьте порт 6080:
   ```bash
   docker logs pa9-gui | grep "noVNC"
   ```

3. Попробуйте открыть напрямую: http://localhost:6080/vnc.html

### Файлы не загружаются

1. Проверьте, что директория `workspace/` существует и доступна для записи
2. Проверьте логи API:
   ```bash
   docker logs pa9-api
   ```

3. Убедитесь, что файл имеет расширение .pa9 и размер < 20MB

### Проблемы с портами (Mac/Windows)

Если порты заняты, измените их в `docker-compose.yml`:

```yaml
ports:
  - "3000:3000"  # Web
  - "3001:3001"  # API
  - "6080:6080"  # VNC
```

### Проблемы с производительностью

- Увеличьте ресурсы Docker (память, CPU) в настройках Docker Desktop
- PA9 может работать медленно через VNC - это нормально для Java GUI приложений

### Очистка и перезапуск

Остановить все контейнеры:
```bash
docker compose down
```

Остановить и удалить volumes:
```bash
docker compose down -v
```

Полная пересборка:
```bash
docker compose down
docker compose build --no-cache
docker compose up
```

## Архитектура

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + Multer для загрузки файлов
- **PA9 Runtime**: Docker контейнер с:
  - OpenJDK 8
  - Xvfb (виртуальный X-дисплей)
  - Fluxbox (оконный менеджер)
  - x11vnc (VNC сервер)
  - noVNC + websockify (веб-клиент VNC)

## Продакшн

Для публичного хостинга установите переменную окружения:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Сайт готов к production: SEO-метатеги, Open Graph, robots.txt, favicon.

## Безопасность

⚠️ **Важно для продакшн**:
- Добавьте аутентификацию для API
- Настройте HTTPS
- Ограничьте доступ к VNC (добавьте пароль или аутентификацию)
- Настройте CORS для API
- Добавьте rate limiting

Текущая версия предназначена для локальной разработки и не включает эти меры безопасности.

## Лицензия

Проект создан для интеграции PA9 в веб-среду.

## Поддержка

При возникновении проблем:
1. Проверьте логи контейнеров
2. Убедитесь, что все файлы PA9 на месте
3. Проверьте, что порты не заняты другими приложениями
