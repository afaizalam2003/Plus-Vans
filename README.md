# Plus Vans

Plus Vans is a **Van Conversion Booking System** that provides a web-based admin dashboard and a flexible API for managing van conversion bookings, customers, payments, and reviews.

## Table of Contents

* [Project Overview](#project-overview)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Features](#features)
  * [Backend (api-master)](#backend-api-master)
  * [Frontend (admin-master)](#frontend-admin-master)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
  * [Backend Setup](#backend-setup)
  * [Frontend Setup](#frontend-setup)
* [Configuration](#configuration)
* [Running the Project](#running-the-project)
* [API Documentation](#api-documentation)
* [Testing](#testing)
* [Deployment](#deployment)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

## Project Overview

Plus Vans is a full-stack application designed to streamline the process of managing van conversion bookings. It consists of:

* **Backend**: A FastAPI service (`api-master`) handling business logic, data persistence, and integrations.
* **Frontend**: A Next.js admin dashboard (`admin-master`) for administrators to manage bookings, customers, and financials.

## Architecture

```
Plus_Plan/
├── api-master/      # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── db/            # Database models and migrations
│   │   ├── schemas/       # Pydantic models
│   │   └── services/      # Business logic
│   ├── tests/             # Test files
│   └── requirements.txt   # Python dependencies
└── admin-master/    # Next.js frontend
    ├── app/               # Next.js app directory
    │   ├── admin/         # Admin dashboard pages
    │   ├── api/           # API routes
    │   └── components/    # Reusable components
    ├── public/            # Static files
    └── package.json       # Frontend dependencies
```

## Tech Stack

### Backend (api-master)

* **Language & Framework**: Python 3.9+, FastAPI
* **Database**: PostgreSQL (via Supabase)
* **ORM & Validation**: SQLAlchemy 2.0+, Pydantic 2.0+
* **Authentication**: JWT (python-jose)
* **Integrations**: 
  - Stripe for payments
  - Supabase for auth and database
  - LangChain for AI features
  - Email services
* **Other**: Alembic for migrations, Loguru for logging

### Frontend (admin-master)

* **Framework**: Next.js 13+ with TypeScript
* **UI Components**: Radix UI, Lucide icons
* **State Management**: Redux Toolkit
* **Data Fetching**: React Query
* **Forms**: React Hook Form with Zod validation
* **Calendar**: FullCalendar with drag-and-drop
* **Table**: TanStack Table
* **Styling**: Tailwind CSS

## Features

### Backend (api-master)

* 🔐 JWT-based user authentication and authorization
* 👥 User and role management
* 📅 Booking management with availability checks
* 💳 Payment processing via Stripe integration
* ⭐ Customer review system
* 🤖 AI-powered features using LangChain
* 📊 Reporting and analytics endpoints
* 📧 Email notifications
* 🔄 Background task processing

### Frontend (admin-master)

* 📊 Interactive dashboard with key metrics
* 📅 Calendar view for bookings
* 👤 Customer management
* 💰 Financial tracking and invoicing
* 📝 Quote generation
* 📱 Responsive design for all devices
* 🔍 Advanced search and filtering
* 📤 Export functionality
* 🔄 Real-time updates

## Prerequisites

* **Node.js** (>=18.x) and **npm** or **pnpm**
* **Python** (>=3.9) and **pip**
* **PostgreSQL** (or use Supabase)
* **Accounts/API Keys** for:
  - Supabase
  - Stripe
  - (Optional) Email service (e.g., SendGrid, Mailgun)

## Installation

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd Plus_Plan/api-master

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head
```

### Frontend Setup

```bash
cd ../admin-master

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

## Configuration

### Backend (api-master/.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/plusvans

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Email
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
```

### Frontend (admin-master/.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Running the Project

### Start Backend

```bash
cd api-master
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend

```bash
cd admin-master
npm run dev
```

Access the application:
- **Admin Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs

## API Documentation

The API documentation is automatically generated using Swagger UI and ReDoc:

* **Interactive API Docs (Swagger UI)**: http://localhost:8000/docs
* **Alternative Documentation (ReDoc)**: http://localhost:8000/redoc

The API includes detailed request/response schemas and example requests.

## Testing

### Backend Tests

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Deployment

### Backend Deployment

1. **Requirements**:
   - Python 3.9+
   - PostgreSQL database
   - Gunicorn + Uvicorn workers (recommended for production)

2. **Using Gunicorn**:
   ```bash
   gunicorn -k uvicorn.workers.UvicornWorker app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

3. **Docker** (recommended):
   ```bash
   docker build -t plusvans-api .
   docker run -d -p 8000:8000 --env-file .env plusvans-api
   ```

### Frontend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (recommended):
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy

3. **Or deploy manually**:
   ```bash
   npm run build
   npm run start
   ```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please reach out to the maintainers:

* **Suraj Kumar (Md Faiz Alam)**
* **Email**: [your.email@example.com](mailto:your.email@example.com)
* **GitHub**: [your-github-username](https://github.com/your-github-username)

---

<div align="center">
  Made with ❤️ by the Plus Vans Team
</div>
