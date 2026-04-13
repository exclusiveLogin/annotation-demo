# annotation-demo — Angular 19 Document Annotation Viewer

Демо-приложение для просмотра документов с интерактивным слоем аннотаций. Реализует многослойную архитектуру отображения: контент документа, слой аннотаций, навигация по страницам — каждый слой независим.

## Возможности

- **Слой аннотаций** — создание и отображение аннотаций поверх контента документа
- **Ввод аннотаций** — компонент `annotation-input` для добавления новых записей
- **Навигация** — `pagination` компонент для перехода между страницами документа
- **Заголовок документа** — `document-header` с метаданными
- **Автодеплой** — GitHub Actions → GitHub Pages (`.github/workflows/gh-pages.yml`)

## Архитектура

```
annotation-demo/
├── src/app/
│   ├── annotation-input/         # Компонент ввода аннотации
│   ├── annotations-layer/        # Слой отображения всех аннотаций (overlay)
│   ├── document-content/         # Основной контент документа
│   ├── document-header/          # Заголовок и метаданные
│   └── pagination/               # Постраничная навигация
├── .github/workflows/
│   └── gh-pages.yml              # CI/CD → автодеплой на GitHub Pages
└── angular.json / tsconfig.json
```

## Стек технологий

| Технология | Версия |
|-----------|--------|
| Angular | 19 |
| TypeScript | 5.x |
| GitHub Actions | CI/CD деплой |
| GitHub Pages | Хостинг |

## Запуск

```bash
npm install
ng serve            # localhost:4200

ng build --prod     # продакшн сборка
```

## Деплой

При пуше в `main` — автоматический деплой на GitHub Pages через GitHub Actions.

## Концепция слоёв

Архитектура построена на принципе независимых слоёв (layers pattern):
- **content layer** — рендеринг страниц документа
- **annotation layer** — прозрачный overlay с позиционированием аннотаций
- **input layer** — управление вводом пользователя

Такой подход позволяет переиспользовать annotation layer с любым типом документов.
