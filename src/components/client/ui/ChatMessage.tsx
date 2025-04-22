import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  attachments?: File[];
  status?: 'sending' | 'delivered' | 'error';
}

export function ChatMessage({
  content,
  role,
  timestamp,
  attachments,
  status
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex',
        role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3',
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {content}
        {attachments && attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((file, index) => (
              <div key={index} className="text-sm opacity-75">
                📎 {file.name}
              </div>
            ))}
          </div>
        )}
        {timestamp && (
          <div className="mt-1 text-xs opacity-50">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
        {status && (
          <div className="mt-1 text-xs opacity-50">
            {status === 'sending' && '⏳ Sending...'}
            {status === 'delivered' && '✓ Delivered'}
            {status === 'error' && '❌ Error'}
          </div>
        )}
      </div>
    </div>
  );
} 