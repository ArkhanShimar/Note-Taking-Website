export default function DashboardHome({ notes, onSelectNote, onCreateNote }) {
  const recentNotes = notes.slice(0, 6);
  
  const stats = {
    totalNotes: notes.length,
    sharedNotes: notes.filter(n => n.collaborators && n.collaborators.length > 0).length,
    todayNotes: notes.filter(n => {
      const today = new Date();
      const noteDate = new Date(n.createdAt);
      return noteDate.toDateString() === today.toDateString();
    }).length
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').substring(0, 80);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-sm text-gray-600">Here's what's happening with your notes today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{stats.totalNotes}</p>
            <p className="text-xs text-gray-600 text-center">Total Notes</p>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{stats.sharedNotes}</p>
            <p className="text-xs text-gray-600 text-center">Shared Notes</p>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{stats.todayNotes}</p>
            <p className="text-xs text-gray-600 text-center">Created Today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Start creating</h2>
              <p className="text-sm text-indigo-100 mb-3">Capture your ideas and collaborate with others</p>
              <button
                onClick={onCreateNote}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded-xl transition text-sm"
              >
                Create New Note
              </button>
            </div>
            <div className="hidden md:block">
              <svg className="w-24 h-24 text-white opacity-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Notes</h2>
            <button
              onClick={() => {}}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-xs flex items-center gap-1"
            >
              View all
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No notes yet</h3>
              <p className="text-sm text-gray-600 mb-3">Get started by creating your first note</p>
              <button
                onClick={onCreateNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition text-sm"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => onSelectNote(note)}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-base truncate flex-1 group-hover:text-indigo-600 transition">
                      {note.title || 'Untitled'}
                    </h3>
                    {note.collaborators && note.collaborators.length > 0 && (
                      <div className="ml-2 flex-shrink-0 bg-purple-100 rounded-md p-1">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                    {stripHtml(note.content) || 'No content'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Saved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
