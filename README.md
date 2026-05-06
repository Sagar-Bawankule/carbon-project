# EcoTrack - Personal Carbon Footprint Tracker

A responsive, minimalist web application to track, calculate, and reduce your personal carbon footprint (CO₂e).

![EcoTrack](https://img.shields.io/badge/EcoTrack-v1.0.0-22c55e)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248)

## 🌿 Features

### Dashboard
- **Carbon Dial**: Visual gauge showing current daily/monthly emissions vs budget
- **Category Breakdown**: Energy, Transport, Food, and Shopping emissions
- **Trend Charts**: 7-day and 30-day emission trends with animated charts
- **AI Recommendations**: Personalized tips based on your activity patterns

### Activity Tracking
- **Energy**: Electricity (kWh), Natural Gas, Heating Oil, Propane
- **Transport**: Various vehicle types, public transit, flights
- **Food**: Specific items or diet types (Meat-heavy to Vegan)
- **Shopping**: Clothing, Electronics, Furniture, and more

### Calculation Engine
Based on scientific emission factors:
- $CF_{energy} = (EF_{elec} \times kWh) + (EF_{fuel} \times Liters)$
- $CF_{transport} = \sum_{m=1}^{M} (EF_{mode\_m} \times Distance_m)$
- $CF_{food} = \sum_{j=1}^{J} (EF_{food\_j} \times Quantity_j)$
- $CF_{total} = CF_{energy} + CF_{transport} + CF_{food} + CF_{goods}$

### Budget Alerts
- Automatic alerts when approaching or exceeding monthly limits
- Status indicators: ✓ On Track, ⚠ Warning (80%), ✕ Exceeded

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd EcoTrack
npm run install:all
```

2. **Configure environment:**

The server `.env` file is already configured with defaults:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/EcoTrack
JWT_SECRET=ecotrack_secret_key_change_in_production
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:3000
```

3. **Start MongoDB:**
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

4. **Run the application:**
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 3000
```

5. **Open your browser:**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
EcoTrack/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── index.css       # Tailwind styles
│   └── package.json
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # DB & emission factors
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Calculation engine
│   │   └── index.js        # Server entry
│   └── package.json
│
└── package.json            # Root package
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Start Google OAuth sign-in
- `GET /api/auth/google/callback` - Google OAuth callback endpoint
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/onboarding` - Complete profile setup

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get single activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/summary/daily` - Daily summary
- `GET /api/activities/trends/weekly` - 7-day trends
- `GET /api/activities/trends/monthly` - 30-day trends

### Goals
- `GET /api/goals/current` - Current month's goal
- `PUT /api/goals/limit` - Update budget limit
- `GET /api/goals/history` - Goal history
- `GET /api/goals/dashboard` - Full dashboard data
- `GET /api/goals/emission-factors` - Get emission factors

## 🎨 UI/UX Features

- **Mobile-First Design**: Responsive across all devices
- **Nature-Modern Theme**: Soft greens, whites, and slate greys
- **Smooth Animations**: Page transitions, hover effects, chart animations
- **Interactive Components**: Hover states, tap feedback
- **Accessibility**: High contrast, clear labels

## 📊 Emission Factors

Based on EPA, DEFRA, and environmental agency data:

| Category | Example | Factor |
|----------|---------|--------|
| Electricity | 1 kWh | 0.42 kg CO₂e |
| Petrol Car | 1 km | 0.21 kg CO₂e |
| Electric Car | 1 km | 0.05 kg CO₂e |
| Beef | 1 kg | 27.0 kg CO₂e |
| Vegan Diet | 1 day | 2.89 kg CO₂e |

## 🎯 Development Checklist

- [x] Setup Express server and MongoDB connection
- [x] Create REST API endpoints for auth and activities
- [x] Build Frontend with Framer Motion animations
- [x] Integrate CO₂e calculation formulas
- [x] Implement budget limit logic with alerts
- [x] Ensure responsive UI across breakpoints
- [x] Add trend visualization charts
- [x] Create recommendation engine
- [x] Token Shop & Rewards System
- [x] Group Leaderboard Feature
- [x] Vercel Deployment Ready ✅

## 🚀 Vercel Deployment Guide

This project uses a **monorepo structure** with two separate Vercel deployments:
- **Frontend** (React/Vite) → deploys from root or `client/` directory
- **Backend** (Express API) → deploys from `server/` directory

---

### Step 1: Deploy the Backend (API Server)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the GitHub repo: `Sagar-Bawankule/carbon-project`
3. Set **Root Directory** → `server`
4. Framework Preset: **Other**
5. Add these **Environment Variables** in Vercel dashboard:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret string |
| `JWT_EXPIRE` | `7d` |
| `ELECTRICITY_MAPS_API_KEY` | Your API key |
| `CARBON_INTERFACE_API_KEY` | Your API key |
| `GROK_API_KEY` | Your Grok API key |
| `CLIENT_URL` | Your frontend Vercel URL (add after deploying frontend) |

6. Deploy → Copy the deployed URL (e.g., `https://carbon-project-api.vercel.app`)

---

### Step 2: Deploy the Frontend (React App)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import same repo**
2. **Root Directory** → leave empty (root `/`) or set to `client`
3. Build Command: `cd client && npm install && npm run build`
4. Output Directory: `client/dist`
5. Add this **Environment Variable**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

6. Deploy → Copy frontend URL
7. Go back to **Backend project settings** → add `CLIENT_URL` = frontend URL → **Redeploy**

---

### MongoDB Atlas Setup (Required for Production)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a DB user with read/write permissions
3. Whitelist IP: `0.0.0.0/0` (allow all — needed for Vercel serverless)
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/EcoTrack`
5. Set as `MONGODB_URI` in your Vercel backend environment variables

## 📝 License

MIT License - Feel free to use and modify for your projects!

---

Built with 💚 for a sustainable future 🌍
