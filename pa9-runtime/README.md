# PA9 Runtime Container

Этот контейнер запускает PA9.jar в виртуальном X-дисплее с доступом через VNC/noVNC.

## Требования

Перед сборкой контейнера необходимо скопировать следующие файлы из репозитория https://github.com/Cromzie1631/cromzie:

- PA9.jar
- Все необходимые модули (*.jar файлы):
  - Electro.jar
  - Hydro.jar
  - Mechan.jar
  - Thermo.jar
  - И другие зависимости

## Установка файлов PA9

1. Клонируйте или скачайте репозиторий с PA9:
   ```bash
   git clone https://github.com/Cromzie1631/cromzie.git
   cd cromzie
   ```

2. Скопируйте все .jar файлы в директорию `pa9-runtime/`:
   ```bash
   cp *.jar /path/to/pa9-site/pa9-runtime/
   ```

3. Убедитесь, что файлы находятся в `pa9-runtime/` перед сборкой Docker образа.

## Сборка

Контейнер будет автоматически собран при запуске `docker compose up --build`.

## Использование

Контейнер автоматически:
- Запускает Xvfb на дисплее :99
- Запускает fluxbox (легковесный оконный менеджер)
- Запускает x11vnc для доступа к X-дисплею
- Запускает websockify для noVNC
- Запускает PA9.jar (если доступен)

## Доступ

- noVNC доступен на порту 6080
- URL: http://localhost:6080/vnc.html
- Рабочая директория монтируется в `/workspace`
