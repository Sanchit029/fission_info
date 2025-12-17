# Eventify - Full Stack Event Management Application

A complete MERN stack application for managing events with user authentication, RSVP system with concurrency handling, and AI-powered description generation.

## 🚀 Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Event Management**: Full CRUD operations for events
- **Image Upload**: Cloudinary integration for event images
- **RSVP System**: Join/leave events with capacity enforcement
- **Concurrency Handling**: Robust race condition prevention for RSVPs
- **Responsive UI**: Works seamlessly on Desktop, Tablet, and Mobile

### Bonus Features
- **AI Integration**: Auto-generate event descriptions using OpenAI
- **Search & Filtering**: Search by title, filter by category/date
- **User Dashboard**: View created events and RSVPs
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Zustand, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Image Storage**: Cloudinary
- **AI**: OpenAI API (optional)
- **Deployment**: Vercel (Frontend), Render (Backend)

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account
- OpenAI API key (optional, for AI features)

## 🏃‍♂️ Local Development

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Fission_Info
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventify
JWT_SECRET=your-super-secret-key-minimum-32-characters
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key  # Optional
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🚀 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
4. Add environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `OPENAI_API_KEY` (optional)
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`

### Frontend Deployment (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL + `/api`

### MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist all IPs (0.0.0.0/0) for deployment
4. Get your connection string

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get credentials from Dashboard
3. Create a folder named `eventify` (optional)

## 📁 Project Structure

```
Fission_Info/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── eventController.js # Event CRUD & RSVP
│   │   └── aiController.js    # AI description generation
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Event.js           # Event schema
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── events.js          # Event routes
│   │   └── ai.js              # AI routes
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Auth components
│   │   │   ├── common/        # Shared components
│   │   │   ├── events/        # Event components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (owner only)
- `DELETE /api/events/:id` - Delete event (owner only)
- `POST /api/events/:id/rsvp` - RSVP to event
- `DELETE /api/events/:id/rsvp` - Cancel RSVP
- `GET /api/events/user/created` - Get user's created events
- `GET /api/events/user/attending` - Get user's attending events

### AI (Optional)
- `POST /api/ai/generate-description` - Generate description
- `POST /api/ai/enhance-description` - Enhance description

## ⚡ Concurrency Handling

The RSVP system uses MongoDB atomic operations and transactions to prevent overbooking:

```javascript
// Uses findOneAndUpdate with conditions to ensure:
// 1. User is not already in attendees
// 2. Capacity is not exceeded
// All in a single atomic operation
```

## 🎨 Responsive Design

The UI is built with Tailwind CSS and adapts to:
- **Mobile**: < 640px (single column layouts)
- **Tablet**: 640px - 1024px (2 column grids)
- **Desktop**: > 1024px (3-4 column grids)

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
