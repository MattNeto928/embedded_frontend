import React, { useMemo, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string | undefined;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl = '', className = '' }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [playError, setPlayError] = useState(false);
  
  // Extract filename from URL for display
  const getFilenameFromUrl = (url: string): string => {
    try {
      // Try to extract the filename from the URL
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      const filename = parts[parts.length - 1];
      
      // If we found a filename with extension, return it
      if (filename && filename.includes('.')) {
        return filename;
      }
      
      // Otherwise return a generic name
      return 'video file';
    } catch (e) {
      return 'video file';
    }
  };

  if (!videoUrl) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md">
        <p className="text-yellow-700">No video available</p>
      </div>
    );
  }

  return (
    <div className={`video-player bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col items-center">
        {/* Inline player */}
        {!playError && (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full max-w-3xl rounded-md bg-black"
            onError={() => setPlayError(true)}
            playsInline
          />
        )}

        {/* Title / filename */}
        <p className="text-gray-600 text-center my-3">
          {getFilenameFromUrl(videoUrl)}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
            download
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Video
          </a>
          
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in New Tab
          </a>
        </div>

        {/* Fallback notice if inline playback fails */}
        {playError && (
          <div className="w-full max-w-3xl mb-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            Inline playback failed. Use Download or Open in New Tab.
          </div>
        )}
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          {showInfo ? 'Hide Info' : 'Show Info'}
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform ${showInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md w-full text-sm">
            <p className="text-gray-700 mb-1"><strong>Note:</strong> If you're having trouble viewing the video in your browser:</p>
            <ol className="list-decimal pl-5 text-gray-600">
              <li>Try downloading the video and opening it with your computer's video player</li>
              <li>Make sure you have the correct codecs installed for this video format</li>
              <li>Some browsers may have restrictions on playing certain video formats</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;