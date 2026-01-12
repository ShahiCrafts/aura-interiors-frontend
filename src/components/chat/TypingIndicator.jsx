/**
 * TypingIndicator Component
 * Animated "typing..." indicator
 */

import { Shield } from 'lucide-react';

const TypingIndicator = ({ isAdmin = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center ring-1 ring-amber-200/50">
        <Shield className="w-3.5 h-3.5 text-amber-600" />
      </div>
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-100 shadow-sm">
        <span className="text-sm text-neutral-500 font-medium">
          {isAdmin ? 'Support is typing' : 'Customer is typing'}
        </span>
        <div className="flex gap-1 items-center">
          <span
            className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '600ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '600ms' }}
          />
          <span
            className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '600ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
