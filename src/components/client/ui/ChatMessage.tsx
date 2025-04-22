import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  className?: string;
}

export const ChatMessage = ({ role, content, timestamp, className }: ChatMessageProps) => {
  return (
    <div className={cn(
      'flex flex-col',
      role === 'user' ? 'items-end' : 'items-start',
      className
    )}>
      <div className={cn(
        'max-w-[80%] rounded-lg p-3',
        role === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-900'
      )}>
        {content}
      </div>
      {timestamp && (
        <span className="text-xs text-gray-500 mt-1">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}; 