import React from 'react';
import ReactMarkdown from 'react-markdown';

interface NoteBlockProps {
  content: string;
  type: 'note' | 'warning';
}

const NoteBlock: React.FC<NoteBlockProps> = ({ content, type }) => {
  const isWarning = type === 'warning';
  
  return (
    <div className={`my-4 p-4 rounded-md ${isWarning ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
      <div className="flex items-center mb-2">
        <div className={`w-5 h-5 flex items-center justify-center rounded-full ${isWarning ? 'bg-yellow-200 text-yellow-700' : 'bg-blue-200 text-blue-700'}`}>
          {isWarning ? '!' : 'i'}
        </div>
        <h4 className={`ml-2 font-medium ${isWarning ? 'text-yellow-800' : 'text-blue-800'}`}>
          {isWarning ? 'Warning' : 'Note'}
        </h4>
      </div>
      <div className={`prose max-w-none ${isWarning ? 'text-yellow-700' : 'text-blue-700'}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default NoteBlock;