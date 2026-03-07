# Notely - Collaborative Note-Taking App

A full-stack note-taking web application built with the MERN stack. Think of it as a simplified version of Notion or Google Keep, but with collaborative features, folder organization, and a clean dark mode. Perfect for students, teams, or anyone who wants to keep their thoughts organized.

## Overview

Notely is a modern web app that lets you create, organize, and share notes with others. Whether you're taking class notes, planning a project, or just jotting down ideas, Notely keeps everything in one place with a clean, intuitive interface.

## Features

### 📝 Note Management
- **Rich Text Editor** - Format your notes with bold, italic, underline, headers, lists, code blocks, and more using the Quill editor
- **Image Support** - Add images to your notes by uploading or pasting
- **Auto-Save** - Your work is automatically saved as a draft every 2 seconds, so you never lose progress
- **Word Count** - Track the length of your notes in real-time
- **Full-Text Search** - Quickly find any note by searching through titles and content
- **Note Pinning** - Pin important notes to keep them at the top of your list
- **Draft System** - Unfinished notes are saved as drafts until you're ready to publish

### 📁 Organization
- **Folder System** - Create custom folders to organize your notes
- **Color-Coded Folders** - Choose from 6 different color themes for your folders (indigo, green, orange, blue, pink, yellow)
- **Private Folders** - Create PIN-protected folders for sensitive notes (4-digit PIN)
- **Folder Management** - Add notes to folders, remove them, or delete entire folders

### 👥 Collaboration
- **Share Notes** - Invite collaborators by email to view and edit your notes
- **Multiple Sharing Options** - Share individual notes or multiple notes at once
- **Collaborator Management** - See who has access to your notes and remove collaborators anytime
- **Edit Tracking** - See who made the last edit on shared notes
- **Shared Notes View** - Filter to see notes shared with you or notes you've shared with others

### 🔐 Security & Authentication
- **User Registration & Login** - Secure JWT-based authentication
- **Password Protection** - Passwords are hashed using bcrypt
- **Private Notes** - Your notes are private by default unless you share them
- **PIN Protection** - Add an extra layer of security with PIN-protected folders
- **Profile Management** - Update your name and change your password anytime
- **Account Deletion** - Full control over your data

### 🎨 User Experience
- **Dark Mode** - Toggle between light and dark themes (preference is saved)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Clean UI** - Modern interface built with Tailwind CSS
- **Toast Notifications** - Get instant feedback on your actions
- **Pagination** - Smooth browsing experience even with hundreds of notes
- **Sorting & Filtering** - Sort by date created, last updated, or title; filter by date ranges

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS (for styling)
- React Quill (rich text editor)
- Axios (API calls)
- React Router (navigation)

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS enabled

## Getting Started

Alright, here's how to get this running on your machine. It's pretty straightforward.

### Prerequisites

Make sure you have these installed:
- Node.js (v14 or higher)
- MongoDB (running locally or a MongoDB Atlas account)
- npm or yarn

### Installation

1. **Clone the repo**
```bash
git clone <your-repo-url>
cd notely
```

2. **Set up the Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (see the `.env.example` file):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notely
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=development
```

**Important:** 
- If you're using MongoDB Atlas, replace `MONGODB_URI` with your connection string
- Make sure to change `JWT_SECRET` to something secure (I used a random string generator)

3. **Set up the Frontend**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Run the App**

Open two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The app should now be running at `http://localhost:5173` (frontend) and the API at `http://localhost:5000` (backend).

## Environment Variables Explained

### Backend (.env)
- `PORT` - Port number for the Express server (default: 5000)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for signing JWT tokens (keep this secure!)
- `NODE_ENV` - Environment mode (development/production)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (change this if you deploy)

## How to Use

### Getting Started
1. **Create an Account**
   - Click "Register" and enter your name, email, and password
   - Your password must be at least 6 characters long
   - After registration, you'll be automatically logged in

2. **Dashboard Overview**
   - The dashboard shows your recent notes, drafts, and folders
   - Use the sidebar to navigate between different views
   - Toggle dark mode using the moon/sun icon in the sidebar

### Working with Notes

**Creating a Note:**
1. Click the "New Note" button in the sidebar or dashboard
2. Give your note a title (or leave it as "Untitled Note")
3. Start writing in the rich text editor
4. Your note auto-saves as a draft every 2 seconds

**Formatting Your Notes:**
- Use the toolbar to format text (bold, italic, underline, strikethrough)
- Add headers (H1, H2, H3) for structure
- Create ordered or unordered lists
- Add code blocks for snippets
- Insert images by clicking the image icon or pasting
- Change text and background colors
- Add links to external resources
- Use blockquotes for emphasis

**Saving and Publishing:**
- Notes are auto-saved as drafts while you work
- Click "Save" to publish your note (removes draft status)
- Published notes appear in "My Notes"
- Drafts can be accessed from the dashboard or "My Notes" view

**Managing Notes:**
- **Pin Notes** - Click the pin icon to keep important notes at the top
- **Search** - Use the search bar to find notes by title or content
- **Sort** - Sort by last updated, date created, or title
- **Filter** - Filter notes by today, this week, or this month
- **Delete** - Click the delete button to remove a note permanently

