export default function DashboardHome({ notes, drafts, onSelectNote, onCreateNote, onNavigate, onShowDrafts }) {
  const recentNotes = notes.slice(0, 3);
  
  const stats = {
    totalNotes: notes.length,
    sharedNotes: notes.filter(n => n.collaborators && n.collaborators.length > 0).length,
    todayNotes: notes.filter(n => {
      const today = new Date();
      const noteDate = new Date(n.createdAt);
      return noteDate.toDateString() === today.toDateString();
    }).length,
    draftNotes: drafts ? drafts.length : 0
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').substring(0, 80);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 transition-colors">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Here's what's happening with your notes today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => onNavigate('all-notes')}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition text-left group"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">{stats.totalNotes}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Total Notes</p>
          </button>

          <button
            onClick={() => onNavigate('shared')}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition text-left group"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">{stats.sharedNotes}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Shared Notes</p>
          </button>

          <button
            onClick={onShowDrafts}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition text-left group"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">{stats.draftNotes}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Draft Notes</p>
          </button>

          <button
            onClick={() => onNavigate('all-notes')}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition text-left group"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">{stats.todayNotes}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Created Today</p>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-xl p-6 mb-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Start creating</h2>
              <p className="text-sm text-indigo-100 dark:text-indigo-200 mb-3">Capture your ideas and collaborate with others</p>
              <button
                onClick={onCreateNote}
                className="bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-200 font-medium py-2 px-4 rounded-xl transition text-sm"
              >
                Create New Note
              </button>
            </div>
            <div className="hidden md:block">
              <svg className="w-24 h-24 text-white opacity-20 dark:opacity-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Notes</h2>
            <button
              onClick={() => onNavigate('all-notes')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-xs flex items-center gap-1"
            >
              View all
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No notes yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get started by creating your first note</p>
              <button
                onClick={onCreateNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition text-sm"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {recentNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => onSelectNote(note)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base truncate flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {note.title || 'Untitled'}
                    </h3>
                    {note.collaborators && note.collaborators.length > 0 && (
                      <div className="ml-2 flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-md p-1">
                        <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                    {stripHtml(note.content) || 'No content'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
