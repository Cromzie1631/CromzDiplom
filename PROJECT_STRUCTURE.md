# Структура проекта

```
pa9-site/
├── docker-compose.yml          # Оркестрация всех сервисов
├── .gitignore                  # Игнорируемые файлы
├── README.md                   # Основная документация
├── QUICKSTART.md               # Быстрый старт
├── PROJECT_STRUCTURE.md        # Этот файл
│
├── web/                        # Next.js Frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .dockerignore
│   ├── app/
│   │   ├── layout.tsx          # Общий layout с навигацией
│   │   ├── page.tsx            # Главная страница (/)
│   │   ├── globals.css         # Глобальные стили
│   │   ├── pa9/
│   │   │   └── page.tsx        # PA9 Online страница (/pa9)
│   │   └── research/
│   │       └── page.tsx        # Страница исследований (/research)
│   └── public/                 # Статические файлы (изображения)
│
├── server/                     # Express.js Backend API
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .dockerignore
│   └── src/
│       └── index.ts            # API сервер (загрузка/скачивание файлов)
│
├── pa9-runtime/                # Docker контейнер для PA9
│   ├── Dockerfile              # Образ с Xvfb + VNC + PA9
│   ├── start.sh                # Скрипт запуска всех сервисов
│   ├── setup-pa9.sh            # Скрипт для копирования PA9 файлов
│   ├── README.md               # Документация по runtime
│   └── [PA9.jar и *.jar]       # Файлы PA9 (копируются вручную)
│
└── workspace/                  # Рабочая директория (создается автоматически)
    └── [.pa9 файлы]            # Загруженные пользователем файлы
```

## Компоненты

### Frontend (web/)
- **Технологии**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Страницы**:
  - `/` - Главная страница с информацией о PA9
  - `/pa9` - PA9 Online с встроенным VNC интерфейсом и управлением файлами
  - `/research` - Страница о кафедре и исследованиях

### Backend (server/)
- **Технологии**: Express.js, TypeScript, Multer
- **API Endpoints**:
  - `GET /api/health` - Проверка здоровья сервиса
  - `GET /api/files` - Список файлов в workspace
  - `POST /api/upload` - Загрузка .pa9 файлов
  - `GET /api/download/:name` - Скачивание файлов

### PA9 Runtime (pa9-runtime/)
- **Технологии**: Docker, Xvfb, Fluxbox, x11vnc, noVNC
- **Функции**:
  - Запуск PA9.jar в виртуальном X-дисплее
  - Предоставление доступа через VNC/noVNC
  - Автоматический запуск всех необходимых сервисов

## Порты

- **3000** - Frontend (Next.js)
- **3001** - Backend API (Express)
- **6080** - noVNC (веб-доступ к PA9)

## Переменные окружения

См. `.env.example` для списка всех переменных окружения.
