import { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function FileUploadZone() {
  const { uploadFiles, openAndUploadFiles, parseProgress, isLoading, uploadedFiles, clearAllData, isElectron } = useFinance();
  const [dragging, setDragging] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files)
      .filter(f => /\.(pdf|xlsx|xls)$/i.test(f.name))
      .map(f => ({ name: f.name, path: f.path, type: f.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'excel' }));
    if (files.length > 0) uploadFiles(files);
  }

  const statusIcon = (s) => {
    if (s === 'parsing') return <span className="animate-spin inline-block">⏳</span>;
    if (s === 'done') return <span className="text-green-500">✓</span>;
    if (s === 'error') return <span className="text-red-500">✗</span>;
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
      >
        <div className="text-4xl mb-2">📂</div>
        <p className="text-gray-700 font-medium">Drop your bank statements here</p>
        <p className="text-gray-400 text-sm mt-1">Supports PDF and Excel (.xlsx / .xls) — credit card &amp; savings account statements</p>
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={openAndUploadFiles}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Parsing…' : 'Browse Files'}
          </button>
          {uploadedFiles.length > 0 && (
            <button
              onClick={() => setShowFiles(v => !v)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} loaded
            </button>
          )}
          {uploadedFiles.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear all uploaded data?')) clearAllData(); }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        {!isElectron && (
          <p className="text-amber-600 text-xs mt-3">⚠ File parsing requires the desktop app. Running in browser preview mode.</p>
        )}
      </div>

      {/* Parse progress */}
      {parseProgress.length > 0 && (
        <div className="space-y-1">
          {parseProgress.map(p => (
            <div key={p.file} className="flex items-center gap-2 text-sm bg-white border border-gray-100 rounded-xl px-3 py-2">
              {statusIcon(p.status)}
              <span className="flex-1 truncate text-gray-700">{p.file}</span>
              {p.count != null && <span className="text-gray-400">{p.count} transactions</span>}
              {p.error && <span className="text-red-500 text-xs">{p.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {showFiles && uploadedFiles.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="text-lg">{/\.pdf$/i.test(f.name) ? '📄' : '📊'}</span>
              <span className="flex-1 truncate text-gray-700">{f.name}</span>
              <span className="text-gray-400">{f.transactionCount} txns</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
