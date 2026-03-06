export default function FolderGrid({ folders, onSelectFolder }) {
  const colors = [
    '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Recent Folders</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg">
            All
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition">
            Recent
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition">
            Last modified
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {folders.map((folder, index) => (
          <button
            key={folder._id}
            onClick={() => onSelectFolder(folder._id)}
            className="group"
          >
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div
                className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center shadow-md"
                style={{ backgroundColor: folder.color || colors[index % colors.length] }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 truncate">{folder.name}</h3>
              <p className="text-sm text-slate-500">{folder.noteCount || 0} notes</p>
            </div>
          </button>
        ))}

        <button className="group">
          <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-slate-400 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col items-center justify-center h-full min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-3 group-hover:bg-slate-300 transition">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-600">New Folder</span>
          </div>
        </button>
      </div>
    </div>
  );
}
