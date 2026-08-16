import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageStats {
  urls: string[];
  totalUploads: number;
}

export default function ImageGalleryAnalytics({ stats }: { stats: ImageStats }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-50 rounded-lg">
          <ImageIcon className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
          <p className="text-xs text-gray-500">Images Uploaded</p>
        </div>
      </div>

      {stats.urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.urls.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#5B94E5] hover:shadow-md transition-all group"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </a>
          ))}
        </div>
      )}

      {stats.urls.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No images uploaded yet
        </div>
      )}
    </div>
  );
}
