export default function NotesList({ notes, selectedNote, onSelectNote, activeView }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const filteredNotes = notes.filter(note => {
    if (activeView === 'shared') {
      return note.collaborators && note.collaborators.length > 0;
    }
    return true;
  });

  if (filteredNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-1">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {filteredNotes.map((note) => (
        <div
          key={note._id}
          onClick={() => onSelectNote(note)}
          className={`p-4 border-b border-slate-200 cursor-pointer transition hover:bg-slate-50 ${
            selectedNote?._id === note._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-slate-800 truncate flex-1">{note.title || 'Untitled'}</h3>
            {note.collaborators && note.collaborators.length > 0 && (
              <svg className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
            {stripHtml(note.content) || 'No content'}
          </p>
          <p className="text-xs text-slate-400">{formatDate(note.updatedAt)}</p>
        </div>
      ))}
    </div>
  );
}
