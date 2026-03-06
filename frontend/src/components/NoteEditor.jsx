import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { noteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';

export default function NoteEditor({ note, onUpdate, onDelete }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const saveTimeoutRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note]);

  const handleSave = async () => {
    if (!note) return;

    setSaving(true);
    try {
      const updated = await noteService.updateNote(note._id, title, content);
      onUpdate(updated);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    debounceSave();
  };

  const handleContentChange = (value) => {
    setContent(value);
    debounceSave();
  };

  const debounceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1000);
  };

  const handleDelete = async () => {
    if (!note || !window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await noteService.deleteNote(note._id);
      onDelete(note._id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collaboratorEmail.trim()) return;

    try {
      const updated = await noteService.addCollaborator(note._id, collaboratorEmail);
      onUpdate(updated);
      setCollaboratorEmail('');
      setShowShareModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const updated = await noteService.removeCollaborator(note._id, collaboratorId);
      onUpdate(updated);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  const isOwner = note && user && note.owner._id === user.id;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ]
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-lg">Select a note to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {saving && <span className="text-sm text-slate-500">Saving...</span>}
          {!saving && <span className="text-sm text-slate-400">Saved</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Share
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full text-4xl font-bold text-slate-800 border-none outline-none mb-6 placeholder-slate-300"
          />

          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            className="prose max-w-none"
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Share Note</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isOwner && (
              <form onSubmit={handleAddCollaborator} className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add collaborator by email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Collaborators</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{note.owner.name}</p>
                    <p className="text-xs text-slate-500">{note.owner.email}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Owner</span>
                </div>

                {note.collaborators && note.collaborators.map((collab) => (
                  <div key={collab._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{collab.name}</p>
                      <p className="text-xs text-slate-500">{collab.email}</p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab._id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
