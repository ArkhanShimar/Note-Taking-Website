# Notely – Collaborative Note-Taking App

A full-stack note-taking application built with the MERN stack. Users can create notes, organize them in folders, search through content, and share notes with collaborators.

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- React Quill

**Backend**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- bcrypt

## Features

**Authentication**
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt

**Notes**
- Create, edit, and delete notes
- Rich text editor with formatting and image support
- Draft system with auto-save
- Pin important notes
- Full-text search across titles and content

**Collaboration**
- Share notes with other users via email
- Collaborators can view and edit shared notes
- Track who last edited each note
- Manage collaborator access

**Organization**
- Folder system for organizing notes
- PIN-protected private folders
- Move notes between folders
- Filter by date and ownership

**UI/UX**
- Clean dashboard layout
- Dark mode support
- Responsive design
- Toast notifications

## Project Structure

```
notely/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notely
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

3. Start server:
```bash
npm start
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

**Backend**
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment mode

**Frontend**
- `VITE_API_URL` - Backend API URL

## API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

**Notes**
- `GET /api/notes` - Get all notes
- `GET /api/notes/drafts` - Get drafts
- `GET /api/notes/search?q=query` - Search notes
- `GET /api/notes/:id` - Get note by ID
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/collaborators` - Add collaborator
- `DELETE /api/notes/:id/collaborators/:id` - Remove collaborator
- `PUT /api/notes/:id/pin` - Toggle pin

**Folders**
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder
- `POST /api/folders/:id/verify-pin` - Verify PIN
- `POST /api/folders/:id/notes/:noteId` - Add note to folder
- `DELETE /api/folders/:id/notes/:noteId` - Remove note from folder


## How to use 

**Creating Notes**
1. Click "New Note" in the sidebar
2. Add a title and content using the rich text editor
3. Click "Save" to publish (auto-saves as draft every 2 seconds)

**Organizing Notes**
- Create folders from the sidebar
- Use "Move to Folder" button to organize notes
- Add PIN protection to private folders (4-digit PIN)
- Pin important notes to keep them at the top

**Sharing Notes**
- Click "Share" button on any note
- Enter collaborator email addresses
- Collaborators can view and edit shared notes
- Remove access anytime from the share modal

**Search & Filter**
- Use search bar to find notes by title or content
- Filter by date (Today, This Week, This Month)
- Toggle between "My Notes" and "Shared with Me"
- View drafts separately from published notes

## Testing

To test collaboration features:
1. Register two accounts with different emails
2. Create a note with the first account
3. Share it with the second account's email
4. Login with the second account to view and edit the shared note
