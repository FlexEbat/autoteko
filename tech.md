# tech.md: AUTEKO

**Версия: v1** (2026-10-11)

**Основано на шаблоне: t1**

**Локализация: отложена**

Changelog:

- v1: первая версия спецификации проекта AUTEKO. Заморожены (слайс 0A): схема данных (раздел 4), API модуля данных (раздел 5), наборы UI-примитивов веба и мобильного клиента (раздел 6), контракт API v1 и синхронизации (раздел 7), матрица прав (раздел 4). Локализация отложена: продукт одноязычный (ru), слайс L выполняется только при добавлении второго языка. Отклонения от шаблона t1: документы проекта пишутся по-русски (раздел 11); вместо одного слайса функции введены слайсы 1-14 и H; раздел 18 описывает два режима доступа (`internal` и `public`).

---

## 0. Как читать этот файл

Это источник истины проекта. Читай его перед каждой задачей и выполняй как написано.

- Имена сущностей, полей, типов, функций и задач берутся отсюда. Свои варианты не придумывай.
- Нужного контракта здесь нет: СТОП, выдай блок `CONTRACT GAP` (раздел 13). Код с выдуманным типом не пиши.
- Файл меняет только владелец проекта. Каждое изменение контракта поднимает версию сверху файла. Пока `Локализация: отложена`, переводов `tech.md` нет (раздел 17).
- Работаешь один слайс за заход. Стадии и слайсы описаны в разделе 15, иди по нему сверху вниз.
- Читай только `tech.md`. Исходное ТЗ (`tz_auteko_system.docx`) лежит у владельца, его решения уже перенесены сюда (таблица «Решения по ТЗ» в разделе 1). При расхождении побеждает `tech.md`.

### Параметры проекта

| параметр                           | значение в проекте                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| имя проекта                        | AUTEKO                                                                                |
| язык исходника `tech.md`           | ru                                                                                    |
| языки продукта и документов        | ru                                                                                    |
| язык продукта по умолчанию         | ru                                                                                    |
| профиль стека                      | свой: TypeScript, Next.js, Expo, PostgreSQL (приложение A шаблона удалено)            |
| версия рантайма или компилятора    | Node.js 26, TypeScript 7                                                              |
| запуск задач                       | npm scripts (npm workspaces)                                                          |
| платформа CI                       | GitHub Actions                                                                        |
| способ поставки                    | web-сервис и мобильное приложение; сервер в контейнерах (Docker Compose)              |
| есть пользовательский интерфейс    | да (web-панель и мобильное приложение)                                                |
| есть пользователи и аутентификация | да                                                                                    |
| локализация                        | отложена, режим в шапке файла                                                         |
| лицензия                           | MIT                                                                                   |

---

## 1. Проект

AUTEKO это внутренняя система учёта запчастей для дизельных двигателей (серии 12М55, 12-16М33, 16М33, 12М33), которые компания закупает в Китае и продаёт в России. Она заменяет учёт в Excel единой базой PostgreSQL. Пользователи: руководитель, бухгалтер и закупщик работают в web-панели, менеджеры по продажам работают в мобильном приложении (iOS и Android), в том числе без сети. Основные действия: вести номенклатуру, считать себестоимость партий в рублях с НДС, контролировать остатки, оформлять коммерческие предложения и сделки, следить за сроками поставки и оплаты.

Цель: готовый продукт, а не MVP. Он закрывает весь список функций ниже, переживает обновления и сбои, имеет документацию и релизный конвейер. Не цели (нет в ТЗ, владелец может поднять через `CONTRACT GAP`): интеграция с 1С и бухгалтерские проводки; печать договоров, спецификаций и УПД (хранятся только их номера и даты, PDF создаётся только для КП); несколько складов и перемещения между ними; валюты кроме юаня; онлайн-оплата; портал клиента; мультиарендность; push-уведомления; обновление мобильного приложения по воздуху (OTA); сертификатный пиннинг мобильного клиента.

Список функций (каждая станет слайсом из раздела 15):

1. Вход, сессии, двухфакторная защита, роли и пользователи (слайс 1).
2. Номенклатура: карточка товара, поиск, архив (слайс 2).
3. Контрагенты (слайс 3).
4. Курсы юаня и партии с расчётом себестоимости, цены КП и прибыли (слайс 4).
5. Складской баланс с цветовой индикацией (слайс 5).
6. Сделки (реестр реализации): статусы, просрочка, контроль остатка, экспорт (слайс 6).
7. Импорт и экспорт номенклатуры CSV и XLSX (слайс 7).
8. Коммерческие предложения с PDF (слайс 8).
9. Панель руководителя: сводка и отчёты (слайс 9).
10. Журнал аудита и настройки (слайс 10).
11. API мобильного клиента и синхронизация (слайс 11).
12. Мобильное приложение: каркас, вход, локальная база, синхронизация (слайс 12).
13. Мобильное приложение: поиск и карточка товара с остатками (слайс 13).
14. Мобильное приложение: сделки и КП (слайс 14).
15. Режимы доступа и защита `internal` и `public` (слайс H).
16. Резервные копии и восстановление, в том числе кнопками в интерфейсе (слайс E).

Окружение и доверие. Работают 10-20 сотрудников. Сервер стоит на VPS за обратным прокси Caddy, мобильные клиенты ходят по HTTPS. Данные: коммерческая тайна (закупочные цены, себестоимость, маржа, список контрагентов с ИНН), персональные данные сотрудников и контактных лиц клиентов. Угрозы: подбор и кража паролей, перехват токена на потерянном телефоне, утечка себестоимости менеджером, сканирование и эксплуатация уязвимостей из интернета (режим `public`), потеря данных, взлом цепочки поставки зависимостей и конвейера. Режим `internal`: доступ только из внутренней сети или VPN. Режим `public`: сервис открыт в интернет. Меры для обоих режимов описаны в разделе 18, различаются только обязательные настройки.

Решения по ТЗ. Места, где ТЗ не задаёт правило или оставляет выбор, закрыты так:

| место ТЗ                                          | решение                                                                                                                                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| формула С/С не задана                             | режим `calculated`: `cost = (exw_cny * cny_rate * (1 + duty/100) + (transport + other) / quantity) * (1 + vat/100)`; режим `manual`: вводится вручную (раздел 4, `batches`)             |
| С/С и цена КП «с НДС», НДС 22%                    | ставка хранится в партии (`vat_pct`, по умолчанию из настройки `default_vat_pct` = 22)                                                                                                    |
| цвета остатков: зелёный больше 10, жёлтый меньше 5 | промежуток 5-10 не определён: красный 0, жёлтый 1-10, зелёный больше 10; порог 10 хранится в настройке `low_stock_threshold`                                                              |
| ГТД «10210020/051026/0012345»                     | номер хранится строкой `^\d{8}/\d{6}/\d{7}$`, дата ГТД отдельным полем, при пустой дате берётся из сегмента `DDMMYY`                                                                      |
| «поле ID товара полностью исключено»              | технический `id` (uuid) нигде не показывается человеку, поиск и карточки идут по `auteko_article` и `original_articles`                                                                   |
| управление правами                                | четыре роли: `admin` (руководитель), `accountant` (бухгалтер), `buyer` (закупщик), `sales` (менеджер); матрица в разделе 4; `sales` не видит себестоимость и прибыль                       |
| синхронизация каждые 15 минут                     | на iOS фоновое выполнение управляется системой и не гарантируется; приложение синхронизируется по таймеру 15 минут при открытом экране, фоновой задачей по возможности и по свайпу вниз |
| мобильное приложение «iOS/Android»                | одна кодовая база на React Native (Expo), локальная база SQLite с шифрованием                                                                                                           |
| сделка                                            | одна позиция: клиент, товар, партия; несколько позиций оформляются несколькими сделками, из КП они создаются одним действием                                                              |

Нефункциональные требования. Эталонное окружение: 2 vCPU, 4 ГБ RAM, PostgreSQL на том же хосте, 20 000 товаров, 60 000 партий, 300 000 сделок.

| требование           | значение                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| объём данных         | 20 000 товаров, 60 000 партий, 300 000 сделок, 5 000 контрагентов, 20 000 КП без деградации                                                                                                 |
| время отклика (web)  | список товаров с поиском p95 не больше 300 мс, карточка не больше 150 мс, создание сделки не больше 400 мс, PDF КП на 30 позиций не больше 3 с, импорт 1000 строк не больше 30 с             |
| мобильное приложение | поиск по локальной базе на 20 000 товаров не больше 100 мс, холодный старт до списка не больше 3 с, pull на 500 изменений не больше 1 с, офлайн-очередь до 500 мутаций                       |
| параллелизм          | 50 одновременных запросов без ошибок, 20 пользователей одновременно, при гонке за остаток продаж больше остатка нет                                                                         |
| платформы и браузеры | Node.js 26, PostgreSQL 18, Chrome, Edge, Firefox, Safari последних двух версий; iOS и Android не ниже минимума Expo SDK 57 (записывается в `apps/mobile/app.config.ts`)                    |
| доступность сервиса  | один экземпляр приложения; простой при обновлении не больше 5 минут; процесс перезапускается контейнером; мобильное приложение работает офлайн; цель восстановления: RTO 1 час, RPO 24 часа |
| обновление           | с любого предыдущего релиза 1.x; перед миграцией схемы автоматически создаётся резервная копия                                                                                              |
| резервная копия      | `pg_dump -Fc` ежедневно в 03:00 (`APP_TIMEZONE`), перед миграцией и перед восстановлением; хранение 14 ежедневных, 8 еженедельных, 6 ежемесячных; шифрование AES-256-GCM; проверка после создания |
| наблюдаемость        | структурный журнал JSON в stdout, проверки живости и готовности, `/api/version`, идентификатор запроса, журнал аудита в БД                                                                    |

> Резервные копии: принятое решение. Копирует `pg_dump` в формате custom в каталог `BACKUP_DIR`, каждая копия шифруется (`BACKUP_ENCRYPTION_KEY`), рядом лежит файл `.json` с размером, SHA-256, видом и временем. Расписание задаёт системный таймер хоста (`deploy/auteko-backup.timer`), приложение расписания не содержит. Администратор видит список копий в панели и кнопками создаёт копию, проверяет, скачивает, удаляет и восстанавливает. Копию за пределы сервера (S3, другой хост) оператор настраивает сам, пример `rclone` лежит в `docs/OPERATIONS.md`.

---

## 2. Стек

- Рантайм: Node.js 26 (LTS с октября 2026), версия записана в `.nvmrc` и в `engines` корневого `package.json`. Скрипты проекта это файлы `.ts`, их запускает `node` напрямую (снятие типов встроено, в `tsconfig` включён `erasableSyntaxOnly`).
- Язык и фреймворк web: TypeScript 7 (строгий режим, `noUncheckedIndexedAccess`), React 19, Next.js 16 (App Router, Server Components, Server Actions), Tailwind CSS 4.
- Мобильное приложение: Expo SDK 57, React Native 0.87, Expo Router, `expo-sqlite` (SQLCipher), `expo-secure-store`, `expo-background-task`, `expo-task-manager`, `expo-network`, `expo-file-system`, `expo-sharing`, `expo-local-authentication`, `@shopify/flash-list`.
- Хранилище: PostgreSQL 18 (PostgreSQL 19 на дату v1 в бета-версии, не используется), адрес из переменной окружения `DATABASE_URL`. Расширение `pg_trgm`. Идентификаторы `uuidv7()` средствами PostgreSQL.
- Доступ к БД: драйвер `pg`, SQL пишется вручную через тегированный шаблон `sql` (раздел 5), миграции это файлы `db/migrations/NNNN_name.sql` и собственный запуск (`migrate.ts`).
- Зависимости web: `next`, `react`, `react-dom`, `pg`, `@node-rs/argon2`, `otpauth`, `qrcode`, `exceljs`, `pdf-lib`, `@pdf-lib/fontkit`, `pino`, `ipaddr.js`, `zod` (только конверты API и синхронизации). Общий пакет `packages/shared` зависит от `zod`.
- Инструменты разработки: `typescript`, `eslint`, `typescript-eslint`, `eslint-plugin-vitest`, `prettier`, `prettier-plugin-tailwindcss`, `vitest`, `@vitest/coverage-v8`, `fast-check`, `@playwright/test`, `@axe-core/playwright`, `@stryker-mutator/core`, `@stryker-mutator/vitest-runner`, `lefthook`, `@types/node`, `@types/pg`, `@types/qrcode`. Внешние программы: `gitleaks`, `pg_dump` и `pg_restore` (в образе приложения), Maestro (мобильные e2e).
- Новая зависимость появляется только через `CONTRACT GAP`. Запрещены: ORM и построители запросов; стейт-менеджеры (Redux, Zustand и подобные); UI-библиотеки и CSS-in-JS; `xlsx` (версия из npm 0.18.5 содержит неисправленные уязвимости, замена `exceljs`); `jsonwebtoken` и `bcryptjs` (сессии непрозрачные, пароли `argon2id`); `dotenv` (окружение читает Node через `--env-file`); `moment` и аналоги (даты через `Intl` и строки ISO 8601).
- Версии на дату v1 (реестр npm): next 16.4.0, react 19.3.0, typescript 7.0.2, tailwindcss 4.3.3, expo 57.0.27, react-native 0.87.1, eslint 10.12.0, vitest 5.0.3, @playwright/test 1.64.0, zod 4.6.5, pg 8.23.1. Слайс 0A закрепляет точные версии в `package-lock.json`, дальше их обновляет Dependabot. Несовместимая пара инструментов (например, ESLint и TypeScript) решается выбором ближайшей совместимой версии с записью в CHANGELOG, это не `CONTRACT GAP`.

Команды проверок. Имена задач одинаковы в любом стеке. Каждая задача запускается через npm scripts корня репозитория и обходит все рабочие области (`packages/shared`, `apps/web`, `apps/mobile`).

| задача      | что делает                                                           | команда                                                                    |
| ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `fmt`       | проверка форматирования без правки                                   | `prettier --check .`                                                       |
| `fmt-write` | форматирование с правкой                                             | `prettier --write .`                                                       |
| `lint`      | статический анализ, включая правила безопасности раздела 18          | `eslint .`                                                                 |
| `types`     | проверка типов, предупреждения как ошибки                            | `npm run types --workspaces --if-present` (`next typegen && tsc --noEmit`) |
| `test`      | unit, integration и property тесты                                   | `vitest run`                                                               |
| `cov`       | те же тесты с покрытием и порогами раздела 9                         | `vitest run --coverage`                                                    |
| `docs`      | `scripts/check-docs.ts` (раздел 17)                                  | `node scripts/check-docs.ts`                                               |
| `criteria`  | `scripts/check-criteria.ts` (раздел 9)                               | `node scripts/check-criteria.ts`                                           |
| `commit`    | `scripts/check-commit-msg.ts` (раздел 11)                            | `node scripts/check-commit-msg.ts`                                         |
| `build`     | сборка поставляемого артефакта (web), `docker build` в слайсе R      | `npm run build -w apps/web`                                                |
| `e2e`       | сквозные тесты собранного артефакта                                  | `playwright test`                                                          |
| `mut`       | мутационное тестирование чистых модулей                              | `stryker run`                                                              |
| `audit`     | уязвимости зависимостей                                              | `npm audit --omit=dev --audit-level=high`                                  |
| `secrets`   | поиск секретов в репозитории и истории                               | `gitleaks detect --redact`                                                 |
| `hooks`     | установка git-хуков                                                  | `lefthook install`                                                         |
| `gate`      | составная: `fmt`, `lint`, `types`, `docs`, `criteria`, `cov`         | составная                                                                  |
| `gate-full` | составная: `gate`, `build`, `e2e`                                    | составная                                                                  |

Проектные задачи (не входят в `gate`): `dev` (запуск web), `db:migrate`, `db:reset` (только при `NODE_ENV` не `production`), `user:create`, `backup:run`, `backup:verify`, `backup:restore`, `mobile:start`.

Скрипты `check-docs`, `check-criteria`, `check-commit-msg`, `check-workflows` пишутся на TypeScript. Поведение описано в разделах 9, 11, 17 и 20, у каждого есть собственные тесты (слайс 0B).

---

## 3. Структура папок

```
.github/
  workflows/ci.yml, release.yml, codeql.yml
  dependabot.yml                    npm (workspaces), github-actions, docker
  ISSUE_TEMPLATE/bug.md, feature.md
  pull_request_template.md
.nvmrc  .gitignore  .gitleaks.toml  .prettierignore
package.json  package-lock.json     workspaces: apps/*, packages/*
tsconfig.base.json  eslint.config.js  prettier.config.js  vitest.config.ts  stryker.config.mjs
playwright.config.ts  lefthook.yml
Dockerfile  .dockerignore  compose.yaml     profiles internal и public, сервисы app, db, caddy
deploy/
  Caddyfile.internal, Caddyfile.public
  auteko-backup.service, auteko-backup.timer
  env.example                       все переменные окружения с описанием
LICENSE  tech.md
README.md  CONTRIBUTING.md  SECURITY.md  CHANGELOG.md
docs/OPERATIONS.md
db/migrations/                      NNNN_name.sql, каждый слайс добавляет свои файлы
packages/shared/
  src/
    types.ts  roles.ts  permissions.ts  money.ts  calc.ts  stock.ts
    ids.ts  normalize.ts  domain-literals.ts  errors.ts  dates.ts
    validate/ products.ts clients.ts batches.ts deals.ts quotes.ts users.ts
    sync.ts                         конверты синхронизации (zod), типы мутаций
    i18n/ index.ts, ru.ts           общие ключи: ошибки, статусы, роли
  tests/ ...
apps/web/
  src/
    proxy.ts  instrumentation.ts
    app/
      layout.tsx  globals.css  not-found.tsx  error.tsx
      (public)/login/ page.tsx actions.ts  login/totp/page.tsx
      (app)/
        layout.tsx  page.tsx                                 панель руководителя
        products/ page.tsx new/page.tsx [id]/page.tsx actions.ts import/page.tsx
        clients/  page.tsx new/page.tsx [id]/page.tsx actions.ts
        rates/    page.tsx actions.ts
        batches/  page.tsx new/page.tsx [id]/page.tsx actions.ts
        stock/    page.tsx
        deals/    page.tsx new/page.tsx [id]/page.tsx actions.ts
        quotes/   page.tsx new/page.tsx [id]/page.tsx actions.ts
        reports/  page.tsx
        account/  page.tsx actions.ts                        пароль, 2FA, сессии
        admin/users/ page.tsx [id]/page.tsx actions.ts
        admin/audit/page.tsx  admin/settings/ page.tsx actions.ts
        admin/backups/ page.tsx actions.ts
      api/health/live/route.ts  api/health/ready/route.ts  api/version/route.ts
      api/v1/auth/login/route.ts  api/v1/auth/refresh/route.ts  api/v1/auth/logout/route.ts
      api/v1/me/route.ts  api/v1/sync/pull/route.ts  api/v1/sync/push/route.ts
      api/v1/quotes/[id]/pdf/route.ts
      export/products/route.ts  export/deals/route.ts  export/stock/route.ts
    components/ui/     Button Input Select Textarea Field Table Badge StockBadge StatusPill
                       Card Alert EmptyState Pagination Toolbar Details Chart
    components/layout/ Sidebar MobileNav Header
    server/
      config.ts  logger.ts  errors.ts  maintenance.ts
      data/      db.ts sql.ts migrate.ts mappers.ts users.ts sessions.ts products.ts clients.ts
                 rates.ts batches.ts stock.ts deals.ts quotes.ts audit.ts settings.ts
                 sync.ts stats.ts counters.ts
      services/  auth.ts users.ts products.ts import.ts clients.ts rates.ts batches.ts
                 stock.ts deals.ts quotes.ts reports.ts sync.ts backup.ts settings.ts
      security/  headers.ts csrf.ts safe-redirect.ts rate-limit.ts client-ip.ts passwords.ts
                 common-passwords.txt totp.ts crypto.ts tokens.ts guard.ts
      export/    xlsx.ts csv.ts quote-pdf.ts fonts/PTSans-Regular.ttf fonts/PTSans-Bold.ttf
      backup/    run.ts verify.ts restore.ts retention.ts stream-crypto.ts
    i18n/ index.ts  ru.ts
  tests/ helpers/ ...
  e2e/   empty.*.spec.ts  *.spec.ts      файлы empty.* читают пустое хранилище и ничего не пишут
apps/mobile/
  app.config.ts  eas.json  babel.config.js  metro.config.js
  app/ _layout.tsx  (auth)/login.tsx  (tabs)/_layout.tsx  (tabs)/search.tsx  (tabs)/deals.tsx
       (tabs)/quotes.tsx  (tabs)/settings.tsx  product/[article].tsx  deal/new.tsx  deal/[id].tsx
       quote/new.tsx  quote/[id].tsx
  src/
    ui/       Screen Card ArticleLabel StockBadge Button TextField EmptyState SyncBanner
    db/       local-db.ts schema.ts migrations.ts queries.ts
    sync/     engine.ts outbox.ts pull.ts push.ts background.ts
    auth/     session.ts lock.ts
    api/      client.ts
    i18n/     index.ts ru.ts
  tests/ helpers/ ...
  e2e/ *.yaml                           сценарии Maestro
scripts/
  check-docs.ts  check-criteria.ts  check-commit-msg.ts  check-workflows.ts
  create-user.ts  backup.ts
```

