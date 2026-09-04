**English** | [Русский](./README.ru.md)

# Courses Store — MEHN Stack

A server-rendered online store for educational courses, built on the MEHN stack: **M**ongoDB, **E**xpress, **H**andlebars and **N**ode.js. The focus of the project was the back end — authentication, security and data modelling — with Handlebars handling server-side templating.

## Features

- Course catalogue with detail pages and an editing flow
- Shopping cart and order placement
- Session-based authentication with cookies, backed by a MongoDB session store
- Route guards restricting access to authenticated users
- CSRF protection on state-changing requests
- Password reset over email with expiring tokens
- Server-side validation of all incoming form data
- Role and permission handling for course ownership
- Image upload for course covers

## Architecture

| Folder | Responsibility |
| --- | --- |
| `routes` | Express routers, one per resource |
| `models` | Mongoose schemas and models |
| `middleware` | Auth guards, validation, file upload, error handling |
| `pages` | Handlebars templates, layouts and partials |
| `emails` | Email templates for registration and password reset |
| `utils` | Shared helpers |
| `public` | Static assets served to the browser |
| `images` | Uploaded course images |

`index.js` wires up the Express app: middleware chain, sessions, routers and the database connection.

## Stack

Node.js, Express, MongoDB with Mongoose, Handlebars, express-session with connect-mongodb-session, csurf, multer, SendGrid.

## Running locally

Requires Node.js and a MongoDB instance (a free Atlas cluster works).

    git clone https://github.com/FatB0YY/MEHN-stack_coursesApp.git
    cd MEHN-stack_coursesApp
    npm install

Copy `keys/index.example.js` to `keys/index.js` and fill in your own values:

    MONGODB_URI    — MongoDB connection string
    SESSION_SECRET — any random string
    SENDGRID_API_KEY — for password-reset emails
    BASE_URL       — application URL, e.g. http://localhost:3000

Then start the server:

    npm start

## Notes

Built as a learning project. Authentication here is session-based; in later projects I moved to JWT with refresh tokens — see [auth-demo-httpOnly-cookies](https://github.com/FatB0YY/auth-demo-httpOnly-cookies). The user-facing interface is in Russian.

## Author

Rodion Ramazanov — [GitHub](https://github.com/FatB0YY) · [Telegram](https://t.me/iamrodionn)
