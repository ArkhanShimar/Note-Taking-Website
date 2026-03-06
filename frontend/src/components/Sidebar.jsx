import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ onCreateNote, activeView, setActiveView, folders, onCreateFolder }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Syncscribe</h1>
            <p className="text-xs text-slate-500">Meet Desai</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={onCreateNote}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Note
          </div>
          <span className="text-xs text-slate-400">⌘N</span>
        </button>

        <button className="w-full text-slate-600 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </div>
          <span className="text-xs text-slate-400">⌘S</span>
        </button>

        <button
          onClick={() => setActiveView('shared')}
          className={`w-full font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-between text-sm ${
            activeView === 'shared'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Shared
          </div>
          <span className="text-xs text-slate-400">⌘R</span>
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm font-medium">Folders</span>
          </div>
          <button
            onClick={onCreateFolder}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          <button
            onClick={() => setActiveView('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
              activeView === 'all'
                ? 'bg-slate-100 text-slate-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Notes
          </button>
          {folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => setActiveView(`folder-${folder._id}`)}
              className={`w-full text-left px-3 py-2 rounded-lg transition text-sm flex items-center justify-between ${
                activeView === `folder-${folder._id}`
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{folder.name}</span>
              <span className="text-xs text-slate-400">{folder.noteCount || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 space-y-2 border-t border-slate-200">
        <button className="w-full text-slate-600 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg transition flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact
        </button>

        <button className="w-full text-slate-600 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg transition flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-slate-600 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-lg transition flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
