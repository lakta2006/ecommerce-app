# لقطة (Lakta) - E-commerce Platform

منصة تجارة إلكترونية موجهة للسوق السوري، تعتمد على التواصل المباشر عبر واتساب لإتمام الطلبات.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy environment file and configure:
```bash
copy .env.example .env  # Windows
# or
cp .env.example .env  # Mac/Linux
```

5. Update database URL in `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/lakta
```

6. Run database migrations:
```bash
alembic upgrade head
```

7. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
copy .env.example .env  # Windows
# or
cp .env.example .env  # Mac/Linux
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## 📁 Project Structure

```
lakta/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core utilities (auth, security)
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── main.py       # FastAPI app entry point
│   │   └── database.py   # Database configuration
│   ├── alembic/          # Database migrations
│   ├── tests/            # Backend tests
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── stores/       # Zustand stores
    │   ├── types/        # TypeScript types
    │   ├── utils/        # Utility functions
    │   └── App.tsx       # Main app component
    ├── tests/            # Frontend tests
    ├── package.json
    └── .env
```

## 🔐 Authentication Flow

The auth system supports:

1. **Registration** - Create new account with email, password, name, and optional phone
2. **Login** - JWT-based authentication with access & refresh tokens
3. **Password Reset** - Token-based password reset via email
4. **Profile Management** - Update profile and change password
5. **Role-based Access** - Customer, Store Owner, Mall Owner, Admin

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| PUT | `/api/profile/password` | Change password |

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Alembic** - Database migrations
- **Pytest** - Testing framework

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/lakta
SECRET_KEY=your-secret-key-min-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT access & refresh tokens
- Token rotation on refresh
- Password reset tokens with expiration
- Role-based access control (RBAC)
- CORS configuration
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy

## 🌐 Arabic/RTL Support

The frontend is fully RTL-enabled with:
- IBM Plex Sans Arabic font
- Right-to-left text direction
- Arabic form validations
- Arabic error messages

## 📈 Next Steps

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Start backend and frontend servers
5. Test authentication flow

## 📄 License

MIT
