# CRM Programming School

Фінальний проєкт: CRM для заявок на курси.

## Чому дві бази
- **MySQL** — заявки з офіційного дампу (`orders`).
- **MongoDB** — юзери, коментарі, групи, токени активації (цього немає в sql дампі).

## Що потрібно
- Node.js 20
- Інтернет один раз, щоб скрипт скачав портативні бази (Docker **не потрібен**)

Docker Desktop на цьому ПК не підходить: немає віртуалізації. Тому бази запускаються локально скриптом.

## Запуск

1. Підняти бази (перший раз може зайняти кілька хвилин):
```
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-db.ps1
```
Це підніме MySQL на порту 3306 і Mongo на 27017, створить БД `crm_school` і заллє дамп заявок.

2. Бекенд:
```
cd backend
npm install
npm run start:dev
```
Сервер: http://localhost:5000  
Swagger: http://localhost:5000/docs

3. Фронтенд:
```
cd frontend
npm install
npm run dev
```
Сайт: http://localhost:5173

Якщо знову буде `ECONNREFUSED` — просто ще раз запусти крок 1 (вікна mysqld/mongod мають бути відкриті).

## Логін
email: `admin@gmail.com`  
password: `admin`

## Дампи
- MySQL: `dumps/orders.sql`
- Mongo: адміна створюємо самі при старті бекенду.
