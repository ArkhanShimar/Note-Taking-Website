# Collaborative Notes App

A full-stack MERN application for collaborative note-taking with rich text editing and real-time sharing.

## Tech Stack

- MongoDB
- Express.js
- React
- Node.js
- Tailwind CSS
- JWT Authentication

## Getting Started

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string and JWT secret

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5001`

Test the health check endpoint: `http://localhost:5001/health`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

Open your browser and visit `http://localhost:5173` to use the app!

## Features

- User authentication (register/login)
- Create, edit, and delete notes
- Rich text editor
- Full-text search
- Share notes with collaborators
- Collaborative editing
- Notes dashboard with filtering and pagination
