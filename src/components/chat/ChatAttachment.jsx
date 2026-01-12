import { FileText, Download, Image as ImageIcon, ExternalLink } from 'lucide-react';

const ChatAttachment = ({ attachment, isOwnMessage }) => {
  const { fileName, fileUrl, fileType, fileSize } = attachment;

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseURL}${fileUrl}`;

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Render image attachment
  if (fileType === 'image') {
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden hover:opacity-95 transition-opacity group relative"
      >
        <img
          src={fullUrl}
          alt={fileName}
          className="max-w-full h-auto max-h-64 object-cover rounded-xl"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
            <ExternalLink className="w-4 h-4 text-neutral-700" />
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
        isOwnMessage
          ? 'bg-teal-800/50 hover:bg-teal-800/70 border border-teal-500/30'
          : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        isOwnMessage ? 'bg-teal-600/50' : 'bg-teal-100'
      }`}>
        <FileText className={`w-5 h-5 ${isOwnMessage ? 'text-white' : 'text-teal-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOwnMessage ? 'text-white' : 'text-neutral-700'}`}>
          {fileName}
        </p>
        <p className={`text-xs ${isOwnMessage ? 'text-teal-200' : 'text-neutral-500'}`}>
          {formatFileSize(fileSize)}
        </p>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        isOwnMessage
          ? 'bg-teal-600/30 group-hover:bg-teal-600/50'
          : 'bg-neutral-200 group-hover:bg-neutral-300'
      }`}>
        <Download className={`w-4 h-4 ${isOwnMessage ? 'text-white' : 'text-neutral-600'}`} />
      </div>
    </a>
  );
};

export default ChatAttachment;
