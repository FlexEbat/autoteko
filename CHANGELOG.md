# Журнал изменений

## Не выпущено

- Каркас монорепозитория (слайс 0A): `packages/shared`, `apps/web`, миграция `0001_init.sql`.
- TypeScript 6.0.3 вместо 7.0.2: `typescript-eslint` не поддерживает TypeScript 7 (у него нет JS API). Возвращаемся на 7, когда выйдет совместимая версия `typescript-eslint`.