### Organizing with Folders

**Creating Folders:**
1. Go to "Folders" in the sidebar
2. Click "New Folder"
3. Enter a folder name and choose a color
4. Optionally, check "Make this a private folder" for PIN protection

**Using Folders:**
- Click on a folder to view its notes
- Add notes to folders using the "Add to Folder" button
- Remove notes from folders using the "Remove from Folder" button
- Delete folders (notes inside won't be deleted, just unorganized)

**Private Folders:**
- When creating a private folder, you'll set a 4-digit PIN on first access
- The PIN is required every time you want to open the folder
- Notes in private folders are hidden from the dashboard and "My Notes" view
- Perfect for sensitive information like passwords, personal thoughts, or confidential work

### Collaborating with Others

**Sharing Individual Notes:**
1. Open a note you want to share
2. Click the "Share" button in the note editor
3. Enter the collaborator's email address
4. Click "Add" to add multiple emails
5. Click "Share with X people" to send invitations

**Sharing Multiple Notes:**
1. Go to "My Notes" view
2. Click "Share Notes" button
3. Select the notes you want to share (checkboxes appear)
4. Add collaborator email addresses
5. Click "Share" to send access to all selected notes

**Managing Collaborators:**
- View all collaborators in the share modal
- Remove collaborators by clicking "Remove" next to their name
- See who made the last edit on shared notes
- Filter shared notes by "Shared with me" or "I shared"

**Working on Shared Notes:**
- Shared notes appear in your "Shared Notes" view
- You can edit shared notes just like your own
- Your name appears as "last edited by" when you make changes
- The original owner can remove your access anytime

### Profile & Settings

**Updating Profile:**
1. Click your profile icon in the sidebar
2. Go to "Profile" section
3. Update your name
4. Click "Update Profile"

**Changing Password:**
1. Go to Profile section
2. Enter your current password
3. Enter new password (min 6 characters)
4. Confirm new password
5. Click "Change Password"

**Deleting Account:**
- Available in Profile section
- Requires double confirmation
- Permanently deletes your account and all your notes
- Shared notes you created will be deleted for collaborators too

### Tips & Tricks

- **Keyboard Shortcuts**: Use standard text editing shortcuts (Ctrl+B for bold, Ctrl+I for italic, etc.)
- **Image Resizing**: Click on an image in the editor to resize it by dragging
- **Quick Search**: The search works in real-time as you type
- **Draft Recovery**: If you accidentally close a note, it's saved as a draft
- **Mobile Use**: The app is fully responsive - use it on your phone or tablet
- **Dark Mode**: Reduces eye strain during night-time use
- **Bulk Actions**: Use "Share Notes" to share multiple notes with the same people at once

## Project Structure

```
notely/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Context providers
│   │   ├── pages/       # Page components
│   │   └── services/    # API service functions
│   └── public/
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/drafts` - Get draft notes
- `GET /api/notes/search?q=query` - Search notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PUT /api/notes/:id/pin` - Toggle pin
- `POST /api/notes/:id/collaborators` - Add collaborator
- `DELETE /api/notes/:id/collaborators/:collaboratorId` - Remove collaborator

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder
- `POST /api/folders/:id/verify-pin` - Verify folder PIN

## Challenges I Faced

- **Auto-save Logic** - Getting the auto-save to work without conflicting with manual saves was tricky. Had to use refs and careful state management.
- **Collaborator Management** - Making sure the UI updates correctly when collaborators are added/removed took some debugging.
- **Dark Mode** - Ensuring every component looked good in both light and dark modes required going through each component carefully.
- **Image Handling in Editor** - Quill's image handling needed custom configuration to work smoothly.

## Things I'd Improve Given More Time

- Add real-time collaboration with WebSockets
- Implement note versioning/history
- Add export functionality (PDF, Markdown)
- Better mobile experience for the editor
- Add tags/labels for notes
- Implement note templates

## Development Notes

This project was built as a learning experience to understand full-stack development with the MERN stack. I used AI assistance (ChatGPT/Claude) during development for debugging, understanding certain concepts, and getting suggestions on best practices. However, all the core logic, architecture decisions, and implementation were done by me. I believe in using modern tools to learn and build better software.

## Testing

To test the collaboration features, you'll need to:
1. Register two different accounts (use different emails)
2. Create a note with one account
3. Share it with the second account's email
4. Login with the second account to see the shared note

## Deployment Notes

If you want to deploy this:
- Backend can go on Heroku, Railway, or Render
- Frontend works great on Vercel or Netlify
- Don't forget to update the `VITE_API_URL` in frontend .env
- Make sure to set all environment variables in your hosting platform

## Future Enhancements

Some features I'd like to add in the future:
- Real-time collaboration with WebSockets (see edits as they happen)
- Note versioning and history (undo/redo across sessions)
- Export notes to PDF, Markdown, or plain text
- Note templates for common use cases
- Tags and labels for better organization
- Kanban board view for task management
- Mobile apps (React Native)
- Offline support with sync

## Contributing

This is a personal project, but if you find bugs or have suggestions, feel free to open an issue or submit a pull request!

## License

This project is open source and available under the MIT License.

---

Built with ☕ and a lot of debugging. Happy note-taking!
