import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { noteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';

export default function NoteEditor({ note, onUpdate, onDelete, folders }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const { user } = useAuth();
  const quillRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note?._id]);

  const handleSave = async () => {
    if (!note) return;

    setSaving(true);
    try {
      const updated = await noteService.updateNote(note._id, title, content, note.folder);
      onUpdate(updated);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
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
    } catch (error) {
      console.error('Failed to move note:', error);
    }
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
      alert('Collaborator added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!window.confirm('Remove this collaborator?')) return;

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
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
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
          <span className="text-sm text-slate-500">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Move to Folder
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
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto p-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-4xl font-bold text-slate-800 bg-transparent border-none outline-none mb-8 placeholder-slate-300 focus:placeholder-slate-400"
          />

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Start writing your note..."
              className="min-h-[500px]"
            />
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Share Note</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isOwner && (
              <form onSubmit={handleAddCollaborator} className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Add collaborator by email
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm hover:shadow-md"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-4">People with access</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {note.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{note.owner.name}</p>
                      <p className="text-xs text-slate-600">{note.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">Owner</span>
                </div>

                {note.collaborators && note.collaborators.map((collab) => (
                  <div key={collab._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center text-white font-medium">
                        {collab.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{collab.name}</p>
                        <p className="text-xs text-slate-600">{collab.email}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab._id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
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
              className="w-full mt-6 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
