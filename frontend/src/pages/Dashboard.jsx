import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';
import Toast from '../components/Toast';
import { noteService } from '../services/noteService';
import { folderService } from '../services/folderService';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [sortBy, setSortBy] = useState('updated');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('indigo');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [showShareNotesModal, setShowShareNotesModal] = useState(false);
  const [selectedNotesForSharing, setSelectedNotesForSharing] = useState([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');

  useEffect(() => {
    loadNotes();
    loadDrafts();
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

  const loadDrafts = async () => {
    try {
      const data = await noteService.getDrafts();
      setDrafts(data);
    } catch (error) {
      console.error('Failed to load drafts:', error);
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
      setToast({ message: 'Folder created successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to create folder:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create folder. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await folderService.deleteFolder(folderId);
      setFolders(folders.filter(f => f._id !== folderId));
      setToast({ message: 'Folder deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to delete folder:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete folder. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleAddNoteToFolder = async (noteId, folderId) => {
    try {
      const updated = await noteService.updateNote(noteId, undefined, undefined, folderId);
      setNotes(notes.map(n => n._id === noteId ? updated : n));
      setShowAddToFolderModal(false);
      setToast({ message: 'Note added to folder successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to add note to folder:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add note to folder. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleRemoveNoteFromFolder = async (noteId) => {
    try {
      const updated = await noteService.updateNote(noteId, undefined, undefined, null);
      setNotes(notes.map(n => n._id === noteId ? updated : n));
      setToast({ message: 'Note removed from folder!', type: 'success' });
    } catch (error) {
      console.error('Failed to remove note from folder:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove note from folder. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await noteService.createNote('Untitled Note', '');
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setToast({ message: 'Note created successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to create note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create note. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleShareNotes = async (e) => {
    e.preventDefault();
    setShareError('');
    
    if (!shareEmail.trim() || selectedNotesForSharing.length === 0) {
      setShareError('Please select notes and enter an email address');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let userNotFoundError = false;
    let lastError = '';

    for (const noteId of selectedNotesForSharing) {
      try {
        const updated = await noteService.addCollaborator(noteId, shareEmail);
        setNotes(notes.map(n => n._id === noteId ? updated : n));
        successCount++;
      } catch (error) {
        console.error(`Failed to share note ${noteId}:`, error);
        failCount++;
        lastError = error.response?.data?.message || 'Failed to share note';
        
        // Check if it's a user not found error
        if (lastError.toLowerCase().includes('user not found') || 
            lastError.toLowerCase().includes('not found') ||
            lastError.toLowerCase().includes('does not exist')) {
          userNotFoundError = true;
        }
      }
    }

    // If user not found, keep modal open and show error
    if (userNotFoundError && successCount === 0) {
      setShareError('User not found. Please check the email address and try again.');
      return;
    }

    // If there were other errors but some succeeded
    if (failCount > 0 && successCount > 0) {
      setShareError(`Shared ${successCount} notes successfully, but ${failCount} failed. ${lastError}`);
      return;
    }

    // If all failed with non-user-not-found errors
    if (failCount > 0 && successCount === 0 && !userNotFoundError) {
      setShareError(lastError || 'Failed to share notes. Please try again.');
      return;
    }

    // Success - close modal and show toast
    setShowShareNotesModal(false);
    setSelectedNotesForSharing([]);
    setShareEmail('');
    setShareError('');
    setToast({ message: `Successfully shared ${successCount} ${successCount === 1 ? 'note' : 'notes'}!`, type: 'success' });
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotesForSharing(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleUpdateNote = (updatedNote) => {
    if (updatedNote.isDraft) {
      // Update in drafts
      setDrafts(drafts.map(n => n._id === updatedNote._id ? updatedNote : n));
      // Remove from notes if it was there
      setNotes(notes.filter(n => n._id !== updatedNote._id));
    } else {
      // Update in notes
      setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
      // Add to notes if it was a draft
      if (!notes.find(n => n._id === updatedNote._id)) {
        setNotes([updatedNote, ...notes]);
      }
      // Remove from drafts
      setDrafts(drafts.filter(n => n._id !== updatedNote._id));
    }
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

  // Filter notes by date
  const filterNotesByDate = (notesToFilter) => {
    if (dateFilter === 'all') return notesToFilter;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return notesToFilter.filter(note => {
      const noteDate = new Date(note.updatedAt);
      
      if (dateFilter === 'today') {
        return noteDate >= today;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return noteDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return noteDate >= monthAgo;
      }
      
      return true;
    });
  };

  const filteredNotes = filterNotesByDate(sortedNotes);

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
            setShowDrafts(false); // Reset drafts view when changing views
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
            folders={folders}
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
            notes={filteredNotes}
            onSelectNote={setSelectedNote}
            onCreateNote={handleCreateNote}
          />
        );

      case 'all-notes':
      case 'shared':
        const displayNotes = showDrafts 
          ? drafts
          : activeView === 'shared' 
            ? filteredNotes.filter(note => note.collaborators && note.collaborators.length > 0)
            : filteredNotes;

        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6">
              {/* Header Section */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {showDrafts ? 'Drafts' : activeView === 'all-notes' ? 'My Notes' : 'Shared Notes'}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {showDrafts 
                        ? 'Notes that are being edited and not yet saved'
                        : activeView === 'all-notes' 
                          ? 'Capture ideas, organize them, and share when needed.' 
                          : 'Notes shared with you by collaborators'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeView === 'all-notes' && (
                      <button
                        onClick={() => setShowDrafts(!showDrafts)}
                        className={`font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm ${
                          showDrafts
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {showDrafts ? `All Notes (${notes.length})` : `Drafts (${drafts.length})`}
                      </button>
                    )}
                    {activeView === 'shared' && (
                    <button
                      onClick={() => setShowShareNotesModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Notes
                    </button>
                  )}
                </div>
              </div>

                {/* Search and Filters - Hide when showing drafts */}
                {!showDrafts && (
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
                      placeholder="Search notes by title or content..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-gray-50 hover:bg-white transition"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setDateFilter('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                        dateFilter === 'all'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setDateFilter('today')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                        dateFilter === 'today'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDateFilter('week')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                        dateFilter === 'week'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => setDateFilter('month')}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                        dateFilter === 'month'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      This Month
                    </button>
                  </div>
                </div>
                )}
              </div>

              {displayNotes.length === 0 && activeView === 'shared' ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No shared notes yet</h3>
                  <p className="text-sm text-gray-600 mb-4">Start collaborating by sharing your notes with others</p>
                  <button
                    onClick={() => setShowShareNotesModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition inline-flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Your First Note
                  </button>
                </div>
              ) : (
                <NotesGrid
                  notes={displayNotes}
                  onSelectNote={setSelectedNote}
                />
              )}
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

        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6">
              {/* Header Section */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Folders</h1>
                    <p className="text-sm text-gray-500">Organize your notes into folders for better management</p>
                  </div>
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Folder
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">

                {folders.map((folder) => {
                  const folderNotes = notes.filter(n => n.folder === folder._id);
                  return (
                    <div
                      key={folder._id}
                      onClick={() => {
                        setSelectedFolder(folder);
                        setActiveView('folder-view');
                      }}
                      className={`bg-gradient-to-br ${getColorClasses(folder.color)} rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg flex flex-col items-center justify-center text-center group relative`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder._id);
                        }}
                        className="absolute top-2 right-2 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-white mb-0.5 truncate w-full">{folder.name}</p>
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
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                        >
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                      <div className="flex items-center gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewFolderColor(color.value)}
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${color.from} ${color.to} transition-all ${
                              newFolderColor === color.value 
                                ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' 
                                : 'hover:scale-110'
                            }`}
                            title={color.name}
                          />
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

      case 'folder-view':
        if (!selectedFolder) {
          setActiveView('folders');
          return null;
        }

        const folderNotes = notes.filter(n => n.folder === selectedFolder._id);
        const availableNotes = notes.filter(n => !n.folder);

        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-6">
              {/* Header Section */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedFolder(null);
                        setActiveView('folders');
                      }}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <div className={`w-14 h-14 bg-gradient-to-br ${getColorClasses(selectedFolder.color)} rounded-2xl flex items-center justify-center`}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{selectedFolder.name}</h1>
                      <p className="text-sm text-gray-500">{folderNotes.length} {folderNotes.length === 1 ? 'note' : 'notes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddToFolderModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Note
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${selectedFolder.name}" folder? Notes inside will not be deleted.`)) {
                          handleDeleteFolder(selectedFolder._id);
                          setSelectedFolder(null);
                          setActiveView('folders');
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Folder
                    </button>
                  </div>
                </div>
              </div>

              {folderNotes.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No notes in this folder</h3>
                  <p className="text-sm text-gray-600 mb-3">Add notes to organize them in this folder</p>
                  <button
                    onClick={() => setShowAddToFolderModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition text-sm"
                  >
                    Add Note
                  </button>
                </div>
              ) : (
                <NotesGrid
                  notes={folderNotes}
                  onSelectNote={setSelectedNote}
                  onRemoveFromFolder={handleRemoveNoteFromFolder}
                  showRemoveButton={true}
                />
              )}
            </div>

            {showAddToFolderModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Add Note to {selectedFolder.name}</h3>
                    <button
                      onClick={() => setShowAddToFolderModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {availableNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No notes available to add. All notes are already in folders.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableNotes.map((note) => (
                        <div
                          key={note._id}
                          onClick={() => handleAddNoteToFolder(note._id, selectedFolder._id)}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition"
                        >
                          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{note.title || 'Untitled'}</p>
                            <p className="text-sm text-gray-500">{new Date(note.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'contacts':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
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
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
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
        setActiveView={(view) => {
          setActiveView(view);
          setShowDrafts(false); // Reset drafts view when changing views
        }}
        onCreateNote={handleCreateNote}
      />
      {renderContent()}

      {/* Share Notes Modal */}
      {showShareNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Share Notes</h3>
              <button
                onClick={() => {
                  setShowShareNotesModal(false);
                  setSelectedNotesForSharing([]);
                  setShareEmail('');
                  setShareError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {shareError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{shareError}</p>
              </div>
            )}

            <form onSubmit={handleShareNotes}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Share with (email address)
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => {
                    setShareEmail(e.target.value);
                    setShareError(''); // Clear error when user types
                  }}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select notes to share ({selectedNotesForSharing.length} selected)
                  </label>
                  {filteredNotes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedNotesForSharing.length === filteredNotes.length) {
                          setSelectedNotesForSharing([]);
                        } else {
                          setSelectedNotesForSharing(filteredNotes.map(n => n._id));
                        }
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {selectedNotesForSharing.length === filteredNotes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No notes available to share. Create a note first.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                    <div className="divide-y divide-gray-200">
                      {filteredNotes.map((note) => (
                        <div
                          key={note._id}
                          onClick={() => toggleNoteSelection(note._id)}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition ${
                            selectedNotesForSharing.includes(note._id)
                              ? 'bg-indigo-50 border-l-4 border-indigo-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                            selectedNotesForSharing.includes(note._id)
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedNotesForSharing.includes(note._id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{note.title || 'Untitled'}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                              {note.collaborators && note.collaborators.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {note.collaborators.length} shared
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareNotesModal(false);
                    setSelectedNotesForSharing([]);
                    setShareEmail('');
                    setShareError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedNotesForSharing.length === 0}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share {selectedNotesForSharing.length > 0 && `(${selectedNotesForSharing.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
