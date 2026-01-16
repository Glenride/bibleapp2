# Bible Application

A modern, production-ready Bible reading and journaling application built with Laravel and React (Inertia.js).

## Features

- **Read Bible**: Browse books, chapters, and verses.
- **Zen Mode**: Distraction-free reading experience with persistent preference.
- **User Interactions**:
    - **Highlights**: Color-coded highlights (Yellow, Green, Blue, Pink) with notes.
    - **Favorites**: Mark verses as favorites with notes.
    - **Bookmarks**: Bookmark chapters or specific verses with notes.
- **My Journal**: Dashboard to view and manage all personal highlights, favorites, and bookmarks.
- **Search**: (Coming soon)
- **SEO Optimized**: Dynamic meta tags and sitemap generation.
- **Secure**: Robust authorization policies and security headers.

## Tech Stack

- **Backend**: Laravel 12
- **Frontend**: React, Inertia.js, Tailwind CSS
- **Database**: SQLite (Dev), PostgreSQL/MySQL (Prod recommended)
- **Authentication**: Laravel Fortify
- **UI Components**: Shadcn UI, Lucide Icons
- **Toast Notifications**: Sonner

## Production Readiness

This application has been optimized for production:
- **Security**: Content Security Policy (CSP), HSTS, and other security headers implemented. Authorization policies ensure data privacy.
- **Performance**: Database indexes on core tables.
- **SEO**: Automatic sitemap generation and Open Graph tags.
- **UX**: Custom error pages (404, 500) and flash messages.

## Setup

1. **Install Dependencies**:
    ```bash
    composer install
    npm install
    ```

2. **Environment Setup**:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

3. **Database**:
    ```bash
    php artisan migrate --seed
    ```

4. **Build Assets**:
    ```bash
    npm run build
    ```

5. **Run Locally**:
    ```bash
    php artisan serve
    ```

## Commands

- **Generate Sitemap**:
    ```bash
    php artisan app:generate-sitemap
    ```
    *Scheduled to run daily.*

## Testing

Run the feature and security tests:
```bash
php artisan test
```
