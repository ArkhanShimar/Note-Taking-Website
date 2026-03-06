import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';
import { noteService } from '../services/noteService';
import { folderService } from '../services/folderService';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [sortBy, setSortBy] = useState('updated');
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('indigo');

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

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const folder = await folderService.createFolder(newFolderName, newFolderColor);
      setFolders([...folders, folder]);
      setNewFolderName('');
      setNewFolderColor('indigo');
      setShowCreateFolderModal(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Delete this folder? Notes inside will not be deleted.')) return;

    try {
      await folderService.deleteFolder(folderId);
      setFolders(folders.filter(f => f._id !== folderId));
    } catch (error) {
      console.error('Failed to delete folder:', error);
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
        const displayNotes = activeView === 'shared' 
          ? sortedNotes.filter(note => note.collaborators && note.collaborators.length > 0)
          : sortedNotes;

        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {activeView === 'all-notes' ? 'All Notes' : 'Shared Notes'}
                </h1>
                <p className="text-gray-600">{displayNotes.length} {displayNotes.length === 1 ? 'note' : 'notes'}</p>
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
                notes={displayNotes}
                onSelectNote={setSelectedNote}
              />
            </div>
          </div>
        );

      case 'folders':
        const colorOptions = [
          { name: 'Indigo', value: 'indigo', from: 'from-indigo-500', to: 'to-purple-600' },
          { name: 'Green', value: 'green', from: 'from-green-500', to: 'to-emerald-600' },
          { name: 'Orange', value: 'orange', from: 'from-orange-500', to: 'to-red-600' },
          { name: 'Blue', value: 'blue', from: 'from-blue-500', to: 'to-cyan-600' },
          { name: 'Pink', value: 'pink', from: 'from-pink-500', to: 'to-rose-600' },
          { name: 'Yellow', value: 'yellow', from: 'from-yellow-500', to: 'to-orange-600' },
        ];

        const getColorClasses = (color) => {
          const colorMap = {
            indigo: 'from-indigo-500 to-purple-600',
            green: 'from-green-500 to-emerald-600',
            orange: 'from-orange-500 to-red-600',
            blue: 'from-blue-500 to-cyan-600',
            pink: 'from-pink-500 to-rose-600',
            yellow: 'from-yellow-500 to-orange-600',
          };
          return colorMap[color] || colorMap.indigo;
        };

        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Folders</h1>
                <p className="text-gray-600">Organize your notes into folders</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 p-8 cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-center text-center group"
                >
                  <div className="w-14 h-14 bg-gray-100 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center mb-3 transition">
                    <svg className="w-7 h-7 text-gray-400 group-hover:text-indigo-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">New Folder</p>
                </button>

                {folders.map((folder) => {
                  const folderNotes = notes.filter(n => n.folder === folder._id);
                  return (
                    <div
                      key={folder._id}
                      className={`bg-gradient-to-br ${getColorClasses(folder.color)} rounded-xl p-8 cursor-pointer transition-all hover:shadow-xl flex flex-col items-center justify-center text-center group relative`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder._id);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-white mb-1 truncate w-full">{folder.name}</p>
                      <p className="text-xs text-white/80">{folderNotes.length} notes</p>
                    </div>
                  );
                })}
              </div>

              {folders.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">All Notes</h2>
                  <div className="space-y-3">
                    {notes.slice(0, 10).map((note) => {
                      const noteFolder = folders.find(f => f._id === note.folder);
                      return (
                        <div
                          key={note._id}
                          onClick={() => setSelectedNote(note)}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                        >
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{note.title || 'Untitled'}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {noteFolder && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                  {noteFolder.name}
                                </span>
                              )}
                              <span>•</span>
                              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {showCreateFolderModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Folder</h3>
                  <form onSubmit={handleCreateFolder}>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Folder Name</label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="e.g., Work, Personal, Projects"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Color</label>
                      <div className="grid grid-cols-3 gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewFolderColor(color.value)}
                            className={`p-4 rounded-xl bg-gradient-to-br ${color.from} ${color.to} text-white font-semibold transition ${
                              newFolderColor === color.value ? 'ring-4 ring-offset-2 ring-indigo-500' : 'hover:scale-105'
                            }`}
                          >
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateFolderModal(false);
                          setNewFolderName('');
                          setNewFolderColor('indigo');
                        }}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
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
