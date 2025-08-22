import React from 'react';

interface CodeBlockProps {
  content: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
  return (
    <div className="my-6">
      <div className="bg-gray-800 rounded-t-md px-4 py-2 flex items-center">
        <span className="text-gray-200 text-sm font-mono font-medium">{language || 'code'}</span>
        <span className="ml-auto text-xs text-gray-400">Copy code</span>
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