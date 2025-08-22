import React from 'react';
import ReactMarkdown from 'react-markdown';

interface TextBlockProps {
  content: string;
}

const TextBlock: React.FC<TextBlockProps> = ({ content }) => {
  // Process content to ensure lists are properly formatted
  const processContent = (text: string) => {
    // If content already has proper markdown list formatting, return as is
    if (text.includes('\n- ') || text.includes('\n* ') || text.includes('\n1. ')) {
      return text;
    }
    
    // Convert lines that start with "- " or "* " to proper markdown lists
    let lines = text.split('\n');
    let inList = false;
    
    lines = lines.map(line => {
      // Check if line starts with a dash or bullet followed by space
      if (line.trim().match(/^[-*]\s/)) {
        inList = true;
        return line; // Already formatted correctly
      }
      
      // Check if line looks like a list item (starts with a number followed by period and space)
      if (line.trim().match(/^\d+\.\s/)) {
        inList = true;
        return line; // Already formatted correctly
      }
      
      // Check if line looks like it should be a list item (common patterns in the content)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        inList = true;
        return line; // Already formatted correctly
      }
      
      // Add a blank line before starting a new list for proper markdown rendering
      if (!inList && line.trim() && (
          line.trim().match(/^Set up/) ||
          line.trim().match(/^Understand/) ||
          line.trim().match(/^Write/) ||
          line.trim().match(/^Implement/) ||
          line.trim().match(/^Configure/) ||
          line.trim().match(/^Create/) ||
          line.trim().match(/^ESP32-C6/) ||
          line.trim().match(/^USB cable/) ||
          line.trim().match(/^Computer with/)
        )) {
        inList = true;
        return '- ' + line.trim();
      }
      
      return line;
    });
    
    return lines.join('\n');
  };

  return (
    <div className="prose max-w-none prose-headings:text-primary-700 prose-a:text-blue-600 prose-strong:text-gray-800 prose-ul:list-disc prose-ol:list-decimal">
      <ReactMarkdown>{processContent(content)}</ReactMarkdown>
    </div>
  );
};

export default TextBlock;