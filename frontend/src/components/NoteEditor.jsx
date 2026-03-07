import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { noteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

export default function NoteEditor({ note, onUpdate, onDelete, folders, onBackToNotes }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorEmails, setCollaboratorEmails] = useState([]);
  const [shareError, setShareError] = useState('');
  const [toast, setToast] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // Track if note was manually saved
  const { user } = useAuth();
  const quillRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Image handler for React Quill
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setToast({ message: 'Image size should be less than 2MB', type: 'error' });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', e.target.result);
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [imageHandler]);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setIsSaved(false); // Reset saved state when switching notes
    }
  }, [note?._id]); // Only reset when note ID changes, not when isDraft changes

  // Auto-save as draft when content changes
  useEffect(() => {
    if (!note) return;
    if (saving) return; // Don't auto-save while manually saving
    if (isSaved) return; // Don't auto-save after manual save

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (2 seconds after user stops typing)
    autoSaveTimerRef.current = setTimeout(async () => {
      // Double-check saving state before auto-saving
      if (saving || isSaved) {
        console.log('Auto-save cancelled: manual save completed or in progress');
        return;
      }
      
      if ((title || content) && !saving) {
        setAutoSaving(true);
        try {
          console.log('Auto-saving as draft');
          const updated = await noteService.updateNote(note._id, title, content, note.folder, true); // Save as draft
          onUpdate(updated);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 2000);

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, note?._id, saving, isSaved, onUpdate]); // Only trigger on title/content changes, not note object changes

  const handleSave = async () => {
    if (!note) return;

    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaving(true);
    try {
      console.log('Saving note with isDraft=false');
      const updated = await noteService.updateNote(note._id, title, content, note.folder, false); // Save as published
      console.log('Note saved, isDraft:', updated.isDraft);
      onUpdate(updated);
      setIsSaved(true); // Mark as saved to prevent auto-save
      setToast({ message: 'Note saved successfully!', type: 'success' });
      
      // Navigate back to My Notes after a short delay
      setTimeout(() => {
        if (onBackToNotes) {
          onBackToNotes();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to save note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save note. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveToFolder = async (folderId) => {
    if (!note) return;

    try {
      const updated = await noteService.updateNote(note._id, title, content, folderId);
      onUpdate(updated);
      setShowFolderMenu(false);
      setToast({ message: 'Note moved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to move note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to move note. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    try {
      await noteService.deleteNote(note._id);
      onDelete(note._id);
      setToast({ message: 'Note deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to delete note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete note. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    const email = collaboratorEmail.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setShareError('Please enter a valid email address');
      return;
    }

    // Check if user is trying to share with themselves
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      setShareError('You cannot share notes with yourself');
      return;
    }

    // Check for duplicates
    if (collaboratorEmails.includes(email)) {
      setShareError('This email has already been added');
      return;
    }

    // Check if already a collaborator
    if (note.collaborators && note.collaborators.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      setShareError('This user is already a collaborator');
      return;
    }

    setCollaboratorEmails([...collaboratorEmails, email]);
    setCollaboratorEmail('');
    setShareError('');
  };

  const handleRemoveCollaboratorEmail = (emailToRemove) => {
    setCollaboratorEmails(collaboratorEmails.filter(email => email !== emailToRemove));
  };

  const handleShareWithAll = async () => {
    if (collaboratorEmails.length === 0) {
      setShareError('Please add at least one email address');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let userNotFoundEmails = [];
    let lastError = '';

    for (const email of collaboratorEmails) {
      try {
        const updated = await noteService.addCollaborator(note._id, email);
        onUpdate(updated);
        successCount++;
      } catch (error) {
        console.error(`Failed to share with ${email}:`, error);
        failCount++;
        lastError = error.response?.data?.message || 'Failed to share note';
        
        if (lastError.toLowerCase().includes('user not found') || 
            lastError.toLowerCase().includes('not found') ||
            lastError.toLowerCase().includes('does not exist')) {
          userNotFoundEmails.push(email);
        }
      }
    }

    // Handle errors
    if (userNotFoundEmails.length === collaboratorEmails.length && successCount === 0) {
      setShareError(`User(s) not found: ${userNotFoundEmails.join(', ')}`);
      return;
    }

    if (userNotFoundEmails.length > 0) {
      setShareError(`Some users not found: ${userNotFoundEmails.join(', ')}. Others added successfully.`);
    }

    // Success
    if (successCount > 0) {
      setCollaboratorEmails([]);
      setCollaboratorEmail('');
      setShareError('');
      setToast({ 
        message: `Successfully shared with ${successCount} ${successCount === 1 ? 'person' : 'people'}!`, 
        type: 'success' 
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const updated = await noteService.removeCollaborator(note._id, collaboratorId);
      onUpdate(updated);
      setToast({ message: 'Collaborator removed successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove collaborator. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const isOwner = note && user && note.owner._id === user.id;

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No note selected</h3>
          <p className="text-slate-500">Select a note from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm whitespace-nowrap"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Saving...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </span>
              )}
            </button>
            <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
              {autoSaving ? (
                <span className="flex items-center gap-2 text-amber-600">
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Auto-saving...</span>
                  <span className="sm:hidden">Saving...</span>
                </span>
              ) : note.isDraft ? (
                <span className="text-amber-600">Draft</span>
              ) : (
                <span className="flex flex-col gap-0.5">
                  <span className="hidden sm:inline">Saved</span>
                  {!note.isDraft && (
                    <div className="flex flex-col gap-0.5 text-xs">
                      {note.owner && (
                        <span className="text-gray-600">
                          by {note.owner.name}
                        </span>
                      )}
                      {note.lastEditedBy && note.lastEditedBy._id !== note.owner?._id && (
                        <span className="text-indigo-600">
                          edited by {note.lastEditedBy.name}
                        </span>
                      )}
                    </div>
                  )}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="relative">
              <button
                onClick={() => setShowFolderMenu(!showFolderMenu)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="hidden sm:inline">Move to Folder</span>
                <span className="sm:hidden">Folder</span>
              </button>
              {showFolderMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-slate-200 py-2 min-w-[200px] z-10">
                  <button
                    onClick={() => handleMoveToFolder(null)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    No Folder
                  </button>
                  {folders && folders.map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => handleMoveToFolder(folder._id)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {folder.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-2xl sm:text-4xl font-bold text-slate-800 bg-transparent border-none outline-none mb-4 sm:mb-8 placeholder-slate-300 focus:placeholder-slate-400"
          />

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-6">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Start writing your note..."
              className="min-h-[300px] sm:min-h-[500px]"
            />
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Share Note</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isOwner && (
              <>
                {shareError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{shareError}</p>
                  </div>
                )}
                
                <form onSubmit={handleAddCollaborator} className="mb-6 sm:mb-8">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                    Add collaborators by email
                  </label>
                  
                  {/* Email Tags Display */}
                  {collaboratorEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      {collaboratorEmails.map((email, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaboratorEmail(email)}
                            className="hover:bg-indigo-200 rounded-full p-0.5 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="email"
                      value={collaboratorEmail}
                      onChange={(e) => {
                        setCollaboratorEmail(e.target.value);
                        setShareError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCollaborator(e);
                        }
                      }}
                      placeholder="colleague@example.com"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm hover:shadow-md text-sm whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Press Enter or click Add to add multiple email addresses</p>
                </form>
                
                {collaboratorEmails.length > 0 && (
                  <button
                    onClick={handleShareWithAll}
                    className="w-full mb-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-sm hover:shadow-md text-sm"
                  >
                    Share with {collaboratorEmails.length} {collaboratorEmails.length === 1 ? 'person' : 'people'}
                  </button>
                )}
              </>
            )}

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 sm:mb-4">People with access</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {note.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{note.owner.name}</p>
                      <p className="text-xs text-slate-600 truncate">{note.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0 ml-2">Owner</span>
                </div>

                {note.collaborators && note.collaborators.map((collab) => (
                  <div key={collab._id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-400 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                        {collab.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{collab.name}</p>
                        <p className="text-xs text-slate-600 truncate">{collab.email}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab._id)}
                        className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium flex-shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {(!note.collaborators || note.collaborators.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No collaborators yet</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 sm:mt-6 px-4 py-2 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
