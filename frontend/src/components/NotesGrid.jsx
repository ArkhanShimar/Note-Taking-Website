export default function NotesGrid({ notes, onSelectNote, activeView }) {
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
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 150);
  };

  const filteredNotes = notes.filter(note => {
    if (activeView === 'shared') {
      return note.collaborators && note.collaborators.length > 0;
    }
    return true;
  });

  if (filteredNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No notes yet</h3>
          <p className="text-slate-500">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredNotes.map((note) => (
        <div
          key={note._id}
          onClick={() => onSelectNote(note)}
          className="group bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-lg truncate flex-1 group-hover:text-blue-600 transition">
              {note.title || 'Untitled'}
            </h3>
            {note.collaborators && note.collaborators.length > 0 && (
              <div className="ml-2 flex-shrink-0 bg-blue-100 rounded-full p-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            )}
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed min-h-[60px]">
            {stripHtml(note.content) || 'No content'}
          </p>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">{formatDate(note.updatedAt)}</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-500">Saved</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
