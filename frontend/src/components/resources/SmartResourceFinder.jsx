import React, { useState } from 'react';
import { FolderSearch, Search, Link2 } from 'lucide-react';

const SmartResourceFinder = () => {
  const [folderUrl, setFolderUrl] = useState('');

  const handleConnect = () => {
    if (!folderUrl.trim()) {
      alert('Please enter your Google Drive folder link.');
      return;
    }

    if (!folderUrl.includes('drive.google.com')) {
      alert('Please enter a valid Google Drive link.');
      return;
    }

    alert('Link format accepted! Drive connection will be implemented next.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
          <FolderSearch className="text-blue-600" size={24} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Smart Resource Finder
          </h2>
          <p className="text-sm text-gray-500">
            Connect Your Academic Resources
          </p>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-5">
        Connect your Google Drive folder to find notes, books, question papers
        and other academic resources instantly.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center flex-1 border border-gray-200 rounded-xl px-3">
          <Link2 size={18} className="text-gray-400 mr-2" />

          <input
            type="url"
            value={folderUrl}
            onChange={(e) => setFolderUrl(e.target.value)}
            placeholder="Paste your Google Drive folder link"
            className="w-full py-3 outline-none text-sm"
          />
        </div>

        <button
          onClick={handleConnect}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <Search size={18} />
          Connect Drive
        </button>
      </div>
    </div>
  );
};

export default SmartResourceFinder;