# BDA CRM Module — Manufacturing Company
> A full-stack MERN CRM system for Business Development Associate teams in manufacturing companies. Manage lead pipelines, client relationships, team performance, and sales activities through a modern, role-based dashboard.

---

## 🚀 Live Demo

| | Link |
|--|--|
| **Live App** | https://bda-crm-module.vercel.app |
| **Backend API** | https://bda-crm-backend-dtx1.onrender.com |
| **GitHub** | https://github.com/mridulrajgaria/bda-crm-module |

> ⚠️ **Note:** The backend is hosted on Render's free tier. First request may take **30-50 seconds** to wake up. Please wait and try again if login is slow.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@isaii.in | Admin@123 | Full access — all modules, team management, reports |
| **Manager** | manager1@isaii.in | Manager@123 | All leads, team performance, reports |
| **BDA** | bda1@isaii.in | BDA@123 | Own leads, activities, clients |

> New users can also self-register at `/register` (assigned BDA role by default)

---

## ✨ Features

### Core Modules
| Module | Features |
|--------|----------|
| **Auth** | JWT login, role-based access (Admin / Manager / BDA), register, protected routes |
| **Lead Pipeline** | Kanban board with drag-and-drop, list view, filters, priority tags, source tracking |
| **Lead Detail** | Full lead profile with pipeline progress bar, activity timeline, contact info |
| **Client Management** | Client profiles, deal history, contact info, industry segmentation |
| **Activity Tracker** | Log calls, emails, meetings, demos, follow-ups with status & outcomes |
| **Team Performance** | Individual BDA metrics, target vs. achievement, leaderboard |
| **Dashboard** | KPI cards, lead funnel chart, monthly revenue trend, conversion rates |
| **Reports** | Filterable reports by date range, BDA, product, status + CSV export |
| **Profile** | Edit profile, upload profile picture, change password |
| **Settings** | Notification preferences, display settings, dark mode |
| **Dark Mode** | Full app dark mode toggle, saved in localStorage |
| **Global Search** | Search leads and clients from navbar |
| **Notifications** | Bell icon with notification dropdown |

### Role Permissions
| Action | Admin | Manager | BDA |
|--------|-------|---------|-----|
| Create/delete users | ✅ | ❌ | ❌ |
| View all leads | ✅ | ✅ | Own only |
| Assign leads | ✅ | ✅ | ❌ |
| View team metrics | ✅ | ✅ | Own only |
| Delete leads/clients | ✅ | ✅ | ❌ |

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication + bcryptjs
- express-validator, cors, dotenv

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts (charts)
- @hello-pangea/dnd (Kanban drag & drop)
- react-hot-toast (notifications)
- lucide-react (icons)

---

## ⚙️ Environment Setup

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bda_crm
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Running Locally

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas URI)
- npm

### 1. Clone & Install

```bash
git clone https://github.com/mridulrajgaria/bda-crm-module.git
cd bda-crm-module

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Setup Environment Files

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin: `admin@isaii.in` / `Admin@123`
- 2 Managers: `manager1@isaii.in` / `Manager@123`
- 5 BDAs: `bda1@isaii.in` / `BDA@123`
- 60 sample leads, 6 clients, 120 activities

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## 📁 Project Structure
bda-crm-module/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── seed.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
└── frontend/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── vercel.json
└── vite.config.js

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register (BDA role) |
| GET | `/api/auth/me` | Any | Current user |
| GET | `/api/dashboard/stats` | Any | KPI summary |
| GET | `/api/leads` | Any | List leads |
| POST | `/api/leads` | BDA+ | Create lead |
| PUT | `/api/leads/:id` | BDA+ | Update lead |
| PUT | `/api/leads/:id/status` | BDA+ | Move in pipeline |
| DELETE | `/api/leads/:id` | Manager+ | Delete lead |
| GET | `/api/clients` | Any | List clients |
| POST | `/api/clients` | BDA+ | Create client |
| GET | `/api/activities` | Any | List activities |
| POST | `/api/activities` | BDA+ | Log activity |
| GET | `/api/team` | Manager+ | Team list |
| GET | `/api/team/performance` | Manager+ | Performance metrics |
| GET | `/api/reports/leads` | Manager+ | Lead reports |

---

## 🚢 Deployment

- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

---

## 📄 License

MIT