> Дерево задаёт каталоги слоёв и файлы, у которых есть собственная ответственность. Шаблон `*.spec.ts` и файлы тестов по модулям в дерево не расписаны, их имена следуют разделу «Тесты» каждого слайса.

Правила размещения:

- Слои не перескакивают: страницы, действия и обработчики API вызывают `services`, `services` вызывают `data`. Интерфейс не обращается к хранилищу напрямую.
- Запросы и работа с драйвером живут только в `apps/web/src/server/data`. Исключения: тест миграций готовит старое состояние запросами, `server/backup` вызывает `pg_dump` и `pg_restore` как внешние программы.
- Чистая логика (валидация, расчёты, остатки, форматирование, права, `safeRedirect`) лежит в `packages/shared` или в `server/security` и тестируется без хранилища. Расчёт себестоимости существует только в `packages/shared/src/calc.ts`, триггеров с расчётами в БД нет.
- Тексты интерфейса лежат только в каталогах переводов (`i18n`). Единственное исключение для литералов с кириллицей вне словарей: `packages/shared/src/domain-literals.ts` (слово «все» в моделях ДВС, синонимы «да» и «нет» при импорте, кириллическая «М» в моделях).
- Файлы сверх этого дерева не создаются. Нужен новый файл: `CONTRACT GAP`.

---

## 4. Контракт данных (заморожен после слайса 0A)

Стиль имён: snake_case в хранилище, API и коде. Имена в таблицах точные, варианты не придумываются. Деньги и ставки хранятся как `numeric`, в коде и в JSON это десятичные строки (`"1234.50"`), вычисления идут функциями `money.ts` на `bigint`, `float` для денег не используется.

Сущность `users`:

| поле                   | тип хранилища | ограничения                                                |
| ---------------------- | ------------- | ---------------------------------------------------------- |
| `id`                   | uuid          | PK, `uuidv7()`                                             |
| `email`                | text          | not null, уникален по `lower(email)`, до 254 символов      |
| `full_name`            | text          | not null, до 200                                           |
| `role`                 | text          | `admin`, `accountant`, `buyer`, `sales`                    |
| `password_hash`        | text          | not null, `argon2id`                                       |
| `must_change_password` | boolean       | not null, по умолчанию true                                |
| `totp_secret_enc`      | text          | null, AES-256-GCM, base64                                  |
| `totp_enabled`         | boolean       | not null, по умолчанию false                               |
| `recovery_codes_hash`  | text[]        | not null, по умолчанию пустой массив                       |
| `is_active`            | boolean       | not null, по умолчанию true                                |
| `failed_login_count`   | integer       | not null, по умолчанию 0                                   |
| `locked_until`         | timestamptz   | null                                                       |
| `password_changed_at`  | timestamptz   | not null                                                   |
| `last_login_at`        | timestamptz   | null                                                       |
| `created_at`           | timestamptz   | not null, по умолчанию `now()`                             |
| `updated_at`           | timestamptz   | not null                                                   |

Сущность `sessions`:

| поле           | тип хранилища | ограничения                                                            |
| -------------- | ------------- | ---------------------------------------------------------------------- |
| `id`           | text          | PK, SHA-256 (hex) от токена, сам токен в БД не хранится                |
| `user_id`      | uuid          | FK `users`, on delete cascade                                          |
| `kind`         | text          | `web`, `mobile`                                                        |
| `refresh_hash` | text          | null, уникален, только для `mobile`                                    |
| `family_id`    | uuid          | not null, общий для цепочки обновлений                                 |
| `device_name`  | text          | null, до 100                                                           |
| `ip`           | inet          | null                                                                   |
| `user_agent`   | text          | null, до 300                                                           |
| `created_at`, `last_seen_at`, `expires_at` | timestamptz | not null                                  |
| `revoked_at`   | timestamptz   | null                                                                   |

Сущность `products` (синхронизируется):

| поле                  | тип хранилища | ограничения                                                                  |
| --------------------- | ------------- | ---------------------------------------------------------------------------- |
| `id`                  | uuid          | PK, `uuidv7()`                                                               |
| `auteko_article`      | text          | not null, уникален по `lower(auteko_article)`                                |
| `original_articles`   | text[]        | not null, по умолчанию пустой                                                |
| `name`                | text          | not null                                                                     |
| `engine_models`       | text[]        | not null, по умолчанию пустой                                                |
| `tnved_code`          | text          | null, `^[0-9]{10}$`                                                          |
| `production_days_min` | integer       | null, больше 0                                                               |
| `production_days_max` | integer       | null, не меньше `production_days_min`                                        |
| `is_available`        | boolean       | not null, по умолчанию true                                                  |
| `notes`               | text          | null                                                                         |
| `status`              | text          | `active`, `archived`                                                         |
| `search_key`          | text          | not null, нормализованные артикулы и название, GIN-индекс `pg_trgm`          |
| `created_by`          | uuid          | FK `users`                                                                   |
| `created_at`, `updated_at` | timestamptz | not null                                                                  |
| `sync_seq`            | bigint        | not null, назначает триггер                                                  |

Сущность `clients` (синхронизируется): `id` uuid PK; `company_name` text not null; `inn` text null (10 или 12 цифр, контрольная сумма); `contact_person` text null; `phone` text null; `email` text null; `notes` text null; `deleted_at` timestamptz null; `created_at`, `updated_at` timestamptz not null; `sync_seq` bigint not null.

Сущность `exchange_rates`: `id` uuid PK; `currency` text (`CNY`); `rate` numeric(12,4) больше 0; `rate_date` date; `source` text (`manual`, `cbr`); `created_by` uuid FK `users`; `created_at` timestamptz; уникальность по (`currency`, `rate_date`).

Сущность `batches` (синхронизируется, только поля, доступные роли):

| поле                   | тип хранилища  | ограничения                                                               |
| ---------------------- | -------------- | ------------------------------------------------------------------------- |
| `id`                   | uuid           | PK                                                                        |
| `batch_number`         | text           | not null, уникален, `^P-[0-9]{4}-[0-9]{2,}$`                              |
| `product_id`           | uuid           | FK `products`, not null                                                   |
| `quantity`             | integer        | больше 0                                                                  |
| `price_exw_cny`        | numeric(14,4)  | больше 0                                                                  |
| `cny_rate`             | numeric(12,4)  | больше 0                                                                  |
| `cny_rate_date`        | date           | not null                                                                  |
| `customs_duty_pct`     | numeric(5,2)   | от 0 до 100, по умолчанию 0                                               |
| `vat_pct`              | numeric(5,2)   | от 0 до 100, по умолчанию из настройки `default_vat_pct`                  |
| `transport_cost_rub`   | numeric(14,2)  | не меньше 0, на всю партию                                                |
| `other_costs_rub`      | numeric(14,2)  | не меньше 0, на всю партию                                                |
| `cost_mode`            | text           | `calculated`, `manual`                                                    |
| `cost_price_rub`       | numeric(14,2)  | не меньше 0, с НДС, за единицу                                            |
| `markup_coefficient`   | numeric(6,3)   | больше 0, по умолчанию из настройки `default_markup`                      |
| `price_mode`           | text           | `markup`, `manual`                                                        |
| `price_kp_rub`         | numeric(14,2)  | больше 0, с НДС, за единицу                                               |
| `profit_per_unit_rub`  | numeric(14,2)  | `price_kp_rub - cost_price_rub`                                           |
| `gtd_number`           | text           | null, `^[0-9]{8}/[0-9]{6}/[0-9]{7}$`                                      |
| `gtd_date`             | date           | null                                                                      |
| `notes`                | text           | null                                                                      |
| `version`              | integer        | not null, растёт на 1 при каждом изменении                                |
| `created_by`, `created_at`, `updated_at`, `sync_seq` | | как у `products`                                                |

Сущность `deals` (синхронизируется):

| поле                   | тип хранилища  | ограничения                                                             |
| ---------------------- | -------------- | ----------------------------------------------------------------------- |
| `id`                   | uuid           | PK                                                                      |
| `deal_number`          | text           | not null, уникален, `^R-[0-9]{3,}$`, назначает сервер                   |
| `client_id`            | uuid           | FK `clients`, not null                                                  |
| `product_id`           | uuid           | FK `products`, not null                                                 |
| `batch_id`             | uuid           | FK `batches`, not null, партия относится к `product_id`                  |
| `owner_user_id`        | uuid           | FK `users`, not null, ответственный менеджер                            |
| `quote_id`             | uuid           | null, FK `quotes`                                                       |
| `contract_number`      | text           | null                                                                    |
| `spec_number`          | text           | null                                                                    |
| `quantity`             | integer        | больше 0                                                                |
| `price_with_vat`       | numeric(14,2)  | больше 0, за единицу                                                    |
| `total_amount`         | numeric(16,2)  | generated: `quantity * price_with_vat`                                  |
| `delivery_deadline`    | date           | null                                                                    |
| `prepayment_date`      | date           | null                                                                    |
| `actual_delivery_date` | date           | null                                                                    |
| `actual_payment_date`  | date           | null                                                                    |
| `upd_number`           | text           | null                                                                    |
| `upd_date`             | date           | null                                                                    |
| `status`               | text           | `new`, `confirmed`, `shipped`, `done`, `cancelled`                      |
| `notes`                | text           | null                                                                    |
| `client_request_id`    | uuid           | null, уникален, идемпотентность создания с мобильного клиента           |
| `version`              | integer        | not null, растёт на 1 при каждом изменении                              |
| `created_at`, `updated_at`, `sync_seq` | | как у `products`                                                      |

Сущности `quotes` и `quote_items` (синхронизируются): `quotes`: `id` uuid PK; `quote_number` text уникален, `^KP-[0-9]{4}-[0-9]{4,}$`; `client_id` uuid; `owner_user_id` uuid; `status` text (`draft`, `sent`, `accepted`, `rejected`, `expired`); `valid_until` date; `notes` text null; `version` integer; `created_at`, `updated_at`, `sync_seq`. `quote_items`: `id` uuid PK; `quote_id` uuid FK on delete cascade; `position` integer, уникален вместе с `quote_id`; `product_id` uuid; `batch_id` uuid null; `quantity` integer больше 0; `unit_price_with_vat` numeric(14,2) больше 0. Позиции приходят и уходят вместе с КП одним объектом.

Остальные сущности: `audit_log` (`id` bigint identity, `at` timestamptz, `user_id` uuid null, `user_email` text, `action` text, `entity` text null, `entity_id` text null, `details` jsonb, `ip` inet null; секреты и пароли в `details` не попадают); `settings` (`key` text PK, `value` text, `updated_at`, `updated_by`; допустимые ключи: `low_stock_threshold` = 10, `default_vat_pct` = 22, `default_markup` = 1.25, `quote_validity_days` = 14); `doc_counters` (`kind` text, `year` integer, `last` integer, PK по паре; виды `deal` с годом 0, `quote` и `batch` с годом документа); `sync_mutations` (`id` uuid PK, `user_id` uuid, `type` text, `applied_at` timestamptz, `result` jsonb); `schema_migrations` (`version` integer PK, `name` text, `applied_at` timestamptz, `checksum` text).

Синхронизация. Последовательность `sync_seq` и триггер `set_sync_seq` (BEFORE INSERT OR UPDATE на `products`, `clients`, `batches`, `deals`, `quotes`) назначают каждой изменённой строке следующее значение. Триггер берёт `pg_advisory_xact_lock` до `nextval`, поэтому порядок фиксации транзакций совпадает с порядком `sync_seq` и клиент по курсору не пропускает строки. Это единственный триггер в схеме. Партия получает новый `sync_seq` и при изменении остатка (создание, изменение, отмена сделки), см. `touchBatch` в разделе 5.

Тип приложения (`packages/shared/src/types.ts`):

```ts
export type Uuid = string
export type Decimal = string // десятичная строка, например "1234.50"
export type IsoDate = string // YYYY-MM-DD
export type IsoDateTime = string // 2026-10-11T10:15:00Z

export type Role = 'admin' | 'accountant' | 'buyer' | 'sales'
export type DealStatus = 'new' | 'confirmed' | 'shipped' | 'done' | 'cancelled'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type StockStatus = 'green' | 'yellow' | 'red'

export interface User { id: Uuid; email: string; full_name: string; role: Role; must_change_password: boolean; totp_enabled: boolean; is_active: boolean; last_login_at: IsoDateTime | null; created_at: IsoDateTime }

export interface Product {
  id: Uuid; auteko_article: string; original_articles: string[]; name: string; engine_models: string[]
  tnved_code: string | null; production_days_min: number | null; production_days_max: number | null
  is_available: boolean; notes: string | null; status: 'active' | 'archived'
  created_at: IsoDateTime; updated_at: IsoDateTime
}

export interface Client { id: Uuid; company_name: string; inn: string | null; contact_person: string | null; phone: string | null; email: string | null; notes: string | null; created_at: IsoDateTime; updated_at: IsoDateTime }

// Полная партия видна ролям admin, accountant, buyer
export interface Batch {
  id: Uuid; batch_number: string; product_id: Uuid; quantity: number
  price_exw_cny: Decimal; cny_rate: Decimal; cny_rate_date: IsoDate
  customs_duty_pct: Decimal; vat_pct: Decimal; transport_cost_rub: Decimal; other_costs_rub: Decimal
  cost_mode: 'calculated' | 'manual'; cost_price_rub: Decimal
  markup_coefficient: Decimal; price_mode: 'markup' | 'manual'; price_kp_rub: Decimal; profit_per_unit_rub: Decimal
  gtd_number: string | null; gtd_date: IsoDate | null; notes: string | null
  version: number; created_at: IsoDateTime; updated_at: IsoDateTime
}

// Урезанная партия для роли sales и для мобильного клиента
export type BatchPublic = Pick<Batch, 'id' | 'batch_number' | 'product_id' | 'price_kp_rub' | 'version' | 'updated_at'> & { received: number; sold: number; balance: number }

export interface Deal {
  id: Uuid; deal_number: string; client_id: Uuid; product_id: Uuid; batch_id: Uuid; owner_user_id: Uuid; quote_id: Uuid | null
  contract_number: string | null; spec_number: string | null; quantity: number; price_with_vat: Decimal; total_amount: Decimal
  delivery_deadline: IsoDate | null; prepayment_date: IsoDate | null; actual_delivery_date: IsoDate | null; actual_payment_date: IsoDate | null
  upd_number: string | null; upd_date: IsoDate | null; status: DealStatus; notes: string | null
  version: number; created_at: IsoDateTime; updated_at: IsoDateTime
}

export interface QuoteItem { id: Uuid; position: number; product_id: Uuid; batch_id: Uuid | null; quantity: number; unit_price_with_vat: Decimal }
export interface Quote { id: Uuid; quote_number: string; client_id: Uuid; owner_user_id: Uuid; status: QuoteStatus; valid_until: IsoDate; notes: string | null; items: QuoteItem[]; version: number; created_at: IsoDateTime; updated_at: IsoDateTime }

export interface StockRow { product_id: Uuid; auteko_article: string; name: string; engine_models: string[]; batch_id: Uuid; batch_number: string; received: number; sold: number; balance: number; price_kp_rub: Decimal; stock_status: StockStatus }
```

Правила, которые действуют в любом проекте:

- Время хранится в UTC (`timestamptz`). В тип приложения оно попадает как ISO 8601 с `Z`. Календарные даты (`date`) это строки `YYYY-MM-DD` без пояса. «Сегодня» для просрочки и сроков считается в поясе `APP_TIMEZONE` (по умолчанию `Europe/Moscow`) одной функцией `today(tz)` из `dates.ts`.
- Булевы, перечисления, числа и время преобразует одна функция-маппер в `server/data/mappers.ts`, больше нигде.
- Версия схемы хранится в `schema_migrations`. Изменение схемы это новая миграция через `CONTRACT GAP`, существующую миграцию не правят (раннер проверяет контрольную сумму). Хранилище прошлых версий открывается без потери данных. Хранилище новее приложения не открывается: ошибка называет версию.
- Идентификаторы это `uuid`, не переиспользуются. Наружу (адрес, форма, API) id приходит строкой и разбирается по разделу 8. Человеку показываются только `auteko_article`, `batch_number`, `deal_number`, `quote_number`.
- Расчёт остатка: `balance = batches.quantity - SUM(deals.quantity) по сделкам партии со статусом не равным cancelled`. Цвет: `red` при `balance <= 0`, `yellow` при `balance` от 1 до `low_stock_threshold` включительно, иначе `green`. Функция `stockStatus(balance, threshold)` живёт в `stock.ts`.
- Расчёт партии (`calc.ts`, единственное место): при `cost_mode = calculated`: `cost_price_rub = round2((exw * rate * (1 + duty/100) + (transport + other) / quantity) * (1 + vat/100))`; при `price_mode = markup`: `price_kp_rub = round2(cost_price_rub * markup_coefficient)`; `profit_per_unit_rub = price_kp_rub - cost_price_rub`. Округление: к ближайшему, половина вверх, только в конце.
- Поля и сущности, которых здесь нет, добавляются только через `CONTRACT GAP`.

Права (замороженный контракт). `да` разрешено, `свои` только для записей, где `owner_user_id` равен пользователю, `нет` запрещено. Проверка идёт на сервере в `server/security/guard.ts` по таблице из `packages/shared/src/permissions.ts`.

