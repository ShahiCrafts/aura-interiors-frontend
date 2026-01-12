import { useState, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSendMessage } from "../../hooks/chat/useChatTan";

const ChatInput = ({ chatId, onTyping }) => {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const sendMessageMutation = useSendMessage();

  const handleTypingChange = (value) => {
    setMessage(value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);
  };

  const handleSend = () => {
    if (!message.trim() && selectedFiles.length === 0) return;
    sendMessageMutation.mutate(
      { chatId, content: message.trim(), attachments: selectedFiles },
      {
        onSuccess: () => {
          setMessage("");
          setSelectedFiles([]);
          onTyping(false);
          if (textareaRef.current) textareaRef.current.style.height = "44px";
        },
      }
    );
  };

  const canSend =
    (message.trim() || selectedFiles.length > 0) &&
    !sendMessageMutation.isPending;

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-3">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-xs font-medium"
              >
                {file.name}
                <button
                  onClick={() =>
                    setSelectedFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute right-1 top-1.5 p-0.5 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

  
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 hover:text-[#0d9488] hover:bg-teal-50 transition-all flex items-center justify-center"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            rows={1}
            onChange={(e) => {
              handleTypingChange(e.target.value);
              e.target.style.height = "44px"; // Base height
              e.target.style.height = `${Math.min(
                e.target.scrollHeight,
                120
              )}px`;
            }}
            placeholder="Type your message..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-[10px] text-gray-800 text-[14px] leading-[22px] resize-none focus:outline-none focus:border-[#0d9488] focus:bg-white transition-all min-h-[44px] max-h-[120px] block shadow-inner overflow-y-auto"
          />
        </div>

        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            canSend
              ? "bg-[#0d9488] text-white shadow-md shadow-teal-500/10"
              : "bg-gray-100 text-gray-300"
          }`}
        >
          {sendMessageMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={20} strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;
