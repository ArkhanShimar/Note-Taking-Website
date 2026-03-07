# Notely

**Organize your thoughts, beautifully** ✨

A modern, full-stack MERN application for collaborative note-taking with rich text editing, beautiful design, and powerful organization features.

## 🌟 Features

- **Beautiful Design** - Modern UI with indigo/blue theme and smooth animations
- **Rich Text Editor** - Full-featured editor with formatting, images, links, and more
- **Smart Organization** - Organize notes with folders and tags
- **Private Folder** - PIN-protected folder for sensitive notes
- **Collaboration** - Share notes with team members and collaborate in real-time
- **Search & Filter** - Powerful search with date filters and content search
- **Auto-save** - Never lose your work with automatic draft saving
- **Mobile Responsive** - Works beautifully on all devices

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Quill, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT with bcrypt
- **Rich Text**: React Quill with custom styling

## 🚀 Getting Started

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

Open your browser and visit `http://localhost:5173` to use Notely!

## 📱 Key Features

### Note Management
- Create, edit, and delete notes with rich text formatting
- Auto-save drafts every 2 seconds
- Manual save to publish notes
- Full-text search across titles and content
- Date-based filtering (Today, This Week, This Month)

### Organization
- Create custom folders with color coding
- Private folder with 4-digit PIN protection
- Move notes between folders
- Remove notes from folders

### Collaboration
- Share notes with multiple collaborators via email
- Track who created and last edited each note
- Separate views for "My Notes" and "Shared Notes"
- Filter shared notes (All, Shared with me, I shared)

### Rich Text Editor
- Headers, bold, italic, underline, strikethrough
- Text and background colors
- Ordered and unordered lists
- Indentation controls
- Blockquotes and code blocks
- Links and images (with resize capability)
- Clean formatting option

### User Experience
- Modern dashboard with statistics cards
- Recent notes preview
- Mobile-responsive design with hamburger menu
- Toast notifications for all actions
- Custom confirmation modals
- Smooth animations and transitions

## 🎨 Design Philosophy

Notely follows a clean, modern design philosophy with:
- Indigo/purple gradient color scheme
- Rounded corners (rounded-xl) throughout
- Consistent spacing and typography
- Glass-morphism effects for special elements
- Smooth hover and transition effects
- Accessibility-focused design

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ using the MERN stack