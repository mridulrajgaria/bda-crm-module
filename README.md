# BDA CRM Module — Manufacturing Company
> A full-stack MERN CRM system for Business Development Associate teams in manufacturing companies. Manage lead pipelines, client relationships, team performance, and sales activities through a modern, role-based dashboard.

---

## 🚀 Features

### Core Modules
| Module | Features |
|--------|----------|
| **Auth** | JWT login, role-based access (Admin / Manager / BDA), protected routes |
| **Lead Pipeline** | Kanban board with drag-and-drop, list view, filters, priority tags, source tracking |
| **Client Management** | Client profiles, deal history, contact info, industry segmentation |
| **Activity Tracker** | Log calls, emails, meetings, demos, follow-ups with status & outcomes |
| **Team Performance** | Individual BDA metrics, target vs. achievement, leaderboard |
| **Dashboard** | KPI cards, lead funnel chart, monthly revenue trend, conversion rates |
| **Reports** | Filterable reports by date range, BDA, product, status |

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
- @hello-pangea/dnd (Kanban DnD)
- react-hot-toast (notifications)
- lucide-react (icons)

---

## ⚙️ Environment Setup

### Backend `.env`
Create `/backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```

Fill in:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bda_crm
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env`
Create `/frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Running Locally

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas URI)
- npm or yarn

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bda-crm-module.git
cd bda-crm-module

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Seed the Database (optional but recommended)

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin user: `admin@isaii.in` / `Admin@123`
- 2 Manager users: `manager1@isaii.in` / `Manager@123`
- 5 BDA users: `bda1@isaii.in` / `BDA@123`
- Sample leads, clients, and activities

### 3. Run the Application

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

```
bda-crm-module/
├── backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── seed.js         # Database seeder
│   ├── controllers/        # Business logic
│   ├── middleware/
│   │   ├── auth.js         # JWT protect middleware
│   │   └── roleCheck.js    # Role-based guard
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React context (Auth)
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Route-level pages
    │   ├── utils/          # Axios instance, helpers
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Any | Current user |
| GET | `/api/dashboard/stats` | Any | KPI summary |
| GET | `/api/leads` | Any | List leads (filtered) |
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

**Backend** → Render.com / Railway.app
- Set all environment variables in the dashboard
- Build command: `npm install`
- Start command: `npm start`

**Frontend** → Vercel / Netlify
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your deployed backend URL

---

## 📸 Screenshots

> Dashboard, Kanban Board, Team Performance, Activity Log

---

## 🤝 Contributing

Built for the Isaii AI Technical Assessment — MERN Stack Developer Intern Role.

---

## 📄 License

MIT
