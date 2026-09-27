# CRM Programming School

Фінальний проєкт: внутрішня CRM для обліку заявок студентів на курси.

## Стек
- Node.js **20**
- Backend: NestJS 10, TypeORM, Mongoose, JWT, Swagger
- Frontend: React 19, Vite, TypeScript, React Router, Axios
- Бази: **MySQL** + **MongoDB**

## Чому дві бази
- **MySQL** — таблиця `orders` з офіційного дампу школи (структуровані заявки).
- **MongoDB** — користувачі, ролі, коментарі, групи, токени активації. Цього немає в SQL-дампі, тому зручніше тримати як документи.

## Що потрібно встановити
- Node.js 20 (перевірка: `node -v`)
- npm (йде разом з Node)
- Інтернет (хмарні бази або перше завантаження локальних)

Docker не обов'язковий.

## Налаштування `.env`
Файл: `backend/.env` (скопіюй з `backend/.env.example`).

Для здачі використовуємо хмарні бази:
- MySQL (наприклад FreeDB): `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`, `MYSQL_SSL=true`
- MongoDB Atlas: `MONGO_URI` (у Network Access дозволь IP або `0.0.0.0/0`)

Паролі в git не комітимо.

## Запуск проєкту

1. Бекенд:
```
cd backend
npm install
npm run start:dev
```
API: http://localhost:5000  
Документація Swagger: http://localhost:5000/docs

2. Фронтенд (інший термінал):
```
cd frontend
npm install
npm run dev
```
Сайт: http://localhost:5173  
(якщо порт зайнятий, Vite відкриє 5174 — це нормально)

3. Відкрий браузер → сторінка логіна.

## Логін за замовчуванням
- email: `admin@gmail.com`
- password: `admin`

Публічної реєстрації немає. Менеджерів створює тільки admin.

## Як залити дамп заявок у MySQL
Файл дампу: `dumps/orders.sql`

```
node .\scripts\import-orders.js
```
Скрипт читає дані з `backend/.env` і заливає заявки в хмарну MySQL.

## Локальні бази (якщо хмара недоступна)
```
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-db.ps1
```
Піднімає MySQL на `3306` і Mongo на `27017`. Тоді в `.env` має бути `localhost`.

## Колекція Postman
Файл у корені репозиторію: `CRM.postman_collection.json`  
Після логіна підстав JWT у змінну `token`.

## Основний функціонал
- заявки: пагінація 25, сортування, фільтри в queryParams
- коментар закріплює заявку за менеджером, статус `In work`
- EDIT тільки своєї заявки (або нічиєї); статус `New` звільняє заявку
- Excel за поточними фільтрами
- адмін-панель: статистика, створення менеджера, Activate / Recovery, Ban / Unban
- активація за посиланням, токен живе 30 хвилин
