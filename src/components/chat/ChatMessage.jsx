import { Check, CheckCheck, Shield, User } from "lucide-react";
import ChatAttachment from "./ChatAttachment";
import { getAvatarUrl } from "../../utils/imageUrl";

const ChatMessage = ({ message, isOwnMessage }) => {
  const isAdmin = message.senderRole === "admin";

  return (
    <div
      className={`flex w-full mb-4 px-1 ${isOwnMessage ? "justify-end" : "justify-start"
        }`}
    >
      <div
        className={`flex max-w-full gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"
          }`}
      >
        {/* Rounded Avatar matching Aura theme */}
        <div className="flex flex-col justify-end mb-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm shrink-0 overflow-hidden ${isAdmin
              ? "bg-gray-100 border-gray-200 text-gray-600"
              : "bg-gray-50 border-gray-100 text-gray-400"
              }`}
          >
            <img
              src={getAvatarUrl(message.sender)}
              alt={isAdmin ? "Admin" : message.sender?.firstName || "User"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isAdmin ? "Admin" : message.sender?.firstName || "U")}&background=109383&color=fff`;
              }}
            />
          </div>
        </div>

        {/* Message Container - Responsive constraints */}
        <div
          className={`flex flex-col gap-1.5 min-w-0 ${isOwnMessage ? "items-end" : "items-start"
            }`}
        >
          <div
            className={`flex items-center gap-2 px-1 ${isOwnMessage ? "flex-row-reverse" : ""
              }`}
          >
            <span className="text-[11px] font-bold text-gray-700">
              {isAdmin ? "Admin" : message.sender?.firstName || "Customer"}
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>

          {/* Text Bubble - Forced wrapping for long strings */}
          {message.content && (
            <div
              className={`px-4 py-2.5 rounded-2xl text-[14px] leading-snug shadow-sm 
                w-fit min-w-[60px] max-w-[85%] sm:max-w-[80%] break-words whitespace-pre-wrap
                ${isOwnMessage
                  ? "bg-[#E0F2F1] text-teal-900 border border-teal-100 rounded-tr-none"
                  : "bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-none"
                }`}
            >
              {message.content}
            </div>
          )}

          {/* Attachments Area */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-col gap-2 w-full max-w-[300px]">
              {message.attachments.map((attachment, index) => (
                <ChatAttachment key={index} attachment={attachment} />
              ))}
            </div>
          )}

          {/* Admin Delivery Status */}
          {isOwnMessage && (
            <div className="flex items-center gap-1 px-1 mt-0.5">
              <span
                className={message.isRead ? "text-gray-400" : "text-gray-300"}
              >
                {message.isRead ? (
                  <CheckCheck size={14} strokeWidth={3} />
                ) : (
                  <Check size={14} strokeWidth={3} />
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
