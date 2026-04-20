# Barberon — PHP/HTML/JS Version

A complete barbershop booking system rebuilt in **PHP 8+, HTML5, Vanilla JS, and MySQL** — no Node.js, no Next.js, no build step required. Drop the `barberon-php/` folder on any shared hosting (HostGator, cPanel, etc.) and it works.

---

## Features

| Feature | Details |
|---------|---------|
| 🏪 Barbershop listings | Browse and search active barbershops |
| 💈 Services | Per-barbershop service catalog with images & prices |
| 📅 Booking | Calendar + time-slot picker, conflict detection |
| 🔐 Authentication | Email/password login & registration (bcrypt + PHP sessions) |
| 👤 Roles | CUSTOMER · BARBER · ADMIN · SUPERADMIN |
| 🛡️ Admin panel | Dashboard, CRUD for shops/services/bookings/hours |
| 💳 Payments | Mercado Pago config per barbershop |
| ⚙️ App settings | App name, logo, banner carousel |
| 📱 Responsive | Dark-theme, mobile-first UI |

---

## Quick start (local dev)

```bash
# PHP 8.0+ required with PDO and PDO_MySQL
cd barberon-php
php -S localhost:8080
# Open http://localhost:8080
```

---

## Deployment to HostGator / cPanel

### 1. Upload files
Upload the contents of `barberon-php/` to your public directory (e.g. `public_html/` or a subdirectory).

### 2. Create the database
In **cPanel → phpMyAdmin**:
- Create a new database (e.g. `comu8166_barbershop`)
- Run the SQL in `schema.sql`

### 3. Configure database credentials
Edit `includes/config.php` **or** set environment variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=comu8166_barbershop
DB_USER=your_cpanel_user
DB_PASS=your_db_password
SESSION_SECRET=some_random_string_here
```

### 4. Create the superadmin
Via SSH or cPanel Terminal:
```bash
php seed-superadmin.php admin@yourdomain.com StrongPassword123 "Super Admin"
```
Or insert directly in phpMyAdmin — see `seed-superadmin.php` for the INSERT query.

### 5. Done!
Visit `/admin/` and sign in with the superadmin credentials.

---

## Directory structure

```
barberon-php/
├── index.php               # Home page
├── schema.sql              # MySQL schema (run once)
├── seed-superadmin.php     # Seed superadmin (run once)
├── .htaccess               # URL rewriting & security
│
├── includes/
│   ├── config.php          # DB / app config
│   ├── db.php              # PDO wrapper
│   ├── auth.php            # Session, user, helpers
│   ├── layout.php          # HTML shell (header/footer)
│   └── booking-modal.php   # Shared booking modal
│
├── pages/                  # Front-end pages
│   ├── login.php
│   ├── barbershops.php
│   ├── barbershop.php
│   ├── bookings.php
│   └── about.php
│
├── api/                    # JSON REST endpoints
│   ├── auth/               login · register · logout · me
│   ├── barbershops/        list · hours (slots)
│   ├── bookings/           list · create · cancel
│   └── admin/              stats · barbershops · services
│                           hours · bookings · users · settings
│                           payment · me
│
├── admin/                  # Admin panel (PHP + AJAX)
│   ├── index.php           # Admin shell
│   └── pages/
│       ├── dashboard.php
│       ├── barbershops.php
│       ├── services.php
│       ├── bookings.php
│       ├── hours.php
│       ├── users.php
│       ├── admins.php
│       ├── settings.php
│       └── payment.php
│
└── public/
    ├── css/style.css       # Dark-theme stylesheet
    ├── js/app.js           # Client helpers (booking, calendar, toast)
    ├── js/admin.js         # Admin dialog helpers
    └── img/                # Logo & placeholder images
```

---

## Migrating from the Next.js version

The PHP version uses **the same MySQL schema** (`schema.sql`). If you already ran the Next.js migrations on your HostGator database you do **not** need to re-create the tables — just run `seed-superadmin.php` to set the initial admin.

---

## API reference

All API endpoints return JSON. Authentication uses PHP sessions (cookie-based).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login.php` | — | Login |
| POST | `/api/auth/register.php` | — | Register |
| POST | `/api/auth/logout.php` | — | Logout |
| GET | `/api/auth/me.php` | Session | Current user |
| GET | `/api/barbershops/list.php` | — | List / search barbershops |
| GET | `/api/barbershops/list.php?id=X` | — | Barbershop detail |
| GET | `/api/barbershops/hours.php?barbershopId=X&date=YYYY-MM-DD` | — | Available slots |
| GET | `/api/bookings/index.php` | User | My bookings |
| POST | `/api/bookings/index.php` | User | Create booking |
| DELETE | `/api/bookings/index.php?id=X` | User | Cancel booking |
| GET | `/api/admin/stats.php` | Admin | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/admin/barbershops.php` | Admin | CRUD barbershops |
| GET/POST/PUT/DELETE | `/api/admin/services.php` | Admin | CRUD services |
| GET/PUT | `/api/admin/hours.php` | Admin | Manage hours |
| GET/DELETE | `/api/admin/bookings.php` | Admin | Manage bookings |
| GET/POST | `/api/admin/users.php` | Superadmin | Manage users |
| GET/PUT | `/api/admin/settings.php` | Superadmin | App settings |
| GET/PUT | `/api/admin/payment.php` | Admin | Payment config |
