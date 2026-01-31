#!/bin/bash

# Скрипт для копирования PA9 файлов из репозитория cromzie
# Использование: ./setup-pa9.sh [путь-к-репозиторию-cromzie]

SOURCE_DIR=${1:-"../cromzie"}

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Ошибка: Директория $SOURCE_DIR не найдена"
    echo ""
    echo "Использование:"
    echo "  ./setup-pa9.sh [путь-к-репозиторию-cromzie]"
    echo ""
    echo "Пример:"
    echo "  git clone https://github.com/Cromzie1631/cromzie.git ../cromzie"
    echo "  ./setup-pa9.sh ../cromzie"
    exit 1
fi

echo "Копирование PA9 файлов из $SOURCE_DIR..."

# Найти и скопировать все .jar файлы
JAR_COUNT=$(find "$SOURCE_DIR" -maxdepth 1 -name "*.jar" | wc -l)

if [ "$JAR_COUNT" -eq 0 ]; then
    echo "Ошибка: Не найдено .jar файлов в $SOURCE_DIR"
    exit 1
fi

echo "Найдено $JAR_COUNT .jar файл(ов)"

# Копировать все .jar файлы
find "$SOURCE_DIR" -maxdepth 1 -name "*.jar" -exec cp {} . \;

echo "Скопированные файлы:"
ls -lh *.jar

echo ""
echo "Готово! Теперь можно собрать Docker образ:"
echo "  docker compose build pa9-gui"
