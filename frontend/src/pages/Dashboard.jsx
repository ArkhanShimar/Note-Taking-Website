import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';
import { noteService } from '../services/noteService';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [sortBy, setSortBy] = useState('updated');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await noteService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await noteService.createNote('Untitled Note', '');
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = (updatedNote) => {
    setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
    setSelectedNote(updatedNote);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter(n => n._id !== noteId));
    setSelectedNote(null);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const results = await noteService.searchNotes(query);
        setNotes(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadNotes();
    }
  };

  const handleBackToView = () => {
    setSelectedNote(null);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    } else if (sortBy === 'created') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'title') {
      return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If a note is selected, show the editor
  if (selectedNote) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setSelectedNote(null);
          }}
          onCreateNote={handleCreateNote}
        />
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <button
              onClick={handleBackToView}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <NoteEditor
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        </div>
      </div>
    );
  }

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardHome
            notes={sortedNotes}
            onSelectNote={setSelectedNote}
            onCreateNote={handleCreateNote}
          />
        );

      case 'all-notes':
      case 'shared':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {activeView === 'all-notes' ? 'All Notes' : 'Shared with me'}
                </h1>
                <p className="text-gray-600">{sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}</p>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-2xl">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search notes..."
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
                  <button
                    onClick={() => setSortBy('updated')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      sortBy === 'updated'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setSortBy('created')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      sortBy === 'created'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Created
                  </button>
                  <button
                    onClick={() => setSortBy('title')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      sortBy === 'title'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Title
                  </button>
                </div>
              </div>

              <NotesGrid
                notes={sortedNotes}
                onSelectNote={setSelectedNote}
                activeView={activeView}
              />
            </div>
          </div>
        );

      case 'folders':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Folders</h1>
                <p className="text-gray-600">Organize your notes into folders</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Folders coming soon</h3>
                <p className="text-gray-600">This feature is under development</p>
              </div>
            </div>
          </div>
        );

      case 'contacts':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Contacts</h1>
                <p className="text-gray-600">Manage your collaborators</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contacts coming soon</h3>
                <p className="text-gray-600">This feature is under development</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                <p className="text-gray-600">Manage your account settings</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile settings coming soon</h3>
                <p className="text-gray-600">This feature is under development</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onCreateNote={handleCreateNote}
      />
      {renderContent()}
    </div>
  );
}
