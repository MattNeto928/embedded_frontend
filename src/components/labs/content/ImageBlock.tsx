import React from 'react';

interface ImageBlockProps {
  url: string;
  caption?: string;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ url, caption }) => {
  return (
    <div className="my-4">
      <img 
        src={url} 
        alt={caption || 'Lab image'} 
        className="max-w-full h-auto rounded-lg shadow-md"
      />
      {caption && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
};

export default ImageBlock;