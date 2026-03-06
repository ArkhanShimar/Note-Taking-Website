import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';
import { noteService } from '../services/noteService';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('my-notes');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
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

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm">
          <div className="relative max-w-2xl">
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
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-lg font-bold text-slate-800">
                {activeView === 'my-notes' ? 'My Notes' : 'Shared Notes'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
            </div>
            <NotesList
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              activeView={activeView}
            />
          </div>

          <NoteEditor
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        </div>
      </div>
    </div>
  );
}