| ресурс и действие                                   | admin | accountant | buyer | sales |
| --------------------------------------------------- | ----- | ---------- | ----- | ----- |
| пользователи, настройки, резервные копии, аудит     | да    | нет        | нет   | нет   |
| товары: чтение                                      | да    | да         | да    | да    |
| товары: создание, изменение, архив, импорт          | да    | нет        | да    | нет   |
| контрагенты: чтение                                 | да    | да         | да    | да    |
| контрагенты: создание, изменение, удаление          | да    | да         | нет   | да    |
| курсы валют: чтение                                 | да    | да         | да    | нет   |
| курсы валют: запись                                 | да    | да         | да    | нет   |
| партии: чтение (с себестоимостью)                   | да    | да         | да    | нет   |
| партии: запись полей закупки (группа P)             | да    | нет        | да    | нет   |
| партии: запись финансовых полей (группа F)          | да    | да         | нет   | нет   |
| остатки: чтение с себестоимостью                    | да    | да         | да    | нет   |
| остатки: чтение без себестоимости (`BatchPublic`)   | да    | да         | да    | да    |
| сделки: чтение                                      | да    | да         | нет   | свои  |
| сделки: создание                                    | да    | да         | нет   | да    |
| сделки: изменение полей оплаты и УПД, статусы       | да    | да         | нет   | нет   |
| сделки: изменение прочих полей, отмена              | да    | нет        | нет   | свои, пока статус `new` или `confirmed` |
| КП: чтение                                          | да    | да         | нет   | свои  |
| КП: создание, изменение, PDF                        | да    | нет        | нет   | свои  |
| панель и отчёты                                     | все   | все        | остатки и закупки | свои сделки |

Группа P полей партии: `batch_number`, `product_id`, `quantity`, `price_exw_cny`, `cny_rate`, `cny_rate_date`, `transport_cost_rub`, `notes`. Группа F: `customs_duty_pct`, `vat_pct`, `other_costs_rub`, `cost_mode`, `cost_price_rub`, `markup_coefficient`, `price_mode`, `price_kp_rub`, `gtd_number`, `gtd_date`. Роль `sales` никогда не получает от сервера поля `price_exw_cny`, `cny_rate`, `cny_rate_date`, `customs_duty_pct`, `vat_pct`, `transport_cost_rub`, `other_costs_rub`, `cost_mode`, `cost_price_rub`, `markup_coefficient`, `price_mode`, `profit_per_unit_rub`, `gtd_number`, `gtd_date`, ни в web, ни в API, ни в синхронизации, ни в PDF, ни в экспорте.

---

## 5. API доступа к данным (заморожен после слайса 0A)

Модули `apps/web/src/server/data/*.ts` экспортируют только это. Параметр `db` это `Db` (пул или транзакция), так операции из нескольких запросов выполняются в одной транзакции.

```ts
// db.ts
export type Db = { query<T>(q: SqlQuery): Promise<T[]>; one<T>(q: SqlQuery): Promise<T | undefined> }
export function openPool(url?: string): Db & { close(): Promise<void> }
export function withTx<T>(db: Db, fn: (tx: Db) => Promise<T>): Promise<T>
// sql.ts: тегированный шаблон, значения становятся параметрами $1, $2
export function sql(strings: TemplateStringsArray, ...values: unknown[]): SqlQuery
export function ident(name: string, allowed: readonly string[]): SqlQuery // имя колонки из белого списка
// migrate.ts
export function migrate(db: Db, opts?: { backupFirst?: boolean }): Promise<{ from: number; to: number }>
export function schemaVersion(db: Db): Promise<number>

// users.ts, sessions.ts
listUsers(db): Promise<User[]>   getUser(db, id): Promise<User | undefined>   getUserAuth(db, email): Promise<UserAuth | undefined>
createUser(db, v: NewUser): Promise<User>   updateUser(db, id, patch): Promise<User | undefined>   countActiveAdmins(db): Promise<number>
recordLoginFailure(db, id, lockUntil: Date | null): Promise<void>   recordLoginSuccess(db, id): Promise<void>
createSession(db, v: NewSession): Promise<void>   getSession(db, idHash): Promise<Session | undefined>
touchSession(db, idHash, now): Promise<void>   rotateRefresh(db, refreshHash, next: NewSession): Promise<RotateResult>
revokeSession(db, idHash): Promise<void>   revokeFamily(db, familyId): Promise<void>   revokeUserSessions(db, userId, exceptHash?): Promise<number>   listUserSessions(db, userId): Promise<Session[]>

// products.ts
listProducts(db, q: ProductListQuery): Promise<Page<Product>>        // search, engine, status, page, limit
getProduct(db, id): Promise<Product | undefined>   getProductByArticle(db, article): Promise<Product | undefined>
createProduct(db, v: NewProduct): Promise<Product>   updateProduct(db, id, patch): Promise<Product | undefined>
setProductStatus(db, id, status): Promise<void>   countProductBatches(db, id): Promise<number>
upsertProductsBulk(db, rows: NewProduct[]): Promise<{ created: number; skipped: number }>

// clients.ts
listClients(db, q): Promise<Page<ClientWithCount>>   getClient(db, id)   createClient(db, v)   updateClient(db, id, patch)
softDeleteClient(db, id): Promise<void>   countClientDeals(db, id): Promise<number>

// rates.ts
listRates(db, q): Promise<Page<ExchangeRate>>   getRate(db, currency, date): Promise<ExchangeRate | undefined>
latestRate(db, currency, onOrBefore: IsoDate): Promise<ExchangeRate | undefined>   saveRate(db, v: NewRate): Promise<ExchangeRate>

// batches.ts
listBatches(db, q: BatchListQuery): Promise<Page<Batch>>   getBatch(db, id)   getBatchForUpdate(tx, id)   // SELECT ... FOR UPDATE
createBatch(db, v: NewBatchRow): Promise<Batch>   updateBatch(db, id, patch, expectedVersion: number): Promise<Batch | 'version_conflict' | undefined>
deleteBatch(db, id): Promise<void>   touchBatch(tx, id): Promise<void>   countBatchDeals(db, id): Promise<number>

// stock.ts
listStock(db, q: StockQuery): Promise<Page<StockRow>>   getBatchBalance(tx, batchId): Promise<{ received: number; sold: number; balance: number } | undefined>

// deals.ts
listDeals(db, q: DealListQuery): Promise<{ items: DealRow[]; total: number; overdue_count: number }>
getDeal(db, id): Promise<Deal | undefined>   getDealByRequestId(db, requestId): Promise<Deal | undefined>
createDeal(tx, v: NewDealRow): Promise<Deal>   updateDeal(tx, id, patch, expectedVersion): Promise<Deal | 'version_conflict' | undefined>
exportDeals(db, filter): AsyncIterable<DealExportRow>

// quotes.ts
listQuotes(db, q): Promise<Page<QuoteRow>>   getQuote(db, id): Promise<Quote | undefined>
createQuote(tx, v: NewQuote): Promise<Quote>   updateQuote(tx, id, patch, expectedVersion): Promise<Quote | 'version_conflict' | undefined>   deleteQuote(db, id): Promise<void>

// counters.ts
nextNumber(tx, kind: 'deal' | 'quote' | 'batch', year: number): Promise<string>   peekNumber(db, kind, year): Promise<string>

// settings.ts, audit.ts, stats.ts
getSettings(db): Promise<Settings>   setSetting(db, key, value, userId): Promise<void>
writeAudit(db, e: AuditEvent): Promise<void>   listAudit(db, q: AuditQuery): Promise<Page<AuditRow>>
dashboardStats(db, scope: StatsScope): Promise<DashboardStats>   reportSales(db, q): Promise<SalesReportRow[]>   reportReceivables(db): Promise<ReceivableRow[]>

// sync.ts
pullChanges(db, user: SyncUser, cursor: number, limit: number): Promise<SyncPull>   // уже с урезанными полями для роли
getMutation(db, id): Promise<SyncMutation | undefined>   saveMutation(tx, m: SyncMutation): Promise<void>
```

Правила, которые действуют в любом проекте:

