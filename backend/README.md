# CRM Programming School

Внутрішня CRM для обліку заявок студентів на курси (фінальний проєкт).

Реєстрації через сайт немає. Акаунти менеджерів створює тільки **admin**.

## Версії середовища

- **Node.js 20** (перевірка: `node -v`)
- **npm** (йде разом з Node, перевірка: `npm -v`)
- Backend: **NestJS 10**, TypeScript 5
- Frontend: **React 19**, **Vite 8**, TypeScript
- Бази: **MySQL 8** (хмара) + **MongoDB Atlas**

ОС: Windows. Команди нижче — для PowerShell.

## Чому дві бази

- **MySQL** — таблиця `orders` з офіційного дампу школи. Заявки вже мають фіксовану схему, їх зручно фільтрувати і сортувати SQL-запитами.
- **MongoDB** — користувачі (admin / manager), коментарі, групи, токени активації. Цих сутностей немає в SQL-дампі, тому вони зберігаються окремо.

Можна працювати і з хмарними базами (для здачі), і з локальними (для розробки без інтернету).

## Структура репозиторію

- `backend/` — API (NestJS)
- `frontend/` — інтерфейс (React)
- `dumps/orders.sql` — дамп заявок
- `scripts/` — скрипти запуску локальних баз і заливки дампу
- `CRM.postman_collection.json` — колекція запитів Postman

## 1. Клонування

```
git clone <url-репозиторію>
cd final-project_2026
```

Гілка для здачі: **master**.

## 2. Файл налаштувань бекенду

Скопіюй приклад і заповни своїми даними:

```
cd backend
copy .env.example .env
```

Приклад `backend/.env` для **хмарних** баз:

```
PORT=5000
JWT_SECRET=super_secret_key_for_crm
FRONTEND_URL=http://localhost:5173

MYSQL_HOST=sql.freedb.tech
MYSQL_PORT=3306
MYSQL_USER=твій_юзер
MYSQL_PASSWORD=твій_пароль
MYSQL_DB=назва_бази_з_сайту
MYSQL_SSL=true

MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/crm_school
```

- `MYSQL_DB` має бути **точною назвою бази** з панелі FreeDB (часто не `crm_school`).
- У MongoDB Atlas: **Network Access** → дозволити свій IP або `0.0.0.0/0`.
- Файл `.env` у git не потрапляє. Паролі в README і в чат не пишемо.

Для **локальних** баз залиш значення як у `.env.example` (`localhost`, порт MySQL `3306`).

## 3. Заливка дампу заявок (MySQL)

Файл: `dumps/orders.sql` (~500 заявок).

З кореня проєкту:

```
node .\scripts\import-orders.js
```

Скрипт читає `backend/.env` і заливає таблицю `orders`.
Якщо в терміналі `Done. Orders in DB: 500` — дамп на місці.

## 4. Запуск бекенду

```
cd backend
npm install
npm run start:dev
```

Має з’явитись: `server started on 5000`

- API: http://localhost:5000
- Swagger (документація API): http://localhost:5000/docs

Якщо помилка MongoDB про IP whitelist — повернись до Network Access в Atlas і перезапусти бекенд.

## 5. Запуск фронтенду

Другий термінал:

```
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:5173  
Якщо порт зайнятий, Vite відкриє `5174` — це нормально, логін все одно працює.

У браузері одразу відкривається сторінка логіна.

## 6. Вхід

- email: `admin@gmail.com`
- password: `admin`

Роль: **admin**. Після входу — сторінка заявок.

## Локальні бази (необов’язково)

Якщо хмара недоступна:

```
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-db.ps1
```

Піднімає MySQL на `3306` і MongoDB на `27017`, створює БД `crm_school`.
Після цього в `backend/.env` має бути `localhost`, і знову `npm run start:dev`.

Docker не обов’язковий.

## Postman

Файл: `CRM.postman_collection.json`

1. Імпортуй колекцію в Postman.
2. Зроби `Auth login`.
3. Скопіюй `token` з відповіді в змінну колекції.
4. Далі можна викликати `/orders`, `/admin/...` тощо.

## Коротко про функціонал

- заявки: 25 на сторінку, сортування кліком по колонці, фільтри в URL
- коментар закріплює заявку за менеджером, статус стає `In work`
- EDIT лише нічиєї заявки або своєї; статус `New` знову робить заявку вільною
- Excel за поточними фільтрами
- адмін: статистика, створення менеджера, Activate / Recovery password, Ban / Unban
- посилання активації копіюється в буфер, токен живе **30 хвилин**
