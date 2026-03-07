import { useState } from 'react';

export default function NotesGrid({ notes, onSelectNote, onRemoveFromFolder, showRemoveButton, onDeleteNote, onShareNote, onAddToFolder, onTogglePin }) {
  const [previewNote, setPreviewNote] = useState(null);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState(null);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    // If less than 1 minute ago
    if (minutes < 1) return 'Just now';
    
    // If less than 1 hour ago
    if (minutes < 60) return `${minutes} min ago`;
    
    // If less than 24 hours ago
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    // If today
    if (days === 0) {
      return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    
    // If yesterday
    if (days === 1) {
      return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    
    // If within the last week
    if (days < 7) {
      return `${days} days ago`;
    }
    
    // Otherwise show full date with time
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 120);
  };

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No notes yet</h3>
          <p className="text-sm text-slate-500">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {notes.map((note) => (
          <div
            key={note._id}
            onClick={() => setPreviewNote(note)}
            className="group bg-white rounded-3xl border-2 border-gray-200 p-5 cursor-pointer transition-all hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-300 hover:-translate-y-1 relative"
          >
            
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  {note.isPinned && (
                    <div className="bg-yellow-50 rounded-lg p-1 flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-yellow-600" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-lg truncate flex-1 group-hover:text-indigo-600 transition">
                    {note.title || 'Untitled'}
                  </h3>
                </div>
                {note.collaborators && note.collaborators.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-1.5 flex-shrink-0 ml-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3 mb-2 leading-relaxed min-h-[63px]">
                {stripHtml(note.content) || 'No content'}
              </p>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-1.5 mb-3 pb-3 border-b border-gray-100">
                {onTogglePin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note);
                    }}
                    className={`w-7 h-7 hover:scale-110 rounded-lg flex items-center justify-center transition-all ${
                      note.isPinned 
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                        : 'bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <svg className="w-3.5 h-3.5" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNote(note);
                  }}
                  className="w-7 h-7 bg-indigo-50 hover:bg-indigo-200 hover:scale-110 text-indigo-600 rounded-lg flex items-center justify-center transition-all"
                  title="Edit note"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {onShareNote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareNote(note);
                    }}
                    className="w-7 h-7 bg-purple-50 hover:bg-purple-200 hover:scale-110 text-purple-600 rounded-lg flex items-center justify-center transition-all"
                    title="Share note"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                )}
                {onAddToFolder && !note.folder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToFolder(note);
                    }}
                    className="w-7 h-7 bg-green-50 hover:bg-green-200 hover:scale-110 text-green-600 rounded-lg flex items-center justify-center transition-all"
                    title="Add to folder"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                )}
                {onDeleteNote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmNote(note);
                    }}
                    className="w-7 h-7 bg-red-50 hover:bg-red-200 hover:scale-110 text-red-600 rounded-lg flex items-center justify-center transition-all"
                    title="Delete note"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                {showRemoveButton && onRemoveFromFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromFolder(note._id);
                    }}
                    className="w-7 h-7 bg-orange-50 hover:bg-orange-200 hover:scale-110 text-orange-600 rounded-lg flex items-center justify-center transition-all"
                    title="Remove from folder"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(note.updatedAt)}
                  </span>
                  {!note.isDraft && (
                    <div className="flex flex-col gap-0.5">
                      {note.owner && (
                        <span className="text-xs text-gray-600">
                          Created by {note.owner.name}
                        </span>
                      )}
                      {note.lastEditedBy && note.lastEditedBy._id !== note.owner?._id && (
                        <span className="text-xs text-indigo-600 font-medium">
                          Edited by {note.lastEditedBy.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 font-medium">Saved</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setPreviewNote(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-white mb-2 truncate">{previewNote.title || 'Untitled'}</h2>
                <div className="flex flex-col gap-1 text-white/90 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Updated {formatDate(previewNote.updatedAt)}
                    </span>
                    {previewNote.collaborators && previewNote.collaborators.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Shared with {previewNote.collaborators.length} {previewNote.collaborators.length === 1 ? 'person' : 'people'}
                      </span>
                    )}
                  </div>
                  {!previewNote.isDraft && (
                    <div className="flex items-center gap-3 text-white/80 text-xs">
                      {previewNote.owner && (
                        <span>Created by {previewNote.owner.name}</span>
                      )}
                      {previewNote.lastEditedBy && previewNote.lastEditedBy._id !== previewNote.owner?._id && (
                        <>
                          <span>•</span>
                          <span>Edited by {previewNote.lastEditedBy.name}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPreviewNote(null)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition flex-shrink-0 ml-4"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: previewNote.content || '<p class="text-gray-400 italic">No content</p>' }}
              />
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Created {new Date(previewNote.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} at {new Date(previewNote.createdAt).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewNote(null)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPreviewNote(null);
                    onSelectNote(previewNote);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Note</h3>
                <p className="text-gray-600 text-sm mb-1">
                  Are you sure you want to delete this note?
                </p>
                <p className="text-gray-900 font-medium text-sm">
                  "{deleteConfirmNote.title || 'Untitled'}"
                </p>
                <p className="text-red-600 text-xs mt-2">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmNote(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteNote(deleteConfirmNote._id);
                  setDeleteConfirmNote(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
