import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';
import FolderGrid from '../components/FolderGrid';
import { noteService } from '../services/noteService';
import { folderService } from '../services/folderService';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showFolders, setShowFolders] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
    loadFolders();
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

  const loadFolders = async () => {
    try {
      const data = await folderService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const folderId = activeView.startsWith('folder-') ? activeView.replace('folder-', '') : null;
      const newNote = await noteService.createNote('Untitled Note', '', folderId);
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setShowFolders(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      const newFolder = await folderService.createFolder(name);
      setFolders([...folders, { ...newFolder, noteCount: 0 }]);
    } catch (error) {
      console.error('Failed to create folder:', error);
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
        setShowFolders(false);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadNotes();
      setShowFolders(true);
    }
  };

  const handleSelectFolder = (folderId) => {
    setActiveView(`folder-${folderId}`);
    setShowFolders(false);
  };

  const filterNotesByTime = (notes) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return notes.filter(note => {
      const noteDate = new Date(note.updatedAt);
      if (timeFilter === 'today') return noteDate >= today;
      if (timeFilter === 'week') return noteDate >= weekAgo;
      if (timeFilter === 'month') return noteDate >= monthAgo;
      return true;
    });
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    if (activeView === 'shared') {
      filtered = notes.filter(note => note.collaborators && note.collaborators.length > 0);
    } else if (activeView.startsWith('folder-')) {
      const folderId = activeView.replace('folder-', '');
      filtered = notes.filter(note => note.folder === folderId);
    }

    return filterNotesByTime(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const filteredNotes = getFilteredNotes();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        onCreateNote={handleCreateNote}
        activeView={activeView}
        setActiveView={setActiveView}
        folders={folders}
        onCreateFolder={handleCreateFolder}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              {activeView === 'shared' ? 'Shared Notes' : 
               activeView.startsWith('folder-') ? folders.find(f => f._id === activeView.replace('folder-', ''))?.name || 'Folder' :
               'My Notes'}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  timeFilter === 'today'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  timeFilter === 'week'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  timeFilter === 'month'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  timeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

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

        <div className="flex-1 overflow-y-auto">
          {showFolders && activeView === 'all' ? (
            <FolderGrid folders={folders} onSelectFolder={handleSelectFolder} />
          ) : (
            <div className="flex h-full">
              <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}</p>
                    <button
                      onClick={() => setShowFolders(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Folders
                    </button>
                  </div>
                </div>
                <NotesList
                  notes={filteredNotes}
                  selectedNote={selectedNote}
                  onSelectNote={(note) => {
                    setSelectedNote(note);
                    setShowFolders(false);
                  }}
                  activeView={activeView}
                />
              </div>

              <NoteEditor
                note={selectedNote}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                folders={folders}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
