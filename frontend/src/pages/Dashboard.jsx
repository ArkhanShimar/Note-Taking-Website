import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';
import Toast from '../components/Toast';
import { noteService } from '../services/noteService';
import { folderService } from '../services/folderService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
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
  
  // Profile form states
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 12;
  
  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    loadNotes();
    loadDrafts();
    loadFolders();
    if (user?.name) {
      setProfileName(user.name);
    }
  }, [user]);

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setToast({ message: 'Please enter your name', type: 'error' });
      return;
    }

    setUpdatingProfile(true);
    try {
      const response = await authService.updateProfile(profileName);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      // Update user context if needed
      window.location.reload(); // Reload to update user data
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: 'Please fill in all password fields', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'New password must be at least 6 characters', type: 'error' });
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your notes and folders will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your last chance. Are you absolutely sure you want to delete your account?'
    );

    if (!doubleConfirm) return;

    try {
      await authService.deleteAccount();
      setToast({ message: 'Account deleted successfully', type: 'success' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      console.error('Failed to delete account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete account. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
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

  // Pagination logic
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, searchQuery, showDrafts, activeView]);

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
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeView={activeView}
            setActiveView={(view) => {
              setActiveView(view);
              setSelectedNote(null);
              setShowDrafts(false); // Reset drafts view when changing views
            }}
            onCreateNote={handleCreateNote}
          />
        </div>
        
        {/* Mobile Header for Editor */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={handleBackToView}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col pt-14 md:pt-0">
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
            ? filteredNotes.filter(note => {
                // Show notes where current user is a collaborator (shared WITH them)
                // OR notes they own that have collaborators (shared BY them)
                const isCollaborator = note.collaborators && note.collaborators.some(collab => collab._id === user?.id || collab === user?.id);
                const isOwnerWithCollaborators = note.owner._id === user?.id && note.collaborators && note.collaborators.length > 0;
                return isCollaborator || isOwnerWithCollaborators;
              })
            : filteredNotes;

        // Paginate display notes
        const paginatedDisplayNotes = displayNotes.slice(
          (currentPage - 1) * notesPerPage,
          currentPage * notesPerPage
        );
        const displayTotalPages = Math.ceil(displayNotes.length / notesPerPage);

        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-md border-2 border-indigo-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      {showDrafts ? 'Drafts' : activeView === 'all-notes' ? 'My Notes' : 'Shared Notes'}
                    </h1>
                    <p className="text-sm text-gray-600">
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
                        className={`font-medium py-2 px-4 rounded-xl transition flex items-center gap-2 text-sm shadow-sm ${
                          showDrafts
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                <>
                  <NotesGrid
                    notes={paginatedDisplayNotes}
                    onSelectNote={setSelectedNote}
                  />
                  
                  {/* Pagination */}
                  {displayTotalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                      <div className="text-sm text-gray-600 text-center sm:text-left">
                        Showing {((currentPage - 1) * notesPerPage) + 1} to {Math.min(currentPage * notesPerPage, displayNotes.length)} of {displayNotes.length} notes
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(displayTotalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                              pageNumber === 1 ||
                              pageNumber === displayTotalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                                    currentPage === pageNumber
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return <span key={pageNumber} className="text-gray-400">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, displayTotalPages))}
                          disabled={currentPage === displayTotalPages}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
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
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Create New Folder</h3>
                  <form onSubmit={handleCreateFolder}>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Folder Name</label>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="e.g., Work, Personal, Projects"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Color</label>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewFolderColor(color.value)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${color.from} ${color.to} transition-all ${
                              newFolderColor === color.value 
                                ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' 
                                : 'hover:scale-110'
                            }`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateFolderModal(false);
                          setNewFolderName('');
                          setNewFolderColor('indigo');
                        }}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm"
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
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-8 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add Note to {selectedFolder.name}</h3>
                    <button
                      onClick={() => setShowAddToFolderModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {availableNotes.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <p className="text-sm">No notes available to add. All notes are already in folders.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {availableNotes.map((note) => (
                        <div
                          key={note._id}
                          onClick={() => handleAddNoteToFolder(note._id, selectedFolder._id)}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{note.title || 'Untitled'}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{new Date(note.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      case 'contact':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
            <div className="max-w-6xl mx-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Contact Us</h1>
                <p className="text-sm text-gray-600">Get in touch with our team. We're here to help!</p>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Phone */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Phone</h3>
                  <p className="text-gray-600 text-xs mb-2">Call us during business hours</p>
                  <a href="tel:+94112345678" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                    +94 11 234 5678
                  </a>
                  <p className="text-gray-500 text-xs mt-1">Mon-Fri, 9:00 AM - 6:00 PM</p>
                </div>

                {/* Email */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600 text-xs mb-2">Send us an email anytime</p>
                  <a href="mailto:support@notesapp.lk" className="text-green-600 hover:text-green-700 font-semibold text-sm">
                    support@notesapp.lk
                  </a>
                  <p className="text-gray-500 text-xs mt-1">We'll respond within 24 hours</p>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Office</h3>
                  <p className="text-gray-600 text-xs mb-2">Visit us at our location</p>
                  <p className="text-orange-600 font-semibold text-sm">
                    123 Galle Road, Colombo 03
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Sri Lanka</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help you?"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                    <textarea
                      rows="4"
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md text-sm"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
            <div className="max-w-4xl mx-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile Settings</h1>
                <p className="text-sm text-gray-600">Manage your account information and preferences</p>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <button 
                        type="submit"
                        disabled={updatingProfile}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingProfile ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={changingPassword}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Account Statistics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account Statistics</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600">{notes.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Total Notes</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {notes.filter(n => n.collaborators && n.collaborators.length > 0).length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Shared Notes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{folders.length}</div>
                    <div className="text-xs text-gray-600 mt-1">Folders</div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
                <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md text-sm"
                >
                  Delete Account
                </button>
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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">NotesHub</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNote}
              className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-7 h-7 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg flex items-center justify-center transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Navigation Menu */}
            <div className="p-3">
              <div className="space-y-1 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Navigation</p>
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm ${
                    activeView === 'dashboard'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveView('all-notes');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm ${
                    activeView === 'all-notes'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  All Notes
                </button>
                <button
                  onClick={() => {
                    setActiveView('shared');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm ${
                    activeView === 'shared'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Shared Notes
                </button>
                <button
                  onClick={() => {
                    setActiveView('folders');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm ${
                    activeView === 'folders'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Folders
                </button>
              </div>

              {/* Account Section */}
              <div className="border-t border-gray-200/50 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Account</p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-100/80"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('contact');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-100/80"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </button>
                  <button
                    onClick={() => {
                      authService.logout();
                      window.location.href = '/login';
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-2.5 text-sm text-red-600 hover:bg-red-50/80 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setShowDrafts(false);
          }}
          onCreateNote={handleCreateNote}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-14 md:pt-0">
        {renderContent()}
      </div>

      {/* Share Notes Modal */}
      {showShareNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Share Notes</h3>
              <button
                onClick={() => {
                  setShowShareNotesModal(false);
                  setSelectedNotesForSharing([]);
                  setShareEmail('');
                  setShareError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {shareError && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2 sm:gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{shareError}</p>
              </div>
            )}

            <form onSubmit={handleShareNotes}>
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select notes ({selectedNotesForSharing.length})
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
                      className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {selectedNotesForSharing.length === filteredNotes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No notes available to share. Create a note first.</p>
                  </div>
                ) : (
                  <div className="max-h-64 sm:max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                    <div className="divide-y divide-gray-200">
                      {filteredNotes.map((note) => (
                        <div
                          key={note._id}
                          onClick={() => toggleNoteSelection(note._id)}
                          className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 cursor-pointer transition ${
                            selectedNotesForSharing.includes(note._id)
                              ? 'bg-indigo-50 border-l-4 border-indigo-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                            selectedNotesForSharing.includes(note._id)
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedNotesForSharing.includes(note._id) && (
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{note.title || 'Untitled'}</p>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
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

              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareNotesModal(false);
                    setSelectedNotesForSharing([]);
                    setShareEmail('');
                    setShareError('');
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedNotesForSharing.length === 0}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
