import { useState } from 'react';

export default function NotesGrid({ notes, onSelectNote, onRemoveFromFolder, showRemoveButton }) {
  const [previewNote, setPreviewNote] = useState(null);

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
            className="group bg-white rounded-3xl border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-300 hover:-translate-y-1 relative"
          >
            
            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg truncate flex-1 group-hover:text-indigo-600 transition pr-2">
                  {note.title || 'Untitled'}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {note.collaborators && note.collaborators.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-1.5">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNote(note);
                    }}
                    className="w-8 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    title="Edit note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {showRemoveButton && onRemoveFromFolder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromFolder(note._id);
                      }}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Remove from folder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed min-h-[63px]">
                {stripHtml(note.content) || 'No content'}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(note.updatedAt)}
                </span>
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
                <div className="flex items-center gap-4 text-white/90 text-sm">
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
    </>
  );
}