- Функции принимают уже валидные данные. Валидацию делает слой выше до вызова.
- Ожидаемое отсутствие (нет сущности с таким id) это `undefined`, а не исключение. Изменение несуществующей сущности ничего не создаёт. Удаление и изменение флага для несуществующего id ничего не делают и не падают.
- Все запросы параметризованы через `sql`. Конкатенация и форматирование строк с данными внутри запроса запрещены (линтер, раздел 18). Имя колонки для сортировки берётся только через `ident` с белым списком.
- Операция из нескольких запросов идёт в одной транзакции (`withTx`). Остаток проверяется под блокировкой строки партии (`getBatchForUpdate`) в той же транзакции, что и вставка сделки.
- Пул создаётся один раз, адрес берётся из `DATABASE_URL`, есть явная функция `close`. Явно переданный адрес открывает отдельный пул, закрывает его вызывающий. Приложение работает под ролью БД `auteko_app` (только DML), миграции под `auteko_migrator` (DDL).
- Поиск и сравнение строк: обе стороны нормализуются в NFC, регистр снимается приведением, не зависящим от локали процесса, латинские двойники кириллических букв (A, B, E, K, M, H, O, P, C, T, X) сводятся к одной форме функцией `normalizeKey` (раздел 8). Спецсимволы запроса (`%`, `_`, `\`, `'`, `.`, `*`) ищутся как обычные.
- Тесты получают чистую БД на каждый тест: `resetDb()` в начале теста очищает таблицы и сбрасывает счётчики (раздел 9).

---

## 6. Интерфейс

### Web-панель

Примитивы лежат в `apps/web/src/components/ui` и используются во всех слайсах. Свой элемент вместо примитива в экранах не пишется.

| компонент    | пропсы                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| `Button`     | `variant` (`primary`, `secondary`, `danger`), `type`, `disabled`, `formAction` |
| `Input`      | `name`, `label`, `type`, `value`, `error`, `hint`, `required`, `maxLength`  |
| `Select`     | `name`, `label`, `options`, `value`, `error`                                |
| `Textarea`   | `name`, `label`, `value`, `error`, `maxLength`                              |
| `Field`      | `label`, `error`, `hint`, `children` (связывает подпись, ошибку и поле)     |
| `Table`      | `columns`, `rows`, `emptyText`, `caption`                                   |
| `Badge`      | `tone` (`neutral`, `success`, `warning`, `danger`), `children`              |
| `StockBadge` | `status` (`green`, `yellow`, `red`), `balance`                              |
| `StatusPill` | `status` (`DealStatus` или `QuoteStatus`), `overdue`                        |
| `Card`       | `title`, `children`, `href` (карточка-ссылка без вложенных интерактивных элементов) |
| `Alert`      | `tone`, `children`                                                          |
| `EmptyState` | `title`, `text`, `action`                                                   |
| `Pagination` | `page`, `limit`, `total`, `hrefFor`                                         |
| `Toolbar`    | `children` (поиск, фильтры, кнопки действий)                                |
| `Details`    | `summary`, `children` (подтверждение разрушительных действий без JS)        |
| `Chart`      | `kind` (`bar`, `line`), `series`, `label` (SVG, без библиотек)              |

Требования ко всем примитивам (раздел 19):

- Поле ввода связано с подписью, при ошибке получает `aria-invalid` и `aria-describedby` на текст ошибки.
- Кнопка это нативный элемент. Опасность не передаётся только цветом: текст называет действие.
- Состояние остатка и статуса передаётся цветом и текстом.
- У интерактивных элементов виден фокус, область нажатия не меньше 24 на 24 css-пикселя.
- Тексты примитивы получают параметрами. Своих строк у них нет.
- Отдельного экрана-витрины примитивов нет. Элемент, который не используется ни одним слайсом, не пишется.

### Мобильное приложение

Примитивы лежат в `apps/mobile/src/ui`. Экраны: «Поиск и справка» (вкладка `search`, карточка `product/[article]`), «Сделки» (вкладка `deals`, `deal/new`, `deal/[id]`), «КП» (вкладка `quotes`, `quote/new`, `quote/[id]`), «Настройки» (вкладка `settings`: пользователь, состояние синхронизации, блокировка, выход).

| компонент      | пропсы                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `Screen`       | `title`, `children`, `onRefresh`, `refreshing` (pull-to-refresh запускает синхронизацию)       |
| `Card`         | `onPress`, `children`                                                                          |
| `ArticleLabel` | `article` (крупно), `original` (светло, для справки)                                           |
| `StockBadge`   | `status`, `balance` (зелёный, жёлтый, красный и число)                                         |
| `Button`       | `variant`, `onPress`, `disabled`, `loading`                                                    |
| `TextField`    | `label`, `value`, `onChangeText`, `error`, `keyboardType`                                      |
| `EmptyState`   | `title`, `text`                                                                                |
| `SyncBanner`   | `state` (`idle`, `syncing`, `offline`, `error`), `lastSyncAt`, `pending`                       |

Списки (100 и больше позиций) строятся на `FlashList`. На карточке товара основной идентификатор `auteko_article` крупным шрифтом, `original_articles` светлым.

---

## 7. Точки входа (маршруты)

Web-страницы. Роли берутся из матрицы раздела 4, страница без права на чтение отвечает 403.

| путь                          | что делает                                                                  | действия                                                              |
| ----------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/login`, `/login/totp`       | вход, второй фактор                                                         | `login`, `verifyTotp`                                                 |
| `/`                           | панель руководителя                                                         |                                                                       |
| `/products`, `/products/[id]` | список с поиском и фильтром по ДВС, карточка и форма                        | `save`, `setStatus` (`archived=1`), `delete`                          |
| `/products/new`               | создание товара                                                             | `save`                                                                |
| `/products/import`            | загрузка CSV/XLSX с предпросмотром, шаблон                                  | `preview`, `commit`                                                   |
| `/clients`, `/clients/[id]`   | список и карточка контрагента                                               | `save`, `delete`                                                      |
| `/rates`                      | курсы юаня, кнопка «Загрузить курс ЦБ РФ»                                   | `save`, `fetchCbr`                                                    |
| `/batches`, `/batches/[id]`   | список партий, форма с живым расчётом                                       | `save`, `delete`                                                      |
| `/stock`                      | складской баланс по товарам и партиям                                       |                                                                       |
| `/deals`, `/deals/[id]`       | реестр сделок, фильтры по статусу, просрочке, клиенту                       | `save`, `setStatus`, `cancel`                                         |
| `/quotes`, `/quotes/[id]`     | список КП, форма, скачивание PDF, создание сделок из КП                     | `save`, `setStatus`, `createDeals`, `delete`                          |
| `/reports`                    | отчёты: продажи и прибыль за период, дебиторка                              |                                                                       |
| `/account`                    | смена пароля, настройка 2FA, список и отзыв сессий                          | `changePassword`, `enableTotp`, `disableTotp`, `revokeSession`        |
| `/admin/users`                | пользователи и роли                                                         | `create`, `update`, `resetPassword`, `resetTotp`, `deactivate`        |
| `/admin/audit`                | журнал аудита с фильтрами                                                   |                                                                       |
| `/admin/settings`             | настройки (порог остатка, НДС, наценка, срок КП)                            | `save`                                                                |
| `/admin/backups`              | список копий, создать, проверить, скачать, удалить, восстановить            | `create`, `verify`, `delete`, `restore`                               |
| `/export/products`, `/export/deals`, `/export/stock` | выгрузка XLSX или CSV (`?format=`)                       | только GET                                                            |

API v1 (мобильный клиент) и служебные точки. Аутентификация мобильного клиента: `Authorization: Bearer <access_token>`. Ошибка во всех случаях: `{ "error": { "code": "<код раздела 8>", "details"?: {...} } }`.

| метод и путь                         | вход                                                      | выход                                                                            |
| ------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `POST /api/v1/auth/login`            | `email`, `password`, `totp?`, `device_name`               | `access_token` (15 мин), `refresh_token` (30 дней, ротация), `user`              |
| `POST /api/v1/auth/refresh`          | `refresh_token`                                           | новая пара токенов; повтор использованного токена отзывает всю цепочку (401)     |
| `POST /api/v1/auth/logout`           | заголовок авторизации                                     | 204, сессия отозвана                                                             |
| `GET /api/v1/me`                     |                                                           | `user`, `settings` (`low_stock_threshold`, `default_vat_pct`)                    |
| `GET /api/v1/sync/pull`              | `cursor` (число, по умолчанию 0), `limit` (до 500)        | `changes` по сущностям, `next_cursor`, `has_more`, `server_time`                 |
| `POST /api/v1/sync/push`             | `mutations[]`: `id`, `type`, `payload`, `base_version?`   | `results[]`: `id`, `status` (`applied`, `duplicate`, `rejected`), `code?`, `entity?` |
| `GET /api/v1/quotes/{id}/pdf`        |                                                           | `application/pdf`                                                                |
| `GET /api/health/live`               |                                                           | 200 без обращения к данным                                                       |
| `GET /api/health/ready`              |                                                           | 200, или 503 если БД недоступна или идёт обслуживание                            |
| `GET /api/version`                   |                                                           | `version`, `schema_version`                                                      |

Типы мутаций push: `deal.create`, `deal.update`, `quote.create`, `quote.update`. Мутация идемпотентна по `id` (повтор даёт `duplicate` с прежним результатом). `deal.update` и `quote.update` несут `base_version`, расхождение даёт `rejected` с кодом `version_conflict` и актуальной сущностью. `deal.create` при нехватке остатка даёт `rejected` с кодом `insufficient_stock`. Клиент создаёт `id` сущности (uuid) сам, `deal_number` и `quote_number` назначает сервер.

Правила, которые действуют в любом проекте:

- Изменяющие операции не выполняются безопасными методами (GET, HEAD). Для веб-форм после успешного POST идёт перенаправление 303.
- Действие принимает целевое состояние (`archived=1`, `status=shipped`), а не переключает. Повторная отправка даёт тот же результат.
- Ошибка валидации: ответ 400 с кодом ошибки раздела 8 и введёнными значениями без обрезки. Несуществующая сущность и неразобранный id: 404, не 500. Нет права: 403. Нет сессии: 401 (в web перенаправление на `/login`). Конфликт состояния (остаток, переход статуса, версия): 409. Лимит частоты: 429 с `Retry-After`.
- Булев параметр истинен только при точном значении `1`. Любое другое значение или отсутствие это ложь.
- Параметры запроса читаются как «первое значение при повторах».
- Значения из белого списка (статус, формат экспорта, период) проверяются на входе. Неверное значение: 400 без побочных эффектов.
- Адрес возврата (`redirectTo`) проходит `safeRedirect` (раздел 18).
- Критические сценарии web (вход, второй фактор, создание и изменение товара, клиента, партии, сделки, смена статуса сделки, смена пароля) работают без JS: страницы и формы отправляются обычным POST, встроенная защита Next.js от межсайтовых форм не отключается. Улучшения требуют JS: живой расчёт партии, автодополнение товара и клиента, предпросмотр импорта, графики панели.

---

## 8. Валидация

Чистые функции без импорта хранилища, `packages/shared/src/validate/*.ts`. Каждая возвращает `ok(value)` или `error(code)`:

```ts
export type ErrorCode = FieldErrorCode | DomainErrorCode
// поле + проблема: `${field}_${problem}`, field из разделов 4 и ниже, problem из списка
export type FieldProblem = 'required' | 'invalid' | 'too_long' | 'out_of_range' | 'duplicate'
export type DomainErrorCode =
  | 'unauthenticated' | 'forbidden' | 'not_found' | 'invalid_id' | 'invalid_body' | 'body_too_large'
  | 'rate_limited' | 'maintenance' | 'version_conflict' | 'insufficient_stock' | 'invalid_transition'
  | 'delivery_date_required' | 'payment_date_required' | 'product_archived' | 'product_has_batches'
  | 'batch_has_deals' | 'client_has_deals' | 'batch_product_mismatch'
  | 'credentials_invalid' | 'account_locked' | 'totp_required' | 'totp_invalid' | 'totp_enrollment_required'
  | 'password_weak' | 'password_mismatch' | 'reauth_required' | 'last_admin' | 'ip_not_allowed'
  | 'import_too_large' | 'import_bad_format' | 'import_too_many_rows' | 'rate_unavailable'
  | 'backup_failed' | 'backup_not_found' | 'restore_confirm_mismatch'

export function validateProduct(input: unknown): Result<NewProduct, ErrorCode>
export function validateClient(input: unknown): Result<NewClient, ErrorCode>
export function validateBatch(input: unknown, group?: 'P' | 'F' | 'all'): Result<NewBatch, ErrorCode>
export function validateDeal(input: unknown): Result<NewDeal, ErrorCode>
export function validateQuote(input: unknown): Result<NewQuote, ErrorCode>
export function validateUser(input: unknown): Result<NewUser, ErrorCode>
export function validatePassword(password: unknown, ctx: { email: string }): Result<string, ErrorCode>
export function parseUuid(raw: unknown): Uuid | undefined
export function normalizeKey(s: string): string // NFC, нижний регистр, без пробелов и разделителей, латинские двойники сведены
export function normalizeEngineModel(s: string): string // кириллическая «М», верхний регистр, «все» для всех моделей
export function parseArticleList(raw: unknown): string[] // деление по косой черте
```

Лимиты полей:

| поле                                  | обязательное | максимум и формат                                                               |
| ------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `auteko_article`                      | да           | 100, `^[A-Za-z0-9][A-Za-z0-9._/-]*$`                                            |
| `original_articles`                   | нет          | 20 номеров по 100 знаков, буквы, цифры, `.`, `_`, `-`; в строке через `/`        |
| `products.name`                       | да           | 500                                                                             |
| `engine_models`                       | нет          | 20 значений по 30 знаков, нормализуются `normalizeEngineModel`                  |
| `tnved_code`                          | нет          | ровно 10 цифр                                                                   |
| `production_days_min`, `_max`         | нет          | от 1 до 3650, `min` не больше `max`                                             |
| `notes`                               | нет          | 5000, свободный текст                                                           |
| `clients.company_name`                | да           | 500                                                                             |
| `inn`                                 | нет          | 10 или 12 цифр с верной контрольной суммой                                      |
| `contact_person`                      | нет          | 255                                                                             |
| `phone`                               | нет          | 50, цифры, пробелы, `+`, `-`, `(`, `)`                                          |
| `clients.email`, `users.email`        | нет, да      | 254, формат адреса                                                              |
| `batch_number`                        | да           | `^P-[0-9]{4}-[0-9]{2,}$`                                                        |
| `batches.quantity`                    | да           | от 1 до 1 000 000                                                               |
| `price_exw_cny`                       | да           | от 0.0001 до 1 000 000 000, до 4 знаков после точки                             |
| `cny_rate`                            | да           | от 0.0001 до 1000, до 4 знаков                                                  |
| `customs_duty_pct`, `vat_pct`         | нет          | от 0 до 100, до 2 знаков                                                        |
| `transport_cost_rub`, `other_costs_rub` | нет        | от 0 до 1 000 000 000, до 2 знаков                                              |
| `markup_coefficient`                  | нет          | от 0.1 до 10, до 3 знаков                                                       |
| `cost_price_rub`, `price_kp_rub`      | при `manual` | больше 0, до 2 знаков                                                           |
| `gtd_number`                          | нет          | `^[0-9]{8}/[0-9]{6}/[0-9]{7}$`, сегмент `DDMMYY` это реальная дата              |
| `deals.quantity`                      | да           | от 1 до 1 000 000                                                               |
| `price_with_vat`                      | да           | больше 0, до 1 000 000 000, до 2 знаков                                         |
| `contract_number`, `spec_number`, `upd_number` | нет | 100                                                                             |
| даты сделки                           | нет          | реальная дата `YYYY-MM-DD`                                                      |
| `quotes.items`                        | да           | от 1 до 100 позиций, `valid_until` не раньше сегодняшней даты                   |
| `users.full_name`                     | да           | 200                                                                             |
| пароль                                | да           | от 12 до 128 знаков, не из списка частых, не равен email, не из одного повторяющегося знака |

Правила, которые действуют в любом проекте:

- Функции возвращают код ошибки, а не текст. Тексты лежат в словаре по ключам `error.<код>` (раздел 17). Словарь содержит все коды, которые возвращают валидаторы, тест это проверяет.
- Не-строка на входе текстового поля это пустое значение: обязательное поле даёт `<field>_required`, необязательное становится `null`.
- Длина считается в кодовых точках Unicode, не в байтах и не в единицах UTF-16.
- Переводы строк `\r\n` и `\r` заменяются на `\n` до подсчёта длины и до сохранения.
- Краевые пробелы обрезаются у артикулов, названий, имён и номеров, у свободного текста (`notes`) сохраняются.
- Порядок проверок фиксирован: сначала тип и обязательность по порядку полей из таблицы, затем длина и формат, затем диапазон, затем межполевые правила (`min` не больше `max`, соответствие партии товару). Первая сработавшая определяет ошибку.
- `parseUuid` принимает только строку формата UUID в нижнем регистре или в верхнем (результат в нижнем). Всё остальное (`abc`, `1`, пробел, лишний символ, не строка) даёт `undefined`.
- Максимум задан у каждого поля, неограниченных полей нет. Проверка атрибутами разметки (`maxlength`) серверную проверку не заменяет.
- Допустимые переходы статуса сделки: `new` в `confirmed` или `cancelled`; `confirmed` в `shipped` или `cancelled`; `shipped` в `done` или `cancelled`; `done` и `cancelled` конечные. Переход в `shipped` требует `actual_delivery_date`, в `done` требует `actual_delivery_date` и `actual_payment_date` (иначе `delivery_date_required`, `payment_date_required`). Просрочена сделка, у которой `delivery_deadline` раньше сегодняшней даты, `actual_delivery_date` пуста и статус не `done` и не `cancelled`.

---

## 9. Тесты

Цель: тесты ловят поломку любого критерия и любой известный класс багов. Красный тест означает ошибку в коде.

Принципы:

1. Тесты выводятся из критериев приёмки слайса, а не из готового кода. Критерии написаны в разделе 15 до того, как код написан. Тест кодирует критерий, а не повторяет реализацию.
2. Красный тест чинится правкой кода. Тест не удаляют, не ослабляют и не пропускают (`skip`, `only`, `todo`, `ignore` запрещены линтом). Если сам критерий неверен, это `CONTRACT GAP`, критерий меняет владелец.
3. Баг найден ревью, руками или в работе: сначала падающий тест с `BUG-<n>` в названии, потом правка. Тест остаётся навсегда. Пример, найденный property-тестом, добавляется строкой в таблицу случаев.
4. Запрещённый вид теста: «сохранили и проверили, что сохранилось». Такой тест зелёный и на сломанной валидации. На каждый критерий с отказом есть тест на отказ.
5. Трассировка. ID критерия строится из метки слайса в заголовке раздела 15 и номера пункта в списке критериев: `S1.2`, `S0A.5`, `SH.3`. ID входит в название теста: `S1.2: rejects blank title and writes nothing`. Допустима запись `S1.2`, `S1_2` или `s1_2` (идентификаторы языка не всегда допускают точку). `criteria` ищет без учёта регистра и разделителя и падает, если у критерия нет теста в `tests/` или `e2e/`. Пометка стоит в конце пункта: `(ручной)` означает проверку человеком, `(CI: job)` означает проверку job'ом CI с названием в скобках.
6. Названия тестов, переменные и комментарии в тестах английские (раздел 11).

Уровни:

| уровень     | где                   | что проверяет                                                        | запуск          |
| ----------- | --------------------- | -------------------------------------------------------------------- | --------------- |
| unit        | `tests/`              | чистая логика: валидация, форматирование, словари, `safeRedirect`    | `gate`          |
| integration | `tests/`              | обработчики, хуки, модуль данных на изолированном хранилище, скрипты | `gate`          |
| property    | `tests/`              | инварианты на случайных входах                                       | `gate`          |
| e2e         | `e2e/`                | собранный артефакт: сценарии, без JS, заголовки, CSRF, доступность   | CI, `gate-full` |
| load        | `e2e/` или `scripts/` | бюджет производительности и параллелизм (слайс E)                    | CI              |
| mutation    | `mut`                 | качество тестов чистых модулей                                       | CI на PR        |

Изоляция:

- Каталог `tests/` это каталог `tests/` рабочей области (`packages/shared`, `apps/web`, `apps/mobile`), каталог `e2e/` лежит в `apps/web/e2e` и `apps/mobile/e2e`. Тесты работают с настоящим PostgreSQL 18 (контейнер из `compose.yaml` локально, сервис в CI). Адрес берётся из `TEST_DATABASE_URL` (переменная только для тестов), имя базы обязано заканчиваться на `_test`, иначе тесты не стартуют. На каждый файл тестов создаётся база из шаблона с применёнными миграциями, `resetDb()` в начале каждого теста очищает таблицы и сбрасывает счётчики. Рабочую базу тесты не трогают. Тесты копий и восстановления создают временный каталог и удаляют его.
- Обработчики вызываются напрямую с подставленным входом через `tests/helpers`. Хелперы проверяют результат перенаправления, отказа и ошибки.
- Время, случайные числа и сеть подменяются или не используются. Порядок тестов не влияет на результат.

Инварианты для property-тестов:

- `safeRedirect(x)` для любой строки возвращает путь, который начинается с `/`, не начинается с `//` и не содержит `\`, `\r`, `\n`, а его origin совпадает с origin сайта.
- `money` и `calc`: `format(parse(x))` равен `x`, результат не зависит от порядка операций сверх правила округления раздела 4, `stockStatus` монотонен по остатку.
- `validate`: при успехе обязательные поля непустые, обрезаны, не длиннее лимита в кодовых точках, свободный текст без `\r`. При ошибке нарушено то правило, которое названо в коде ошибки.
- `normalizeKey` идемпотентен, регистр, формы NFC и NFD и латинские двойники кириллических букв дают один ключ. `toPublicBatch` не возвращает ни одного скрытого поля раздела 4.
- `parseUuid`: если результат определён, он равен входу в нижнем регистре.

Покрытие:

- Задача `cov` входит в `gate`. Пороги: 100% строк, ветвей и функций для чистых модулей (валидация, расчёты, права, нормализация, форматирование, `safeRedirect`); не меньше 90% для остального кода. Компоненты интерфейса покрывает e2e.
- Строка без покрытия допускается только с пометкой инструмента и комментарием с причиной. Ревью проверяет каждый такой случай.
- Покрытие показывает, что строка выполнялась, а не что поведение проверено. Поведение проверяют трассировка критериев и мутации.

Мутации:

- `mut` мутирует чистые модули. Порог 80%. Выживший мутант означает слабый тест: допиши тест, порог не снижай.

Словари и локализация:

- До слайса L тесты словарей проверяют язык по умолчанию: ключи непустые, плейсхолдеры согласованы, литералов с буквами других алфавитов в коде вне словарей и вне `domain-literals.ts` нет. После включения локализации те же проверки идут по всем языкам и добавляется паритет наборов ключей и плейсхолдеров.

E2E:

- Собранный артефакт запускается дважды: основной экземпляр и экземпляр с пустым хранилищем. Файлы `empty.*` читают пустой экземпляр и ничего не пишут. Остальные сценарии создают свои данные с уникальными именами и не рассчитывают на пустое состояние.
- Режим без JS: контекст браузера с выключенным JS. Формы критических сценариев (раздел 7) проверяются в обоих режимах.
- Экземпляры стартуют с явными переменными окружения: адрес, лимит тела, адрес тестовой базы.
- Что повторяется по темам и языкам, названо в критерии. До слайса L проверка идёт на языке по умолчанию.

Мобильное приложение:

- Логика (`sync`, `db`, `auth`, форматирование) проверяется Vitest на `node:sqlite` с теми же запросами, что в `expo-sqlite`. Доступ к локальной БД идёт через интерфейс `LocalDb`, который в тестах подменяется. Часы, таймеры и сеть подменяются.
- Сквозные сценарии это файлы Maestro (`apps/mobile/e2e/*.yaml`) на эмуляторе Android, job `mobile-e2e`. Критерии с пометкой `(CI: mobile-e2e)` проверяет он.
- Критерии с пометкой `(CI: mobile-unit)` проверяет job `mobile-unit`, в том числе замер поиска на 20 000 товаров.
---

## 10. Проверки и гейт

Задачи из таблицы раздела 2.

- `gate` = `fmt`, `lint`, `types`, `docs`, `criteria`, `cov`. До слайса 0B `gate` = `fmt`, `lint`, `types`, `test`.
- `gate-full` = `gate`, `build`, `e2e`.
- В CI дополнительно идут `audit`, `secrets`, `mut`, `codeql`, `mobile-unit`.

`gate` красный: слайс не закрыт. Правки по гейту делаются в том же заходе. Слайс закрывает зелёный CI (раздел 20).

Что ловит каждая задача:

- `fmt`: расхождения форматирования, включая документы;
- `lint`: мёртвый код, небезопасные конструкции (раздел 18), `skip` и `only` в тестах, `TODO`, `FIXME` и заглушки («не реализовано»);
- `types`: типы, компиляция без запуска, предупреждения о доступности как ошибки; на чистой копии репозитория задача сама генерирует нужные файлы (синхронизация фреймворка), иначе падает;
- `docs`: заполнены ли плейсхолдеры, на месте ли документы и переводы, актуальны ли они (раздел 17);
- `criteria`: у каждого критерия приёмки есть тест (раздел 9);
- `cov`: тесты критериев и пороги покрытия;
- `e2e`: поведение собранного артефакта, заголовки, доступность;
- `mut`: тесты чистых модулей замечают порчу кода;
- `audit`, `secrets`: уязвимые зависимости и секреты.

Git-хуки (задача `hooks`):

| хук        | что запускает                       |
| ---------- | ----------------------------------- |
| pre-commit | `fmt` и `lint` на изменённых файлах |
| commit-msg | `commit` по формату раздела 11      |
| pre-push   | `gate`                              |

Хуки дают быструю обратную связь. Обязательный барьер это CI: пропуск хуков (`--no-verify`) его не обходит.
---

## 11. Конвенция текста

Код, комментарии, коммиты, названия тестов, сообщения в консоль и журнал: по-английски. Тексты интерфейса лежат только в словарях (раздел 17). Литералов с буквами алфавитов, отличных от латиницы, вне словарей и вне `packages/shared/src/domain-literals.ts` нет, тест это проверяет.

`tech.md` и документы проекта (README, CONTRIBUTING, SECURITY, CHANGELOG, `docs/OPERATIONS.md`) пишутся по-русски: пользователи и операторы системы русскоязычные. По-английски остаются `LICENSE`, шаблоны в `.github/`, код, коммиты и названия тестов.

Коммиты, Conventional Commits, фиксированный формат:

```
type(scope): summary
```

- `type` из набора `feat|fix|test|refactor|chore|docs`;
- `scope`: строчные латинские буквы, цифры и дефис;
- `summary` в императиве, со строчной буквы, без точки, до 50 символов;
- тело только чтобы объяснить _почему_, не _что_;
- коммитить по ходу работы маленькими шагами, не одним коммитом в конце. Каждый коммит по возможности проходит `types`.

Примеры: `feat(deals): add overdue filter to list page`, `test(calc): cover manual cost mode`. Служебные коммиты `Merge ...` и `Revert "..."` формат не проверяет.

Правила письма для всей прозы проекта (коммиты, комментарии, README): активный залог, конкретика вместо общих фраз, без вводных оборотов, без длинного тире, без наречий-усилителей. Комментарий объясняет причину решения, а не пересказывает соседнюю строку. Закомментированный код не оставлять.

Перед написанием README посмотри [https://docs.github.com/en](https://docs.github.com/en), [https://github.com/matiassingers/awesome-readme](https://github.com/matiassingers/awesome-readme), [https://www.makeareadme.com/](https://www.makeareadme.com/)
---

## 12. Definition of Done

### Одного слайса

1. Критерии приёмки слайса из раздела 15 выполнены. Формы и сценарии проверены руками в браузере или терминале, для веба в обоих режимах, с JS и без.
2. Тесты написаны из критериев, `gate` зелёный, `criteria` не называет ни одного критерия без теста.
3. Если у продукта есть UI: страницы и состояния слайса добавлены в список `e2e` проверки доступности, нарушений нет. Для экранов мобильного приложения добавлены сценарии Maestro.
4. Каждая новая видимая строка есть в словаре языка по умолчанию. Другие языки появятся в слайсе L.
5. Новых файлов, абстракций и зависимостей сверх описанных в этом файле нет.
6. Мёртвого кода, заглушек, `TODO` и `FIXME` нет: неиспользуемые экспорты, компоненты, стили, ключи словаря.
7. Ревью по разделу 16 проведено отдельным заходом, блокирующие находки исправлены, остальные переданы владельцу.
8. Коммиты по конвенции раздела 11.
9. CI зелёный на ветке слайса.
10. `tech.md` не изменён (изменение контракта идёт отдельно, через раздел 13).

### Всего продукта

Продукт принят, когда закрыты все слайсы раздела 15 и выполнены критерии слайса R: функции из раздела 1 работают, нефункциональные требования подтверждены замерами, обновление с предыдущего релиза и восстановление из резервной копии проверены, модель угроз раздела 18 пройдена, документы полные и вычитаны (переводов нет, пока язык один), мобильное приложение установлено на реальные устройства iOS и Android, релиз-кандидат отработал срок прогона без блокирующих дефектов.
---

## 13. CONTRACT GAP

Не хватает поля, типа, функции, маршрута или файла: работа останавливается. Выдай блок и жди ответа:

```
CONTRACT GAP
Что нужно: <поле/тип/функция>
Зачем: <какой критерий приёмки без него не выполняется>
Предлагаемая форма: <точная сигнатура или колонка с типом>
Что делаю пока: <заглушка локально в своём слайсе / жду>
```

Код с выдуманным типом не пиши. Схему данных, тип сущности, API модуля данных, список примитивов сам не расширяй.

К контракту относятся также: матрица прав, список ролей, контракт API v1 и синхронизации, список языков, имена cookie и переменных окружения, имена задач, формат шапки перевода, режим `Локализация`, дерево папок из раздела 3, список зависимостей из раздела 2, нефункциональные требования из раздела 1. Новый ключ словаря контрактом не считается: слайс добавляет ключи сам, в словарь языка по умолчанию.
---

## 14. Правила поведения в сессии

- Думай до кода: назови допущения, спроси при неоднозначности, покажи варианты вместо молчаливого выбора.
- Простота: никаких фич сверх запрошенного, никаких абстракций под одноразовый код, никакой обработки ошибок, которых не бывает. Реальные эксплуатационные сбои (нет места на диске, хранилище заблокировано или повреждено, порт занят) входят в слайс E и обрабатываются там по его критериям.
- Хирургические правки: соседний рабочий код не улучшать и не рефакторить. Каждая изменённая строка следует из текущей задачи.
- Один слайс за заход. Не выкатывай всё приложение сразу.
- Ревью идёт вторым заходом в новом контексте, после того как слайс готов, а не в том же сообщении, где написан код.
- Красный тест означает ошибку в коде. Тест не удаляй, не ослабляй, не пропускай. Тест противоречит критерию: `CONTRACT GAP`.
- Читаешь только `tech.md`, переводы игнорируешь.
- Видимый текст пишешь в словарь языка по умолчанию. Переводы на остальные языки делаются в слайсе L и не раньше.
- Готовый продукт не оставляет за собой заглушек: `TODO`, `FIXME`, временные обходы и закомментированный код в слайс не попадают.

---

## 15. Стадии и слайсы

Порядок жёсткий, сверху вниз. Один слайс за один заход сессии. Слайс закрыт, когда выполнен Definition of Done из раздела 12. Слайс вертикальный: от хранилища до экрана. Половина слайса не закрывается.

Продукт готовый, поэтому в плане нет «временных» слайсов: каждая функция из раздела 1 доводится до конца в своём слайсе, а то, что делает продукт эксплуатируемым, имеет собственные слайсы H, E, D, L, R.

Стадии:

1. **Каркас.** Слайсы 0A и 0B. Перед 0A владелец ставит тег `prototype-v0` на текущий `main`: код прототипа (Next.js 14, `src/`) остаётся справочным примером поведения для слайсов 2, 3, 4 и 6, дальше его заменяет новый код. Фичи не начинаются, пока критерии каркаса не зелёные.
2. **Ядро.** Слайсы 1-6: вход и роли, товары, контрагенты, партии, остатки, сделки.
3. **Остальные функции.** Слайсы 7-14: импорт и экспорт, КП, панель, аудит, API и синхронизация, мобильное приложение.
4. **Защита.** Слайс H.
5. **Эксплуатационная готовность.** Слайс E.
6. **Документация.** Слайс D (на языке исходника).
7. **Локализация.** Слайс L (только при втором языке).
8. **Релиз и приёмка.** Слайс R.

Идентификаторы критериев. Заголовок слайса `### Слайс <метка>: название`, метка из цифр и заглавных латинских букв (`0A`, `3`, `H`). ID критерия: `S<метка>.<номер пункта>`, например `S3.2`, `SH.4`.

Формат слайса: **Файлы**, **Что делает**, **Критерии приёмки** (нумерованный список), **Тесты** (файл → критерии, таблицы граничных случаев), **Не делать**. В конце пункта критерия может стоять пометка `(ручной)` или `(CI: job)`.

---

### Слайс 0A: каркас приложения

**Что собрать:**

- Монорепозиторий (npm workspaces): `packages/shared`, `apps/web`, `apps/mobile` (проект Expo без экранов, только чтобы `lint` и `types` его охватывали). Зафиксированная версия Node, зависимости из раздела 2, задачи таблицы раздела 2, нужные до 0B (`fmt`, `fmt-write`, `lint`, `types`, `test`, `build`, `gate`).
- `packages/shared`: `types`, `roles`, `permissions` (таблица прав раздела 4 и функция `toPublicBatch`), `money`, `calc`, `stock`, `dates`, `ids`, `normalize`, `domain-literals`, `errors`, общий словарь `i18n`.
- `apps/web`: `config`, `logger`, `errors`, слой данных (`db`, `sql`, `migrate`, `mappers`, `counters`), миграция `0001_init.sql` (все таблицы раздела 4, индексы, триггер `set_sync_seq`, роли БД `auteko_app` и `auteko_migrator`), `safe-redirect`, `headers` (заголовки раздела 18, которые ставит приложение), все примитивы раздела 6, каркас экрана, глобальные стили, заглушка страницы `/`.
- Правила линтера раздела 18, запрет `skip`, `only`, `TODO`, `FIXME`, заглушек. `.gitignore` (уже расширен), `.prettierignore`, `compose.yaml` только с сервисом `db` для разработки.
- `tests/helpers` (фабрики, `resetDb`, проверка результата перенаправления и ошибки), `scripts/create-user.ts` не входит (слайс 1).

**Критерии приёмки:**

1. `gate` зелёный на каркасе. (CI: gate)
2. Локальный запуск: `compose up db`, `db:migrate`, `dev`, страница `/` отвечает 200. (ручной)
3. Миграции: пустая БД получает все таблицы и версию, равную числу файлов миграций, контрольные суммы записаны. БД прошлой версии (фикстура) обновляется без потери данных. БД новее приложения не открывается, ошибка называет версию. Изменённый файл применённой миграции даёт ошибку контрольной суммы.
4. Триггер `sync_seq`: каждая вставка и изменение строки синхронизируемой таблицы получает большее значение. Две параллельные транзакции на двух соединениях: порядок `sync_seq` совпадает с порядком фиксации.
5. Маппер: `numeric` приходит строкой без потери знаков, `timestamptz` как ISO 8601 с `Z`, `date` как `YYYY-MM-DD` без сдвига при `TZ=America/Los_Angeles` и при `TZ=Asia/Vladivostok`.
6. Тег `sql`: значения становятся параметрами; строки `'`, `;--`, `%`, `_`, `\`, `' OR 1=1 --` сохраняются и читаются буквально; `ident` отклоняет имя вне белого списка.
7. `money`: сложение, умножение, `round2` (половина вверх), разбор и вывод на таблице случаев, значения до 9 000 000 000 000.00 точны; свойство: `format(parse(x)) === x`.
8. `calc`: таблица случаев. Пример: `exw=100`, `rate=12.5`, `duty=10`, `transport=10000`, `other=2000`, `quantity=100`, `vat=22`, `markup=1.25` даёт `cost=1823.90`, `price_kp=2279.88`, `profit=455.98`. Режимы `manual` для себестоимости и цены, отрицательная прибыль, `quantity=1`.
9. `stock`: `stockStatus` на значениях -1, 0, 1, 10, 11 при пороге 10 и при пороге 3; `computeBalance`.
10. `dates`: `today(tz)` для момента `2026-10-11T21:30:00Z` даёт `2026-10-12` при `Europe/Moscow`; `isOverdue` на таблице случаев (граница дня, `done`, `cancelled`, есть фактическая поставка).
11. `parseUuid`, `normalizeKey`, `normalizeEngineModel` (латинская `M` в `12M55` приводится к кириллической `М`), `safeRedirect` на таблице раздела 18.
12. `permissions`: каждая ячейка матрицы раздела 4 (роль, действие) проверена; `toPublicBatch` удаляет все поля, перечисленные для `sales`, свойство на случайных партиях.
13. Словарь: ключи непустые, плейсхолдеры согласованы, вне словарей и `domain-literals.ts` нет литералов с буквами нелатинских алфавитов.
14. Заголовки безопасности, которые ставит приложение, есть в ответе на обычную страницу и на 404.
15. Линтер: небезопасные конструкции раздела 18 дают ошибку (тест запускает линтер программно на фикстурах).

**Тесты:** по файлу на модуль (`money`, `calc`, `stock`, `dates`, `ids`, `normalize`, `permissions`, `db-migrate`, `db-sync-seq`, `mappers`, `sql`, `i18n`, `headers`, `lint-rules`), критерии по порядку. Таблицы граничных случаев пишутся в самом тесте.

**Не делать:** функции продукта, валидаторы сущностей (они в слайсах функций), вход, резервную копию, обработку сбоев хранилища (слайс E).

---

### Слайс 0B: инфраструктура проверок

**Что собрать:**

- Скрипты `check-criteria`, `check-docs`, `check-commit-msg`, `check-workflows`: каждый экспортирует чистую функцию и запускается как команда с кодом выхода 1 при ошибке.
- Задачи `cov`, `docs`, `criteria`, `commit`, `e2e`, `gate-full`, `mut`, `audit`, `secrets`, `hooks`.
- Конфиги: пороги покрытия, мутации, e2e (два экземпляра: основной и пустой), git-хуки, `.gitleaks.toml`.
- E2E: smoke и доступность `/login`.
- Файлы CI по разделу 20, обновление `.github/dependabot.yml` под монорепозиторий (`directories` для npm, экосистемы `github-actions` и `docker`).

**Критерии приёмки:**

1. `criteria` читает раздел 15, строит ID по правилу раздела 9, сообщает ID без теста и завершается кодом 1. Критерии с пометками «ручной» и «CI» в конце пункта пропускаются.
2. `docs` читает режим из строки `Локализация` в шапке `tech.md`. Значение кроме `отложена` и `включена` даёт ошибку. Во всех режимах `docs` завершается кодом 1, если в `tech.md` остались незаполненные плейсхолдеры (две открывающие фигурные скобки подряд) или пометка шаблона в начале строки (слово ШАБЛОН с двоеточием). В режиме `включена` код 1 дают также: отсутствующий перевод, устаревший хеш в шапке, различие структуры заголовков, различие числа блоков кода, различие строки версии.
3. `commit` принимает `feat(deals): add overdue filter` и `Merge branch 'x'`. Отклоняет: неизвестный `type`, отсутствующий `scope`, заглавную первую букву, точку в конце, summary из 51 символа, пустую строку.
4. `check-workflows` отклоняет: действие без закрепления на полный SHA (40 hex) с версией в комментарии, `permissions` не `contents: read` на верхнем уровне, `pull_request_target`, `write-all`. Принимает текущие файлы `.github/workflows/*.yml`.
5. Пороги покрытия настроены, `mut` проходит с порогом 80%. (CI: mutation)
6. Собранный артефакт стартует на обоих экземплярах (основной и с пустой БД) и отвечает успехом, без ошибок в консоли браузера и без нарушений CSP.
7. На `/login` нет нарушений axe (теги из раздела 19).
8. Хуки блокируют коммит с плохим сообщением и push с красным гейтом. (ручной)
9. CI запускается на pull request и push в основную ветку и содержит job'ы раздела 20. (CI: gate)
10. `dependabot.yml` содержит экосистемы `npm`, `github-actions`, `docker` и охватывает все рабочие области, тест разбирает файл.
11. `docs` зелёный для `tech.md`. (CI: gate)

**Тесты:** `criteria`, `docs`, `commit-msg`, `workflows` покрыты своими тестами по таблицам случаев (для `docs` отдельный случай на каждое условие критерия 2 и на нормализацию `\r\n` перед хешем); критерии 6 и 7 в `e2e`.

**Не делать:** проверку документов проекта (слайс D), деплой, матрицу версий Node.

---

### Слайс 1: вход, роли и пользователи

**Файлы:** `server/security/{passwords,totp,crypto,tokens,guard}.ts`, `server/data/{users,sessions}.ts`, `server/services/{auth,users}.ts`, `validate/users.ts`, страницы `login`, `login/totp`, `account`, `admin/users`, `scripts/create-user.ts`, миграция `0002_auth.sql` при необходимости.

**Что делает:** вход по email и паролю, второй фактор TOTP с кодами восстановления, серверные сессии, смена пароля, список и отзыв сессий, управление пользователями и ролями администратором, проверка прав на сервере.

**Критерии приёмки:**

1. `user:create` создаёт первого администратора с `must_change_password`, повторный email отклоняется, пароль не попадает в журнал и в вывод.
2. Верные данные: сессия создана, cookie с атрибутами раздела 18. Неверный пароль, неизвестный email и неактивный пользователь дают один код `credentials_invalid` и сопоставимое время ответа (для неизвестного email проверяется фиктивный хеш).
3. Хеш `argon2id` с параметрами раздела 18, хеш не возвращается ни одним обработчиком. `validatePassword` на таблице: 11 знаков, 12 знаков, 128 и 129 знаков, из списка частых, равен email, один повторяющийся знак.
4. Блокировка: 5 неудач подряд дают `account_locked` на 15 минут (подставленные часы), верный пароль во время блокировки отклоняется, успех сбрасывает счётчик.
5. Сессия: токен случаен (не меньше 256 бит), в БД лежит только SHA-256, абсолютный срок 12 часов, простой 2 часа, выход отзывает сессию на сервере, смена пароля отзывает остальные сессии пользователя.
6. TOTP: подключение (QR и проверка кода), при включённом TOTP вход требует код, допускается сдвиг на один шаг, повторное использование кода в пределах окна отклоняется, 10 кодов восстановления одноразовые, секрет хранится зашифрованным.
7. `must_change_password`: любой путь кроме `/account` и выхода перенаправляет на смену пароля.
8. Администратор: создание пользователя (временный пароль показывается один раз), смена роли, деактивация (сессии отзываются), сброс пароля, сброс 2FA. Последнего активного администратора нельзя деактивировать и понизить (`last_admin`). Не администратор получает 403 на каждое из этих действий.
9. `guard`: перебор таблицы маршрутов раздела 7 с каждой ролью и без сессии: без сессии перенаправление на `/login` (API 401), роль без права 403.
10. Вход и второй фактор работают без JS, `redirectTo` с внешним адресом игнорируется.
11. Аудит: вход (успех и неудача), блокировка, смена пароля, изменения 2FA, действия администратора записаны.
12. Страница `/account` показывает сессии пользователя и отзывает выбранную.

**Тесты:** `passwords`, `totp`, `crypto`, `tokens`, `auth-service`, `users-service`, `guard-routes`, e2e `login` (с JS и без JS); таблицы случаев в самих тестах.

**Не делать:** вход через внешних провайдеров, восстановление пароля по почте (сброс делает администратор), мобильные токены (слайс 11).

---

### Слайс 2: номенклатура

**Файлы:** `validate/products.ts`, `server/data/products.ts`, `server/services/products.ts`, страницы `products`, `products/new`, `products/[id]`.

**Что делает:** список товаров с поиском и фильтром по модели ДВС, карточка, создание, изменение, архив и восстановление, удаление товара без партий.

**Критерии приёмки:**

1. Создание валидного товара: артикул обрезан, `original_articles` разобран по `/` без дублей, модели ДВС нормализованы, `search_key` заполнен.
2. `validateProduct` на таблице: пустой и пробельный артикул, 100 и 101 знак, недопустимые знаки, пустое имя, 500 и 501 знак, ТНВЭД из 9, 10, 11 цифр и с буквами, сроки 0, 1, 3650, 3651, `min` больше `max`, не-строка вместо поля.
3. Дубликат артикула без учёта регистра (`av-i16471` и `AV-i16471`) даёт `auteko_article_duplicate`, ничего не записано.
4. `auteko_article` неизменяем: попытка изменить даёт `auteko_article_invalid`, остальные поля не затронуты.
5. Поиск находит по артикулу AUTEKO, по оригинальному номеру (с пробелами, дефисами, в другом регистре), по названию, по смеси латиницы и кириллицы (`12M55` находит модель `12М55`). Составная и разложенная формы символа (NFC и NFD) равны, спецсимволы поиска буквальны, повтор параметра берёт первое значение, запрос в 10000 знаков не падает, значение в разметке экранируется.
6. Фильтр по модели ДВС: товар с моделью `все` попадает в любой фильтр.
7. Архив: `archived=1` идемпотентен, архивные скрыты по умолчанию и видны при `status=all` или `archived`, восстановление возвращает в `active`. Удаление товара с партиями даёт `product_has_batches` (409), без партий удаляет.
8. Счётчики на странице: всего активных и «не поставляется».
9. Права: `accountant` и `sales` читают, запись даёт 403 и ничего не меняет.
10. Название с `<script>` и `<img onerror>` выводится как текст.
11. Список разбит по страницам (по умолчанию 50, максимум 100), сортировка по артикулу, пустой список и пустой результат поиска имеют разный текст.
12. Форма работает без JS, ошибки показываются у полей с сохранением введённого, изменения пишутся в аудит.

**Тесты:** `validate-products` (таблицы), `products-data`, `products-service`, `products-search`, e2e `products` (с JS и без JS), axe на страницах слайса.

**Не делать:** импорт (слайс 7), склейку и слияние дублей, изображения товара.

---

### Слайс 3: контрагенты

**Файлы:** `validate/clients.ts`, `server/data/clients.ts`, `server/services/clients.ts`, страницы `clients`, `clients/new`, `clients/[id]`.

**Что делает:** справочник клиентов с поиском, карточкой и количеством сделок.

**Критерии приёмки:**

1. Создание валидного клиента, остальные поля необязательны.
2. `validateClient` на таблице: пустое имя, 500 и 501 знак, email без `@` и длиннее 254, телефон с буквами, примечание 5000 и 5001.
3. ИНН: таблица верных и неверных значений для 10 и 12 цифр, неверная контрольная сумма и длина 11 дают `inn_invalid`.
4. Изменение меняет только переданные поля, `created_at` и `id` не затрагиваются.
5. Удаление клиента с неотменёнными сделками даёт `client_has_deals` (409), без сделок мягко удаляет (`deleted_at`), удалённый клиент не виден в списке и поиске.
6. Поиск по названию, ИНН и контактному лицу по правилам критерия S2.5.
7. В списке виден счётчик сделок клиента (без отменённых).
8. Права: `buyer` только читает (403 на запись), `sales` пишет.
9. Форма работает без JS, изменения пишутся в аудит.

**Тесты:** `validate-clients`, `clients-data`, `clients-service`, e2e `clients`.

**Не делать:** объединение клиентов, историю изменений реквизитов, проверку ИНН во внешних реестрах.

---

### Слайс 4: курсы и партии

**Файлы:** `validate/batches.ts`, `server/data/{rates,batches}.ts`, `server/services/{rates,batches}.ts`, страницы `rates`, `batches`, `batches/new`, `batches/[id]`.

**Что делает:** хранение курса юаня по датам (вручную и загрузкой с ЦБ РФ), партии с автоматическим расчётом себестоимости, цены КП и прибыли по `calc.ts`.

**Критерии приёмки:**

1. Курс: ввод вручную (одна запись на дату, повторное сохранение обновляет), список по убыванию даты. Кнопка «Загрузить курс ЦБ РФ» читает ежедневный XML (адрес `CBR_URL`, по умолчанию официальный), учитывает номинал, при таймауте 5 с, ответе не 200 или неверном XML даёт `rate_unavailable` и ничего не записывает (тест на локальном заглушечном сервере).
2. Форма партии подставляет номер из `peekNumber` (формат `P-ГГГГ-NN`) и курс из `latestRate`, дату курса из той же записи.
3. `validateBatch` на таблице: номер вне формата, количество 0, 1, 1 000 000, 1 000 001, цена и курс 0, `0.0001`, пять знаков после точки, пошлина -1, 100, 101, наценка 0.09, 0.1, 10, 10.01, режимы `manual` без значения.
4. Сохранённые значения равны выводу `calc.ts`, пример критерия S0A.8 воспроизводится через сервис.
5. Изменение любого входа пересчитывает себестоимость, цену и прибыль в той же транзакции, `version` растёт на 1, изменение с устаревшей `expectedVersion` даёт `version_conflict` (409) без записи.
6. Расчёт в форме (JS) и серверный расчёт дают одинаковые значения на таблице входов (оба вызывают `calc.ts`).
7. Группы полей: `buyer` не может писать поля группы F, `accountant` не может писать поля группы P (403, ничего не записано), `admin` пишет всё, `sales` не имеет доступа (403).
8. Количество нельзя уменьшить ниже проданного (`quantity_out_of_range`), смена `product_id` при наличии сделок даёт `batch_has_deals`, удаление партии с неотменёнными сделками даёт `batch_has_deals`, без сделок удаляет. Новая партия архивному товару даёт `product_archived`.
9. ГТД: формат номера, сегмент `DDMMYY` с невозможной датой (`320126`) отклоняется, пустая `gtd_date` заполняется из номера.
10. Поиск по номеру партии, артикулу и названию, фильтр по товару, страницы по 50.
11. Таблица показывает себестоимость, цену КП и прибыль, отрицательная прибыль помечена словом, не только цветом.
12. Форма работает без JS, изменения пишутся в аудит.

**Тесты:** `validate-batches`, `rates-service`, `rates-cbr` (заглушка сервера), `batches-service` (таблицы, версии, группы полей), `batches-data`, e2e `batches`.

**Не делать:** автоматический пересчёт старых партий при смене курса, несколько валют, учёт возвратов поставщику.

---

### Слайс 5: складской баланс

**Файлы:** `server/data/stock.ts`, `server/services/stock.ts`, `server/export/{csv,xlsx}.ts`, страница `stock`, `export/stock`.

**Что делает:** остаток по товарам и партиям (`received - sold`, без отменённых сделок), цветовая индикация, фильтры, выгрузка.

**Критерии приёмки:**

1. Остаток на таблице случаев: нет сделок, частичная продажа, все продано, сделки отменены, смесь статусов.
2. Цвет по порогам раздела 4: 0 красный, 1-10 жёлтый, больше 10 зелёный, порог из настройки `low_stock_threshold`, смена порога меняет цвета сразу. Каждый статус виден и цветом, и текстом.
3. Активные доступные товары без партий показываются с остатком 0 и красным статусом.
4. Страница: строки по товарам с раскрытием по партиям (`Details`), фильтры по модели ДВС, статусу, поиск по правилам S2.5, сортировка по статусу, страницы по 50.
5. Роли: `buyer`, `accountant`, `admin` видят себестоимость и прибыль; `sales` получает только поля `BatchPublic`: в HTML, JSON и выгрузке нет ни одного поля из списка раздела 4 (тест сериализует ответ и ищет значения и ключи).
6. Выгрузка XLSX и CSV: ячейки, начинающиеся с `=`, `+`, `-`, `@`, табуляции или `\r`, экранируются префиксом `'`, имя файла содержит дату.
7. После создания, изменения и отмены сделки `sync_seq` партии растёт (`touchBatch`).

**Тесты:** `stock-data`, `stock-service`, `export-csv`, `export-xlsx`, e2e `stock`.

**Не делать:** резервирование под КП, инвентаризацию, учёт брака.

---

### Слайс 6: сделки

**Файлы:** `validate/deals.ts`, `server/data/deals.ts`, `server/services/deals.ts`, страницы `deals`, `deals/new`, `deals/[id]`, `export/deals`.

**Что делает:** реестр реализации: создание сделки с контролем остатка, статусы, сроки, просрочка, выгрузка.

**Критерии приёмки:**

1. Создание: `deal_number` `R-001`, следующий больше, `total_amount` равен количеству на цену, ответственный равен текущему пользователю (`admin` и `accountant` могут указать другого), статус `new`.
2. `validateDeal` на таблице: количество 0, 1, 1 000 000, 1 000 001, цена 0 и отрицательная, даты `2026-02-30`, текст 100 и 101 знак, партия чужого товара (`batch_product_mismatch`), архивный товар (`product_archived`).
3. Остаток: количество больше остатка даёт `insufficient_stock` (409) с доступным числом, ничего не записано; равно остатку проходит.
4. Конкурентность: 10 параллельных сделок по 1 шт. против остатка 5 дают ровно 5 `applied` и 5 `insufficient_stock`, остаток не уходит ниже 0.
5. Изменение количества или партии проверяет остаток без учёта самой сделки, изменение с устаревшей версией даёт `version_conflict`.
6. Статусы по таблице переходов раздела 8, обязательные даты для `shipped` и `done`, `done` и `cancelled` конечные, отмена возвращает количество в остаток.
7. Просрочка: таблица случаев на границе дня в `APP_TIMEZONE` (подставленные часы), значок со словом «просрочено», фильтр `overdue=1`, счётчик просроченных не зависит от остальных фильтров.
8. Права: `sales` видит и меняет только свои сделки (чужая даёт 404), правка закрыта после `shipped`; `accountant` меняет поля оплаты, УПД и статусы; `buyer` не имеет доступа.
9. Список: поиск по номеру сделки, клиенту, артикулу, названию, договору; фильтр по статусу и клиенту; сортировка по дате создания; `limit` не больше 200.
10. Выгрузка XLSX реестра: 21 колонка по образцу прототипа, строка прибыли и себестоимости только для ролей с доступом к себестоимости, экранирование формул как в S5.6, `sales` получает только свои сделки без колонок себестоимости и прибыли.
11. Форма показывает сумму, прибыль и маржу ролям с доступом к себестоимости, расчёт равен серверному.
12. Форма работает без JS, изменения пишутся в аудит.

**Тесты:** `validate-deals`, `deals-data`, `deals-service` (таблицы статусов и дат, конкурентность на реальной БД), `export-deals`, e2e `deals`.

**Не делать:** несколько позиций в одной сделке, частичные отгрузки, печать УПД и договоров, напоминания по почте.

---

### Слайс 7: импорт и экспорт номенклатуры

**Файлы:** `server/services/import.ts`, `server/export/*`, `products/import`, `export/products`.

**Что делает:** пакетная загрузка товаров из CSV и XLSX с предпросмотром и выгрузка номенклатуры.

**Критерии приёмки:**

1. Шаблон XLSX: лист «Номенклатура» с колонками `auteko_article`, `original_articles`, `name`, `engine_models`, `tnved_code`, `production_days_min`, `production_days_max`, `is_available`, `notes` и пример, лист «Инструкция».
2. Загрузка CSV (UTF-8 с BOM и без, разделитель `,` или `;`, определяется автоматически) и XLSX; предпросмотр показывает по строкам: новая, уже есть (пропуск), ошибка с номером строки и кодом. До `commit` ничего не записано.
3. `commit` создаёт новые строки одной транзакцией, строки с ошибками пропускает, итог: создано, пропущено, ошибки по строкам. 1000 строк за 30 секунд. (CI: load)
4. Дубли внутри файла и относительно БД определяются без учёта регистра, второй экземпляр даёт `auteko_article_duplicate`.
5. Пределы: файл до 10 МБ (`import_too_large`), до 5000 строк (`import_too_many_rows`), читается первый лист, неверное расширение или формат, распакованный размер больше 50 МБ дают `import_bad_format`.
6. Ячейка с формулой читается как значение и не вычисляется.
7. Латинская `M` в моделях ДВС при импорте приводится к кириллической `М`.
8. Выгрузка номенклатуры XLSX и CSV с учётом фильтров списка, `is_available` как «да» и «нет», экранирование формул как в S5.6.
9. Импорт доступен `admin` и `buyer`, остальным 403.
10. Итог импорта пишется в аудит (счётчики, имя файла, без содержимого).

**Тесты:** `import-service` (таблицы файлов-фикстур: BOM, `;`, формулы, 5000 и 5001 строка), `export-products`, e2e `import`.

**Не делать:** импорт партий и сделок, обновление существующих товаров из файла, импорт картинок.

---

### Слайс 8: коммерческие предложения

**Файлы:** `validate/quotes.ts`, `server/data/quotes.ts`, `server/services/quotes.ts`, `server/export/quote-pdf.ts`, страницы `quotes`, `quotes/new`, `quotes/[id]`, `api/v1/quotes/[id]/pdf`.

**Что делает:** КП клиенту из позиций номенклатуры с ценой с НДС, PDF, создание сделок из КП.

**Критерии приёмки:**

1. Создание КП: клиент, от 1 до 100 позиций; цена позиции по умолчанию `price_kp_rub` партии, при пустой партии берётся самая старая партия с остатком больше 0; цену можно изменить.
2. Номер `KP-2026-0001`, нумерация по году, `valid_until` по умолчанию сегодня плюс `quote_validity_days`.
3. `validateQuote` на таблице: 0, 1, 100, 101 позиция, количество 0, цена 0, `valid_until` в прошлом.
4. КП не резервирует остаток: количество больше остатка допускается, позиция помечена предупреждением `insufficient_stock`.
5. Статусы: `draft` в `sent`, `sent` в `accepted` или `rejected`; просроченное `draft` и `sent` показывается как `expired` по дате (вычисляется при чтении).
6. PDF: кириллица читается (встроенный шрифт), есть номер, дата, клиент, позиции с ценой с НДС, итог, строка «в том числе НДС» по ставке из позиции партии или настройки, срок действия; себестоимости и прибыли нет; PDF на 30 позиций создаётся за 3 секунды; имя файла `KP-2026-0001.pdf`. Тексты проверяются на модели документа (`buildQuoteDocument`) и в e2e через `pdftotext`.
7. `createDeals`: создаёт по сделке на позицию (партия позиции или самая старая с остатком), всё или ничего; нехватка остатка по любой позиции даёт 409 со списком позиций, ничего не создаётся; КП получает `accepted`, сделки несут `quote_id`.
8. Права: `sales` видит и меняет только свои КП, `accountant` читает, `buyer` без доступа (403), PDF и страницы не содержат полей себестоимости для `sales`.
9. Удаляется только `draft`. Форма работает без JS, изменения пишутся в аудит.

**Тесты:** `validate-quotes`, `quotes-service`, `quote-document`, `quotes-data`, e2e `quotes` (включая PDF).

**Не делать:** шаблоны писем, отправку по почте, подпись и печать, скидки по правилам.

---

### Слайс 9: панель и отчёты

**Файлы:** `server/data/stats.ts`, `server/services/reports.ts`, страницы `/` и `reports`, `components/ui/Chart.tsx`.

**Что делает:** сводка руководителя и два отчёта.

**Критерии приёмки:**

1. Виджеты по ролям: число красных и жёлтых позиций, просроченные сделки (ссылка в список), оборот и прибыль за текущий месяц (роли с доступом к себестоимости), дебиторка (отгружено, но не оплачено), пять товаров с наибольшей прибылью, предупреждение о возрасте последней резервной копии (`admin`).
2. Числа равны контрольным запросам на фикстуре: границы месяца в `APP_TIMEZONE`, отменённые сделки исключены, прибыль равна `(price_with_vat - cost_price_rub) * quantity`.
3. Отчёт «Продажи»: период (`from` не позже `to`, не больше 5 лет), группировка по месяцу, клиенту или товару, выгрузка XLSX и CSV.
4. Отчёт «Дебиторка»: группы по давности от `actual_delivery_date` (0-30, 31-60, больше 60 дней), итоги, выгрузка.
5. Графики это SVG с `<title>` и `<desc>`, рядом таблица тех же данных.
6. `sales` видит только оборот по своим сделкам без прибыли, `buyer` только виджеты остатков, `accountant` и `admin` всё.
7. Пустая база показывает состояние «нет данных», а не ошибку.
8. Панель открывается за 300 мс на эталонных данных. (CI: load)

**Тесты:** `stats-data` (контрольные запросы на фикстуре), `reports-service`, `chart`, e2e `dashboard`.

**Не делать:** настраиваемые панели, прогнозы, рассылку отчётов.

---

### Слайс 10: журнал аудита и настройки

**Файлы:** `server/data/{audit,settings}.ts`, `server/services/settings.ts`, страницы `admin/audit`, `admin/settings`.

**Что делает:** просмотр аудита и управление настройками.

**Критерии приёмки:**

1. Список аудита с фильтрами (пользователь, действие, сущность, период), новые сверху, страницы, доступ только `admin`.
2. Реестр `AUDIT_ACTIONS`: тест вызывает каждую изменяющую функцию сервисов и проверяет, что записано событие из реестра.
3. `details` не содержит ключей `password`, `token`, `secret`, `totp`, `refresh` (свойство на случайных объектах).
4. Роль БД `auteko_app` имеет на `audit_log` только `INSERT` и `SELECT`, изменить или удалить запись через приложение нельзя (тест привилегий).
5. Настройки: только ключи раздела 4, `low_stock_threshold` целое от 1 до 1000, `default_vat_pct` от 0 до 100, `default_markup` от 0.1 до 10, `quote_validity_days` от 1 до 365, неверное значение даёт 400 без записи, изменение порога сразу меняет цвета остатков.
6. Не администратор получает 403, `/api/v1/me` отдаёт только `low_stock_threshold`, `default_vat_pct`, часовой пояс.

**Тесты:** `audit-data`, `audit-coverage`, `redact`, `settings-service`, e2e `admin`.

**Не делать:** экспорт аудита во внешние системы, хранение аудита вне БД.

---

### Слайс 11: API мобильного клиента и синхронизация

**Файлы:** `packages/shared/src/sync.ts`, `server/data/sync.ts`, `server/services/sync.ts`, `api/v1/**`.

**Что делает:** токены для мобильного клиента, выдача изменений по курсору, приём мутаций офлайн-очереди.

**Критерии приёмки:**

1. `login`, `refresh`, `logout` по разделу 7: пароль и TOTP, `totp_enrollment_required` в режиме `public` для пользователя без 2FA, имя устройства сохраняется, `access_token` живёт 15 минут, `refresh_token` ротируется, повтор использованного `refresh_token` отзывает всю цепочку (401).
2. Токены случайны (не меньше 256 бит), в БД только хеши, просроченный `access_token` отклоняется (подставленные часы), отозванная сессия получает 401 на следующем запросе.
3. `pull`: курсор 0 возвращает все разрешённые роли сущности страницами до `limit` (не больше 500) по возрастанию `sync_seq`, `next_cursor` равен последнему `sync_seq`, повтор с `next_cursor` возвращает только более новое, удалённые клиенты приходят с `deleted_at`, архивные товары со статусом.
4. Охват по ролям: `sales` получает товары, клиентов, партии как `BatchPublic` (с остатками), свои сделки и свои КП; `buyer` и `accountant` по матрице раздела 4. В ответе `sales` нет ни одного поля из списка скрытых полей (свойство на случайных данных).
5. Изменение остатка чужой сделкой попадает в следующий `pull` как изменение партии.
6. Конкурентность: параллельные записи во время выдачи изменений не теряют строк (повторяемый стресс-тест, курсор доходит до конца без пропусков).
7. `push`: `deal.create` идемпотентна по `id` мутации (повтор даёт `duplicate` с прежним результатом), нехватка остатка даёт `rejected` с `insufficient_stock`, ошибки валидации по мутации не мешают соседним (частичный успех, порядок сохранён), не больше 100 мутаций и 1 МБ на запрос.
8. `deal.update` и `quote.update` с `base_version`: совпадение применяется, расхождение даёт `version_conflict` и актуальную сущность; права как в разделе 4 (`sales` только свои, до `shipped`).
9. `quote.create` и `quote.update` по правилам слайса 8; `deal_number` и `quote_number` назначает сервер и возвращает в `entity`.
10. Лимит частоты `sync` 60 запросов в минуту на пользователя (подставленные часы).
11. Единый формат ошибки, 401 при плохом токене, 403 при запрете роли, 400 при неверном теле (ошибки `zod` преобразуются в коды), 413 при большом теле.
12. Контрактный тест: схемы `packages/shared/src/sync.ts` принимают реальные ответы сервера.
13. `GET /api/v1/quotes/{id}/pdf` требует токена и отдаёт PDF только владельцу КП или `admin`.

**Тесты:** `api-auth`, `sync-pull`, `sync-push`, `sync-concurrency`, `sync-contract`, `api-errors`.

**Не делать:** WebSocket и push-уведомления, дельты по полям, сжатие тела.

---

### Слайс 12: мобильное приложение, каркас и синхронизация

**Файлы:** `apps/mobile/app/_layout.tsx`, `(auth)/login.tsx`, `(tabs)/_layout.tsx`, `(tabs)/settings.tsx`, `src/{ui,db,sync,auth,api,i18n}`.

**Что делает:** вход, локальная зашифрованная база, движок синхронизации, очередь исходящих изменений, блокировка приложения.

**Критерии приёмки:**

1. Приложение запускается на эмуляторе Android и симуляторе iOS и показывает вход. (CI: mobile-e2e)
2. Вход: имя устройства, шаг TOTP, ошибки на русском, токены в `expo-secure-store`, сессия восстанавливается после перезапуска. (CI: mobile-e2e)
3. Локальная БД шифруется SQLCipher, ключ случаен и лежит в `expo-secure-store`; миграции локальной схемы сохраняют данные при обновлении приложения (тест на `node:sqlite`).
4. Pull: страница применяется одной локальной транзакцией вместе с обновлением курсора, прерванный pull продолжается с сохранённого курсора, удалённые строки убираются.
5. Очередь: мутации хранятся по порядку с клиентскими id, уходят пачками до 100, результат `applied` заменяет локальную запись серверной, `duplicate` ведёт себя так же, `rejected` помечает запись ошибкой с кодом и оставляет её для действия пользователя (повторить или отменить).
6. Триггеры синхронизации: таймер 15 минут при открытом приложении, фоновая задача `expo-background-task` с минимальным интервалом 15 минут (по возможности системы), pull-to-refresh, возврат приложения на передний план при давности больше 15 минут, появление сети; одновременно идёт одна синхронизация (подставленные таймеры).
7. Офлайн: баннер `offline`, очередь растёт до 500 мутаций, затем создание блокируется с понятным сообщением.
8. Ошибка 401: одно прозрачное обновление токена; если обновление отклонено, локальные данные и токены стираются, показывается вход.
9. Блокировка: после 5 минут в фоне приложение требует биометрию или код устройства (настройка, по умолчанию включена); выход стирает БД и токены.
10. Тексты только из словаря `i18n`, литералов вне словаря нет (линтер).
11. Подписи элементов, область нажатия не меньше 44 pt, крупный системный шрифт не обрезает текст. (ручной)
12. Сборка профиля `preview` создаёт APK для Android и сборку для симулятора iOS. (ручной)

**Тесты:** `local-db`, `sync-pull`, `outbox`, `sync-triggers`, `session`, `lock` на `node:sqlite` и подставленных часах; сценарии Maestro `login.yaml`, `restart.yaml`.

**Не делать:** экраны товаров, сделок, КП (слайсы 13 и 14), OTA-обновления, сертификатный пиннинг.

---

### Слайс 13: мобильное приложение, поиск и карточка

**Файлы:** `app/(tabs)/search.tsx`, `app/product/[article].tsx`, `src/db/queries.ts`, `src/ui/{Card,ArticleLabel,StockBadge}.tsx`.

**Что делает:** экран «Поиск и справка».

**Критерии приёмки:**

1. Поиск по локальной базе: по артикулу AUTEKO, по оригинальному номеру, по названию, с `normalizeKey` (пробелы, дефисы, регистр, кириллица и латиница), частичное совпадение. 20 000 товаров ищутся за 100 мс. (CI: mobile-unit)
2. Результаты на `FlashList`: `ArticleLabel` (артикул AUTEKO крупно, оригинальный номер светло), модели ДВС, `StockBadge` с суммарным остатком; порядок: точное совпадение артикула, начало, вхождение.
3. Карточка: применимость (модели, `все` показывается как «все модели»), суммарный остаток и остаток по партиям (номер партии, остаток, цена КП с НДС 22%), срок изготовления. Себестоимости на экране и в локальной схеме нет (тест схемы: нет колонок из списка скрытых полей).
4. Цвета по порогам раздела 4, порог берётся из `/api/v1/me`, цвет всегда сопровождается числом.
5. Архивные и «не поставляется» товары помечены.
6. Пустые состояния: нет результатов; база пуста до первой синхронизации («Выполните синхронизацию»).
7. Фильтр по модели ДВС кнопками.
8. Работает офлайн целиком, показывает время последней синхронизации и предупреждение, если оно старше 24 часов.
9. Прокрутка 100 и больше позиций без заметных задержек на среднем устройстве. (ручной)

**Тесты:** `search-queries` (таблицы и замер на `node:sqlite`), `schema-no-cost`, `format`, сценарий Maestro `search.yaml`.

**Не делать:** сканер штрихкодов, фото, избранное.

---

### Слайс 14: мобильное приложение, сделки и КП

**Файлы:** `app/(tabs)/deals.tsx`, `app/deal/*`, `app/(tabs)/quotes.tsx`, `app/quote/*`, `src/sync/outbox.ts` (расширение).

**Что делает:** экраны «Сделки» и «КП».

**Критерии приёмки:**

1. Список своих сделок: статус, индикация просрочки (по `delivery_deadline` в часовом поясе из `/api/v1/me`), фильтры; неотправленные помечены «ожидает отправки», отклонённые показывают причину.
2. Создание сделки: клиент (поиск), товар по артикулу AUTEKO только с остатком больше 0 по локальным данным, партия (по умолчанию самая старая с остатком), количество не больше локального остатка, цена по умолчанию цена КП, изменяемая; запись сразу в очередь и в список, после синхронизации появляется номер `R-xxx`.
3. Проверка на устройстве использует общие валидаторы, ошибки показываются у полей; нехватка остатка на сервере переводит сделку в состояние «отклонена» с текстом `insufficient_stock` и действиями «изменить» и «отменить».
4. Изменение своей сделки в статусах `new` и `confirmed` с `base_version`; при конфликте показывается серверная версия и предлагается применить изменения заново.
5. Статусы оплаты и отгрузки: даты предоплаты, факт. поставки, факт. оплаты показываются, `sales` их не меняет.
6. КП: список, создание (клиент, позиции из поиска, количество, цена), изменение черновика, смена статуса `draft` в `sent`; PDF скачивается с сервера при сети и открывается через системное меню «Поделиться», без сети показывается сообщение.
7. Все сценарии создания работают офлайн и доходят до сервера при появлении сети. (CI: mobile-e2e)
8. Данные себестоимости нигде не отображаются: фикстура с различимыми значениями себестоимости, поиск этих значений в интерфейсе и локальной БД даёт 0 совпадений. (CI: mobile-e2e)

**Тесты:** `deal-create`, `deal-conflict`, `quote-create`, `overdue-view`; сценарии Maestro `deal-offline.yaml`, `quote.yaml`.

**Не делать:** создание клиентов на телефоне, смену статусов оплаты, создание сделок из КП (делает web).

---

### Слайс H: режимы доступа и защита

**Файлы:** `server/config.ts`, `server/security/{headers,csrf,rate-limit,client-ip}.ts`, `proxy.ts`, `deploy/Caddyfile.*`, `compose.yaml` (профили).

**Что делает:** два режима работы (`internal`, `public`) с одинаковым набором мер и разными обязательными настройками, подробности в разделе 18.

**Критерии приёмки:**

1. `DEPLOY_MODE` обязателен (`internal` или `public`), иное значение завершает процесс с понятным сообщением.
2. Режим `public` без любого из `APP_URL` с `https`, `TRUST_PROXY_HOPS`, `APP_ENCRYPTION_KEY`, `BACKUP_ENCRYPTION_KEY` не стартует.
3. В режиме `public` вход без настроенного TOTP ведёт на подключение второго фактора и блокирует остальные страницы, мобильный вход без TOTP даёт `totp_enrollment_required`. В режиме `internal` второй фактор необязателен и включается пользователем.
4. `ALLOWED_CIDRS` (IPv4 и IPv6): клиент вне списка получает 403 `ip_not_allowed` на всё, кроме `/api/health/live`; `X-Forwarded-For` учитывается только при `TRUST_PROXY_HOPS` больше 0, подделанный заголовок при 0 игнорируется.
5. Ограничение частоты: вход 5 попыток за 15 минут на учётную запись и 20 на IP, API 300 запросов в минуту на пользователя, ответ 429 с `Retry-After` (подставленные часы).
6. CSP с одноразовым значением `nonce` в `script-src`, без `unsafe-inline` для скриптов и без `unsafe-eval` в production, e2e не находит нарушений.
7. CSRF: изменяющий запрос route handler с cookie-сессией и чужим `Origin` получает 403, при отсутствии `Origin` и `Sec-Fetch-Site: cross-site` тоже 403, запросы с `Bearer` не проверяются.
8. Все заголовки раздела 18 есть на ответе страницы, API, 404 и статики.
9. Cookie сессии: атрибуты раздела 18, префикс `__Host-` при `https`, замена сессии при входе.
10. Слабые секреты отклоняются при старте: `APP_ENCRYPTION_KEY` не 32 байта в base64, `DATABASE_URL` с ролью суперпользователя.
11. `deploy/Caddyfile.public` (автоматический TLS, HSTS, ограничения запросов, скрытый заголовок `Server`) и `Caddyfile.internal` (внутренний TLS или HTTP) проходят `caddy validate`, `compose.yaml` не публикует порт БД наружу, профили `internal` и `public` поднимаются. (CI: release)
12. Проверка по OWASP ASVS уровня 2 для разделов V2, V3, V4, V5, V7, V8, V13, V14 проведена, результат записан в `docs/OPERATIONS.md`. (ручной)

**Тесты:** `config`, `client-ip`, `rate-limit`, `csrf`, `headers`, `mode-public`, e2e `security` (заголовки, CSP, CSRF, лимит тела).

**Не делать:** WAF, сканер уязвимостей внутри приложения, блокировку по странам.

---

### Слайс E: эксплуатационная готовность

Слайс E делает продукт пригодным для постоянной работы. Значения берутся из таблицы нефункциональных требований раздела 1.

**Файлы:** `server/{logger,maintenance}.ts`, `server/backup/*`, `server/services/backup.ts`, `scripts/backup.ts`, `admin/backups`, `deploy/auteko-backup.*`, `api/health/*`, `api/version`.

**Что делает:** проверка конфигурации при старте, журнал, проверки живости и готовности, корректное завершение, обработка сбоев БД, резервная копия и восстановление (CLI и кнопки), проверка обновления, замеры, ограничения ресурсов.

**Критерии приёмки:**

1. Конфигурация проверяется при старте: неверное или отсутствующее значение (адрес БД, порт, ключи, `BACKUP_DIR`, `APP_TIMEZONE`) завершает процесс с понятным сообщением и ненулевым кодом.
2. Журнал структурный JSON (`pino`: уровень, время UTC, событие, идентификатор запроса). Пишутся запуск, остановка, ошибки. Пароли, токены, секреты и данные клиентов в журнал не попадают: тест подаёт «секретное» значение и ищет его в выводе.
3. `live` отвечает 200 без обращения к данным, `ready` обращается к БД и отвечает 503, когда она недоступна или идёт обслуживание.
4. Корректное завершение: по сигналу остановки процесс заканчивает текущие запросы за 20 секунд, закрывает пул, выходит с кодом 0.
5. Сбои БД (соединение потеряно, блокировка, нет места): пользователь видит страницу ошибки 5xx без внутренностей, процесс не падает, ошибка в журнале, после восстановления БД приложение продолжает без перезапуска.
6. Резервная копия (кнопка «Создать копию» и `backup:run`): `pg_dump -Fc`, шифрование AES-256-GCM потоком, рядом `.json` с размером, SHA-256, видом (`scheduled`, `manual`, `pre-migration`, `pre-restore`) и временем; существующий файл не перезаписывается; пустая или недоступная БД даёт `backup_failed`.
7. Проверка копии (кнопка «Проверить» и `backup:verify`): расшифровка, сверка SHA-256, `pg_restore --list`, результат с временем записывается рядом с копией.
8. Хранение: 14 ежедневных, 8 еженедельных (воскресенье), 6 ежемесячных (первое число), последние 5 копий видов `pre-migration` и `pre-restore`; чужие файлы в каталоге не трогаются (тест на фикстуре дат).
9. Скачивание копии доступно `admin`, отдаёт зашифрованный файл; удаление копии просит подтверждение без JS (`Details`).
10. Восстановление (кнопка «Восстановить» и `backup:restore`): только `admin`, повторный ввод пароля и кода TOTP не старше 5 минут (`reauth_required`), ввод номера копии для подтверждения (`restore_confirm_mismatch`), перед восстановлением создаётся копия `pre-restore`, на время работы включается режим обслуживания (все запросы кроме `live` получают 503 `maintenance`), после восстановления проверяется версия схемы и выполняется `ready`, действие пишется в аудит (запись вносится после восстановления в восстановленную БД).
11. Восстановленная копия открывается приложением, миграции её не ломают, версия схемы прежняя; копия более новой схемы отклоняется с названием версии.
12. Обновление: БД, созданная предыдущим релизом (фикстура в `tests/`), открывается текущей версией без потери данных. Перед миграцией, которая меняет данные или схему, автоматически создаётся копия `pre-migration`.
13. Расписание: `deploy/auteko-backup.timer` запускает `backup:run` ежедневно в 03:00, виджет панели предупреждает, если последняя копия `scheduled` старше 36 часов. (ручной)
14. Производительность на эталонном окружении: список товаров с поиском p95 не больше 300 мс, карточка не больше 150 мс, создание сделки не больше 400 мс при 20 000 товаров, 60 000 партий, 300 000 сделок. (CI: load)
15. Параллелизм: 50 одновременных запросов проходят без ошибок и без потери данных. (CI: load)
16. Ресурсы: размер тела (1 МБ JSON, 10 МБ загрузка), время ожидания запроса к БД (10 секунд), размер пула (10), число одновременных тяжёлых операций (импорт, PDF, копия) не больше 2.
17. Версия продукта и версия схемы доступны в `/api/version` и в журнале при старте.

**Тесты:** по файлу на область (`config`, `logging`, `health`, `shutdown`, `faults`, `backup`, `backup-crypto`, `retention`, `restore`, `upgrade`, `load`). Сбои создаются подменой (недоступный адрес, блокировка), а не поломкой окружения. Тесты копий используют настоящий PostgreSQL из сервиса CI.

**Не делать:** расписание внутри приложения, отправку копий в облако (в `docs/OPERATIONS.md` пример для `rclone`), метрики и трассировку сверх журнала и проверок, репликацию БД.

---

### Слайс D: документация на языке исходника

Слайс не меняет код продукта.

**Файлы:** `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE`, `docs/OPERATIONS.md`, шаблоны issue и pull request (только английский).

**Что делает:**

- README: описание, возможности, быстрый старт для разработчика, таблица всех переменных окружения, режимы `internal` и `public`, раздел «Безопасность» (модель угроз простыми словами, настройка за прокси), резервная копия и восстановление, обновление, разработка, тесты, вклад. Структура по руководствам из раздела 11.
- `docs/OPERATIONS.md`: установка на VPS (Docker Compose), настройка Caddy, TLS, создание первого администратора, таймер резервных копий, копирование копий во внешнее хранилище, восстановление, обновление, сборка и раздача мобильного приложения (EAS, TestFlight, внутренний Android-канал), результат проверки ASVS.
- CONTRIBUTING: как запустить `gate`, формат коммитов, как добавить ключ словаря, как добавить тест. SECURITY: как сообщить об уязвимости (приватные отчёты GitHub), поддерживаемые версии. CHANGELOG: формат Keep a Changelog, версии SemVer, каждая миграция схемы отмечена и сопровождена советом сделать копию. LICENSE: MIT, правообладатель владелец репозитория.

**Критерии приёмки:**

1. Документы существуют и содержат разделы из списка выше.
2. Каждая переменная окружения, которую читает код, описана в README и в `deploy/env.example`, и наоборот. Тест сверяет списки, исключение: переменные только для тестов (`TEST_DATABASE_URL`).
3. Быстрый старт из README работает на чистой копии репозитория. (ручной)
4. Ссылки в документах рабочие. (CI: links)
5. SECURITY называет канал приватного сообщения об уязвимости и поддерживаемые версии. README объясняет различие режимов `internal` и `public`.
6. Инструкция восстановления из `docs/OPERATIONS.md` выполнена на чистом сервере. (ручной)

**Не делать:** переводы (слайс L), сайт документации, видео.

---

### Слайс L: локализация

Слайс выполняется только после решения владельца добавить второй язык интерфейса. Пока в таблице параметров один язык (`ru`), слайс закрыт без работы.

**Что делает:** при добавлении языка владелец через `CONTRACT GAP` расширяет этот слайс критериями по шаблону t1 (выбор языка, паритет словарей, `parseLocale`, шрифтовой стек, режим `Локализация: включена`, переводы документов с хешем исходника).

**Критерии приёмки:**

1. Пока в таблице параметров один язык (`ru`), в шапке `Локализация: отложена` в шапке `tech.md`, словари `packages/shared/src/i18n/ru.ts`, `apps/web/src/i18n/ru.ts`, `apps/mobile/src/i18n/ru.ts` содержат все видимые строки, функция перевода принимает язык параметром. (CI: gate)

**Не делать:** переводы, переключатель языка, шрифты других алфавитов до решения владельца.

---

### Слайс R: релиз и приёмка

Слайс не меняет код продукта, кроме номера версии.

**Что собрать:** конвейер релиза по разделу 20, `Dockerfile` (многоэтапная сборка, пользователь не root, `pg_dump` и `pg_restore` в образе), `compose.yaml` с профилями, инструкция деплоя и отката, профили сборки мобильного приложения (`eas.json`: `preview`, `production`), релиз-кандидат и приёмочный прогон.

**Критерии приёмки:**

1. Все слайсы закрыты, основная ветка зелёная по `gate-full`, `audit`, `secrets`, `mut`, `load`. (CI: gate)
2. Релиз по тегу создаёт образ с SBOM и provenance, архив, контрольные суммы и текст релиза из CHANGELOG. (CI: release)
3. Версия в манифесте, верхняя запись CHANGELOG и тег совпадают, иначе релиз падает. (CI: release)
4. Образ сканируется на уязвимости (высокие и критические блокируют релиз), запускается не от root, отвечает на `ready`, данные в томе переживают перезапуск и обновление образа. (CI: release)
5. Мобильное приложение собрано для Android (APK или AAB) и iOS (TestFlight или внутренняя раздача), установлено на реальные устройства, основной сценарий пройден в обоих режимах (с сетью и без). (ручной)
6. Обновление с предыдущего релиза проверено на копии реальных данных. (ручной)
7. Релиз-кандидат отработал 14 дней в целевом окружении без блокирующих дефектов. (ручной)
8. Ревью безопасности по таблице раздела 18 проведено, `audit` и `secrets` чистые. (ручной)
9. Защита основной ветки включена, приватные отчёты об уязвимостях включены. (ручной)
10. Деплой выполнен по инструкции, откат (предыдущая версия образа плюс резервная копия) проверен. (ручной)

**Не делать:** новые функции, автоматический деплой без владельца, публикацию в сторонние реестры и магазины приложений без решения владельца.

---

Каталог типовых критериев. Для каждого слайса пройди список и добавь критерий, если пункт применим. Применимо и не добавлено: слайс не готов.

Ввод пользователя:

- пустое и пробельное значение обязательного поля: отказ, ничего не записано, форма показывает ошибку и сохраняет введённый текст;
- граница лимита: значение на лимите проходит, на единицу больше отклоняется;
- поле отсутствует во входе, значение не строка, значение с HTML (`<script>`, `<img onerror>`) выводится как текст;
- критические формы работают без JS и с JS (для веба).

Идентификаторы и сущности:

- несуществующий и неразобранный id: 404 или `undefined`, не 500, в обработчике чтения и в каждом действии;
- изменение несуществующей сущности ничего не создаёт;
- изменение не затрагивает посторонние поля (`id`, `created_at`, `version`) и посторонние сущности.

Состояние и повторы:

- действие принимает целевое состояние, двойная отправка даёт тот же результат;
- разрушительные действия подтверждаются без JS (`Details`), безопасные методы (GET) ничего не меняют;
- параллельные изменения одной сущности: `version_conflict`, а не потеря данных; параллельное списание остатка не уводит его ниже нуля.

Права и данные:

- проверка роли на сервере в каждом обработчике: роль без права получает 403 и ничего не меняет, чужая запись роли `sales` даёт 404;
- поля себестоимости не попадают к роли `sales` ни в HTML, ни в JSON, ни в выгрузки, ни в PDF, ни в синхронизацию;
- изменяющее действие пишет запись аудита, пароли, токены и секреты в записи нет.

Деньги и даты:

- деньги считаются функциями `money.ts`, в сравнениях и итогах нет `float`;
- «сегодня» и просрочка считаются в `APP_TIMEZONE`, граница дня проверена подставленными часами.

Списки и поиск:

- порядок сортировки зафиксирован и проверен, пустой список и пустой результат поиска имеют разный текст;
- регистр, составная и разложенная формы символа (NFC и NFD), кириллица и латиница, спецсимволы поиска буквальны, повтор параметра берёт первое значение, запрос в 10000 знаков не падает, значение запроса в разметке экранируется.

Выгрузки:

- ячейки, начинающиеся с `=`, `+`, `-`, `@`, табуляции и `\r`, экранируются, имя файла содержит дату.

Страницы:

- у страницы есть заголовок документа, один `<h1>`, ориентиры, доступность проходит axe, состояние (остаток, статус, просрочка) не передаётся только цветом;
- страницы ошибок на языке интерфейса, без стека и путей.

---

## 16. Ревью после каждого слайса

Отдельным заходом в новом контексте: ревьюер читает `tech.md`, дифф слайса и результат `gate-full`, но не историю рассуждений автора. Слайс готов, гейт зелёный. Задача захода: искать проблемы, а не хвалить написанное.

Чек-лист:

1. Запросы и работа с драйвером хранилища только в слое данных. В экранах и обработчиках их нет.
2. Имена полей совпадают с разделом 4, нет вариантов (`created_at` при `createdAt`, `content` при `body`).
3. Запросов к хранилищу в цикле нет.
4. Обработок ошибок, которые не бывают, нет. Реальные сбои обработаны там, где их разбирает слайс E.
5. Тесты проверяют критерии, а не повторяют реализацию. На каждый критерий с отказом есть тест на отказ. Выборочно ломается одно условие в реализации: хотя бы один тест краснеет. Утверждения конкретны (сравнение с ожидаемым значением), а не «значение существует».
6. Использованы примитивы интерфейса, самописных элементов вместо них нет.
7. Мёртвого кода нет: неиспользуемые экспорты, компоненты, ключи словаря, стили. Заглушек, `TODO`, `FIXME` и закомментированного кода нет.
8. Файлов, абстракций и зависимостей сверх разделов 2 и 3 не появилось.
9. Безопасность (раздел 18): роль проверяется на сервере в каждом обработчике; поля себестоимости не уходят роли `sales` ни в одном канале; нет вывода неэкранированного пользовательского текста; запросы параметризованы; редиректы только через `safeRedirect`; cookie только через общую функцию атрибутов; значения из cookie и формы проходят белый список; пользовательские данные не попадают в заголовки ответа, журнал и сообщения об ошибках.
10. Мультиязычность (раздел 17): нет видимых строк вне словаря; даты и числа идут через средства локали; фрагменты на другом языке помечены.
11. Доступность (раздел 19), если есть UI: подписи осмысленны, порядок фокуса совпадает с порядком чтения, состояние не передаётся только цветом, у страницы есть заголовок документа и один `<h1>`. Состояния «загрузка», «пусто», «ошибка», «успех» обработаны там, где они возможны.
12. `criteria` не называет критериев без тестов, покрытие и мутации не упали.
13. Исключения из покрытия обоснованы комментарием.
14. Остаток и деньги: списание остатка идёт в транзакции под блокировкой строки партии, деньги считаются только через `money.ts`, себестоимость только через `calc.ts`.
15. Мобильное приложение: мутации идемпотентны, локальная схема без скрытых полей, данные стираются при выходе и при отзыве сессии.

Формат находки: `blocker|follow-up`, `файл:строка`, что сломано, почему.

- `blocker` исправляется в том же заходе, затем гейт прогоняется заново, слайс не закрывается до зелёного CI.
- `follow-up` это проблема вне слайса. Ревьюер перечисляет её в отчёте, автор её не чинит. Решение о постановке в работу принимает владелец. Так хирургические правки из раздела 14 не нарушаются.
- Найденный баг получает регрессионный тест `BUG-<n>` (раздел 9).

---

## 17. Мультиязычность

Языки из таблицы параметров: один, `ru`, он же язык по умолчанию. Режим записан в шапке `tech.md` строкой `Локализация: отложена`. Добавление второго языка это слайс L (раздел 15) и решение владельца.

Продукт одноязычный, подраздел шаблона «Продукт, в слайсе L» не действует. С первого слайса:

- Каждая видимая пользователю строка берётся из словаря: тексты, подписи элементов управления, заголовки документов, тексты пустых состояний, ошибки валидации, названия статусов и ролей. Литералов в коде и разметке нет. Общие ключи (`error.*`, `status.*`, `role.*`) лежат в `packages/shared/src/i18n/ru.ts`, ключи экранов в `apps/web/src/i18n/ru.ts` и `apps/mobile/src/i18n/ru.ts`.
- Словарь типизирован: набор ключей проверяет компилятор или тест. Плейсхолдеры `{name}`. Ключ ошибки валидации строится как `error.<код>` (раздел 8).
- Функция перевода получает язык параметром. Язык запроса определяет вход слоя интерфейса и передаёт дальше, глобального «текущего языка» нет.
- Числа и даты форматирует `Intl` с `ru-RU`: деньги `1 234,50 ₽`, дата `11.10.2026`. Момент времени выводится в `APP_TIMEZONE` с подписью зоны, календарная дата (`date`) выводится как есть. Одна функция форматирования на сервере и в мобильном приложении.
- Данные пользователя не переводятся. Язык документа указывается атрибутом `lang="ru"`.

Документы:

- Список: `tech.md`, README, CONTRIBUTING, SECURITY, CHANGELOG, `docs/OPERATIONS.md`. Исходник на русском. Исключения: `LICENSE` и шаблоны в `.github/` (только английский).
- Переводов нет, пока режим `отложена`. После включения языка файл `NAME.<язык>.md` лежит рядом с исходником, первая строка перевода `<!-- i18n-source: NAME.md sha256:<12 hex> -->`, хеш это первые 12 символов SHA-256 исходника, где `\r\n` заменён на `\n`.
- `docs` в режиме `отложена` проверяет плейсхолдеры и наличие исходников. В режиме `включена` сверяет структуру: уровни и порядок заголовков, число блоков кода, строку версии `tech.md`. Блоки кода, команды, имена файлов, переменных и cookie не переводятся.

---

## 18. Безопасность

Модель угроз. Защищаем: коммерческую тайну (закупочные цены, себестоимость, маржа, список контрагентов с ИНН), учётные записи сотрудников, целостность остатков и сделок, доступность данных (копии). Атакуют: внешний нарушитель из интернета (режим `public`) и внутренний (сотрудник с ролью `sales`, который пытается увидеть себестоимость, или тот, кто потерял телефон), а также цепочка поставки (зависимости, действия CI). Поверхности: формы и API, загрузка файлов, мобильное приложение и его локальная БД, резервные копии, зависимости, конвейер релиза. Вне модели: физический доступ к серверу и компрометация ОС хоста, шифрование диска хоста (рекомендуется оператору), отказ в обслуживании на сетевом уровне (решается провайдером и прокси).

Режимы работы. Набор мер один, различаются обязательные настройки (проверяются при старте, слайс H):

| параметр                 | `internal`                                      | `public`                                         |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| TLS                      | внутренний TLS Caddy или HTTP в доверенной сети | только HTTPS, HSTS на прокси                     |
| второй фактор            | необязателен, включает пользователь             | обязателен для всех ролей                        |
| `ALLOWED_CIDRS`          | рекомендуется (офис, VPN)                       | необязателен                                     |
| `TRUST_PROXY_HOPS`       | 0 или 1                                         | обязателен (1 при одном прокси)                  |
| `BACKUP_ENCRYPTION_KEY`  | рекомендуется                                   | обязателен                                       |
| ограничение частоты      | включено                                        | включено                                         |
| cookie                   | `Secure` при https                              | `Secure`, префикс `__Host-`                      |

Универсальные меры. Колонка «где проверяется» содержит ID критериев слайсов.

| угроза                                       | мера                                                                                                                         | где проверяется                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| XSS через пользовательский текст             | вывод только через экранирующий механизм шаблонов, обход экранирования запрещён линтером, CSP `script-src` с `nonce`          | S0A.15, SH.6, S2.10                |
| Инъекция в запросы к БД и в команды          | параметризованные запросы через `sql`, имена колонок через `ident`, вызов процессов только `execFile` с массивом аргументов    | S0A.6, S0A.15                      |
| CSRF                                         | защита Next.js от межсайтовых форм не отключается, `SameSite=Lax`, проверка `Origin` в route handlers, изменения только не-GET | SH.7                               |
| Открытый редирект                            | адрес возврата только через `safeRedirect`                                                                                   | S0A.11, S1.10                      |
| Инъекция через cookie и параметры в разметку | значения из белых списков проверяются на входе, остальное заменяется значением по умолчанию                                  | S6.9, S9.3                         |
| Clickjacking, MIME sniffing, утечка Referer  | заголовки ниже                                                                                                               | S0A.14, SH.8                       |
| Большие запросы и исчерпание ресурсов        | лимит тела, лимиты полей раздела 8, лимиты импорта, таймауты, ограничение частоты                                            | SH.5, SE.16, S7.5                  |
| Перебор паролей, подбор кодов                | блокировка учётной записи, лимит по IP, одинаковый ответ на неверный логин и пароль, TOTP с защитой от повтора               | S1.2, S1.4, S1.6, SH.5             |
| Кража сессии или токена                      | непрозрачные токены, в БД только хеши, ротация и обнаружение повторного использования refresh, отзыв сессий                  | S1.5, S11.1, S11.2                 |
| Доступ без права                             | проверка роли на сервере в каждом обработчике, матрица прав в одном месте                                                    | S1.9, S0A.12                       |
| Утечка себестоимости менеджеру               | `toPublicBatch`, поля скрыты в HTML, JSON, выгрузках, PDF, синхронизации; локальная схема мобильного клиента без этих колонок | S5.5, S8.8, S11.4, S13.3, S14.8    |
| Утечка внутренностей в ошибках и журнале     | страницы ошибок без стека и путей, журнал без секретов и данных клиентов                                                     | SE.2, SE.5                         |
| Потеря или кража устройства                  | SQLCipher, блокировка по биометрии, стирание данных при выходе и при отзыве сессии, токены в `expo-secure-store`             | S12.3, S12.8, S12.9                |
| Кража резервной копии                        | шифрование AES-256-GCM, ключ вне каталога копий, доступ к копиям только `admin`                                              | SE.6, SE.9                         |
| Потеря данных                                | ежедневные копии, проверка, хранение по схеме, восстановление с копией `pre-restore`                                         | SE.6, SE.7, SE.8, SE.10, SE.11     |
| Вредоносный файл импорта                     | лимиты размера и строк, защита от распаковки в память, формулы не вычисляются, экранирование в выгрузках                     | S7.5, S7.6, S5.6                   |
| Уязвимые зависимости                         | `audit` в CI и по расписанию, Dependabot (npm, github-actions, docker), запрет `xlsx` из npm                                 | CI, S0B.10                         |
| Секреты в репозитории                        | `secrets` в CI, файлы окружения с секретами в `.gitignore`, `deploy/env.example` без значений                                | CI                                 |
| Взлом конвейера                              | действия CI закреплены по SHA, права токена только чтение, нет `pull_request_target`, образ сканируется                      | S0B.4, SR.4                        |
| Контейнер                                    | запуск не от root, данные в томе, порт БД не публикуется наружу, ограниченные права роли БД `auteko_app`                     | SH.11, SR.4, S10.4                 |

Заголовки ответа (приложение выставляет их на ответы фреймворка, статику может отдавать прокси):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<random>'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

`nonce` создаётся на каждый запрос в `proxy.ts`. `'unsafe-inline'` в `style-src` допустим только если фреймворк выводит атрибуты `style` в разметке, причина записывается комментарием в конфиге. `Strict-Transport-Security: max-age=31536000; includeSubDomains` добавляет прокси в режиме `public`, в режиме `internal` по схеме адреса. API v1 и ответы с данными дополнительно получают `Cache-Control: no-store`.

Cookie сессии web: `path=/`, без `Max-Age` (срок задаёт сервер, раздел «Аутентификация»), `SameSite=Lax`, `HttpOnly`, `Secure` при схеме `https` (на `http` в локальной сети браузер cookie с `Secure` не сохранит), имя `__Host-auteko_session` при `https` и `auteko_session` при `http`. Значение: случайные 256 бит в base64url. Атрибуты собирает одна функция.

`safeRedirect(target, fallback = '/')` возвращает путь внутри сайта:

- `fallback`, если `target` не строка, пуста, длиннее 2048 символов, содержит управляющие символы или обратную косую черту, не начинается с `/` или начинается с `//`;
- иначе значение разбирается относительно фиктивного origin; если origin изменился, результат `fallback`, иначе `путь + запрос` без фрагмента.

Аутентификация.

- Способ входа: email и пароль, второй фактор TOTP (RFC 6238, SHA-1, 6 цифр, шаг 30 секунд, допускается сдвиг на один шаг, использованный код повторно не принимается). Коды восстановления: 10 штук, хранятся хешами, одноразовые. Секрет TOTP шифруется AES-256-GCM ключом `APP_ENCRYPTION_KEY`.
- Пароли хранятся только как хеши `argon2id` (память 64 МБ, 3 прохода, параллелизм 1, соль 16 байт), пароль от 12 до 128 знаков, проверка по списку частых паролей `server/security/common-passwords.txt` (1000 строк), пароль не равен email. Хеши пересчитываются при входе, если параметры устарели.
- Сессия web: идентификатор случайный, 256 бит, в БД только SHA-256, абсолютный срок 12 часов, простой 2 часа, выход отзывает сессию на сервере, смена пароля и деактивация отзывают сессии, при входе выдаётся новая сессия.
- Сессия мобильного клиента: `access_token` 15 минут, `refresh_token` 30 дней с ротацией при каждом использовании, абсолютный срок 90 дней, повтор использованного `refresh_token` отзывает всю цепочку (`family_id`).
- Перебор: 5 неудач подряд блокируют учётную запись на 15 минут, лимиты по IP и по запросам раздела слайса H, одинаковый ответ на неверный логин и неверный пароль, фиктивная проверка хеша для неизвестного email.
- Права: матрица «роль, действие, сущность» это замороженный контракт раздела 4. Проверка прав идёт на сервере в каждом обработчике, скрытая кнопка защитой не считается. Роль `sales` не получает поля себестоимости ни в одном канале.
- Мобильное устройство: локальная БД шифруется SQLCipher, ключ в `expo-secure-store`, блокировка биометрией или кодом устройства через 5 минут в фоне, выход и отзыв сессии стирают данные, пиннинга сертификата нет (сознательно, чтобы смена сертификата не ломала клиентов).
- Секреты приложения (`APP_ENCRYPTION_KEY`, `BACKUP_ENCRYPTION_KEY`, пароли БД): только из окружения или хранилища секретов платформы, в репозитории, журнале и ответах их нет. Ключи хранятся отдельно от каталога копий.
- Журнал аудита: вход и выход, неудачи, блокировка, смена пароля и 2FA, действия администратора, создание, изменение и удаление данных, резервные копии и восстановление, с временем UTC и идентификатором субъекта. Изменение и удаление записей приложением невозможны (права БД).

Переменные окружения (контракт имён, описание в `deploy/env.example`):

| переменная                 | назначение                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `DEPLOY_MODE`              | `internal` или `public`                                                                     |
| `APP_URL`                  | внешний адрес сервиса                                                                       |
| `APP_TIMEZONE`             | часовой пояс бизнеса, по умолчанию `Europe/Moscow`                                          |
| `DATABASE_URL`             | подключение приложения (роль `auteko_app`)                                                  |
| `DATABASE_MIGRATOR_URL`    | подключение для миграций (роль `auteko_migrator`)                                           |
| `DATABASE_ADMIN_URL`       | подключение для восстановления (включается вместе с `BACKUPS_ENABLED=1`)                    |
| `BACKUPS_ENABLED`          | `1` включает кнопки и команды копий                                                         |
| `APP_ENCRYPTION_KEY`       | 32 байта в base64, шифрование секретов TOTP                                                 |
| `BACKUP_ENCRYPTION_KEY`    | 32 байта в base64, шифрование копий                                                         |
| `BACKUP_DIR`               | каталог копий                                                                               |
| `TRUST_PROXY_HOPS`         | число доверенных прокси                                                                     |
| `ALLOWED_CIDRS`            | список разрешённых сетей через запятую                                                      |
| `CBR_URL`                  | адрес ежедневного XML курсов ЦБ РФ                                                          |
| `HOST`, `PORT`             | адрес и порт прослушивания, по умолчанию `127.0.0.1` и `3000`                               |
| `LOG_LEVEL`                | уровень журнала                                                                             |

Правила линтера (в терминах стека, точные настройки в `eslint.config.js`):

- запрет обхода экранирования (`dangerouslySetInnerHTML`);
- запрет конкатенации и шаблонных строк с подстановкой в аргументах `query` и `one`, запрос строится только тегом `sql`;
- запрет динамического исполнения кода (`eval`, `new Function`) и `child_process.exec` (только `execFile` с массивом аргументов);
- запрет импорта зависимостей из списка запретов раздела 2;
- запрет `Math.random` в серверном коде безопасности (только `node:crypto`);
- запрет `console.*` в серверном коде (только `logger`);
- запрет `skip`, `only` и аналогов в тестах;
- запрет `TODO`, `FIXME` и заглушек «не реализовано»;
- запрет литералов с нелатинскими буквами вне словарей и `domain-literals.ts`.

---

## 19. Доступность и удобство использования

### Web-панель

Цель: WCAG 2.2 AA.

Разметка:

- Один `<h1>` на страницу, язык документа, уникальный заголовок документа из словаря.
- Ориентиры: шапка, навигация с подписью из словаря, основное содержимое. Ссылка текущего раздела получает `aria-current="page"`.
- Поля и ошибки по разделу 6. Подтверждение разрушительных действий не зависит от JS и не использует диалоги браузера.
- Порядок фокуса совпадает с порядком чтения, виден индикатор фокуса.
- Контраст текста 4.5:1, интерфейсных элементов 3:1, в каждой теме.
- Область нажатия не меньше 24 на 24 css-пикселя. Информация не передаётся только цветом.
- Масштаб до 200% и ширина 320 px без потери содержимого и без горизонтальной прокрутки.

Проверки:

- `types` превращает предупреждения компилятора шаблонов о доступности в ошибки.
- `e2e`: axe с тегами `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` на каждой странице из списка маршрутов. Нарушений нет. Слайс, который добавляет страницу или состояние, добавляет их в список.
- Клавиатура: `e2e` проходит основной сценарий только клавишами Tab, Enter, Space.
- Ревью смотрит то, что axe не ловит: осмысленность подписей, порядок фокуса, состояния без цвета.

### Мобильное приложение

- У каждого интерактивного элемента есть подпись для VoiceOver и TalkBack, область нажатия не меньше 44 на 44 pt.
- Крупный системный шрифт не обрезает текст и не ломает списки. Контраст текста 4.5:1.
- Остаток и статус передаются цветом и текстом (`StockBadge`), просрочка словом и значком.
- Основной сценарий (поиск, карточка, создание сделки) проходится с включённым экранным диктором вручную перед релизом.
---

## 20. CI/CD и релиз

CI это обязательный барьер: слайс закрыт, когда CI зелёный на ветке слайса.

Конвейер CI: триггеры `push` в основную ветку, `pull_request`, расписание раз в неделю. Права токена только на чтение. Устаревшие запуски отменяются. Версия рантайма берётся из файла версии, зависимости ставятся по lock-файлу, кэш включён. Действия CI закреплены полным SHA коммита с версией в комментарии, обновления присылает бот обновления зависимостей.

| job        | что запускает                          | зачем                                                                             |
| ---------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| `gate`     | `gate`                                 | формат, линт, типы, документы, трассировка, тесты, покрытие                       |
| `e2e`      | `build`, затем `e2e`                   | собранный артефакт, без JS, заголовки, доступность. Отчёт при падении сохраняется |
| `audit`    | `audit`                                | уязвимости зависимостей, в том числе по расписанию                                |
| `secrets`  | `secrets`                              | секреты в истории                                                                 |
| `mutation` | `mut` на pull request                  | слабые тесты чистых модулей                                                       |
| `load`     | нагрузочные и ресурсные тесты слайса E | бюджет производительности, параллелизм                                            |
| `links`    | проверка ссылок документов             | битые ссылки                                                                      |

Дополнительные job'ы проекта: `codeql` (анализ кода GitHub, на pull request и по расписанию), `mobile-unit` (логика мобильного приложения и замер поиска), `mobile-e2e` (сценарии Maestro на эмуляторе Android, ночью и по ручному запуску), `mobile-build` (профиль EAS `preview`, только по ручному запуску). Проверка `check-workflows` входит в `gate`. Job'ам с БД CI даёт сервис PostgreSQL 18.

Защита основной ветки (один раз, вручную): обязательные проверки `gate`, `e2e`, `audit`, `secrets`, `mutation`, `codeql`, `mobile-unit`; слияние через pull request, даже если разработчик один; force push запрещён.

Релиз по тегу `v*.*.*`:

1. `gate` и `e2e`.
2. Проверка: версия в манифесте, верхняя запись CHANGELOG и тег совпадают.
3. `build`, архив артефакта и файл контрольных сумм.
4. Образ сканируется на уязвимости (высокие и критические блокируют релиз), затем публикуется в реестр с SBOM и provenance, теги версии и `latest`. Мобильные сборки делает отдельный ручной job по профилю EAS `production`, публикацию в TestFlight и магазинах выполняет владелец.
5. Публикация релиза с артефактами, суммами и текстом версии из CHANGELOG.

Права на запись (релизы, пакеты) есть только у job'а релиза.

Контейнер: многоэтапная сборка (в образе `pg_dump` и `pg_restore` версии 18), финальный образ минимальный, запуск не от root, данные в томе, проверка готовности в `HEALTHCHECK`, порт в примерах публикуется на локальный адрес.

Деплой. Автодеплоя нет, владелец ставит релиз сам по `docs/OPERATIONS.md`: Docker Compose на VPS, профиль `internal` или `public`, образ из реестра GitHub. Правила для любого варианта: конфигурация через переменные окружения, секреты через платформу, миграции только вперёд и с резервной копией перед ними, откат это предыдущая версия плюс копия данных, выкатка останавливается при отрицательной проверке готовности.

Версионирование по SemVer. Новая миграция схемы попадает в CHANGELOG, README перед обновлением советует сделать резервную копию.
