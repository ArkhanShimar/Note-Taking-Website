import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';
import { noteService } from '../services/noteService';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all-notes');
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

  const handleBackToGrid = () => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (selectedNote) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-50">
        <Sidebar
          onCreateNote={handleCreateNote}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <button
              onClick={handleBackToGrid}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Notes
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-50">
      <Sidebar
        onCreateNote={handleCreateNote}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {activeView === 'all-notes' ? 'All Notes' : 'Shared Notes'}
              </h1>
              <p className="text-slate-500 mt-1">{sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search notes..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setSortBy('updated')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  sortBy === 'updated'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Last Updated
              </button>
              <button
                onClick={() => setSortBy('created')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  sortBy === 'created'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Date Created
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  sortBy === 'title'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Title
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notes
            </h2>
            <NotesGrid
              notes={sortedNotes}
              onSelectNote={setSelectedNote}
              activeView={activeView}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Folders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 p-6 cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-center text-center group">
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-50 rounded-xl flex items-center justify-center mb-3 transition">
                  <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-800">New Folder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
