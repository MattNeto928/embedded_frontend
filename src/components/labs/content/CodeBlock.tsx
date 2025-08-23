import React, { useState } from 'react';

interface CodeBlockProps {
  content: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy code: ', err);
      });
  };

  return (
    <div className="my-6">
      <div className="bg-gray-800 rounded-t-md px-4 py-2 flex items-center">
        <span className="text-gray-200 text-sm font-mono font-medium">{language || 'code'}</span>
        <button
          onClick={handleCopyCode}
          className={`ml-auto text-xs px-2 py-1 rounded transition-colors ${
            copied
              ? 'bg-green-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre className="bg-gray-100 rounded-b-md p-5 overflow-x-auto border border-gray-300 text-sm">
        <code className={language ? `language-${language}` : ''}>
          {content}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;