# Быстрый старт

## Минимальные шаги для запуска

### 1. Установите Docker и Docker Compose

Убедитесь, что Docker Desktop установлен и запущен.

### 2. Подготовьте файлы PA9

```bash
# Клонируйте репозиторий с PA9
git clone https://github.com/Cromzie1631/cromzie.git ../cromzie

# Скопируйте файлы в pa9-runtime
cd pa9-runtime
./setup-pa9.sh ../cromzie
cd ..
```

Или вручную скопируйте все `.jar` файлы из репозитория `cromzie` в директорию `pa9-runtime/`.

### 3. Запустите проект

```bash
docker compose up --build
```

### 4. Откройте в браузере

- **Главная**: http://localhost:3000
- **PA9 Online**: http://localhost:3000/pa9
- **Исследования**: http://localhost:3000/research

## Проверка работы

1. Откройте http://localhost:3000/pa9
2. Должен загрузиться интерфейс PA9 через VNC
3. Попробуйте загрузить .pa9 файл через форму на странице
4. В PA9 откройте File → Open и введите путь `/workspace`

## Остановка

```bash
docker compose down
```

## Проблемы?

См. раздел Troubleshooting в основном README.md
