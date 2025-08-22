import React from 'react';
import { LabContentBlock } from '../../../types';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import CodeBlock from './CodeBlock';
import NoteBlock from './NoteBlock';

interface ContentBlockProps {
  block: LabContentBlock;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content} />;
    case 'image':
      return <ImageBlock url={block.url || ''} caption={block.caption} />;
    case 'code':
      return <CodeBlock content={block.content} language={block.language} />;
    case 'note':
      return <NoteBlock content={block.content} type="note" />;
    case 'warning':
      return <NoteBlock content={block.content} type="warning" />;
    case 'video':
      // Video component would be implemented here
      return <div className="text-gray-500">Video content not supported yet</div>;
    case 'diagram':
      // For now, treat diagrams as images
      return <ImageBlock url={block.url || ''} caption={block.caption} />;
    default:
      return <div>Unknown content type</div>;
  }
};

export default ContentBlock;