import React from "react";
import { type MessageResponse } from "../../../services/chats/chatService";
import { parseMessageContent } from "../../../services/upload/uploadService";
import { FaUserCircle } from "react-icons/fa";
// ============ TYPE DEFINITIONS ============

interface Message extends MessageResponse {
  isRead: boolean;
  isVoice?: boolean;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showBackground?: boolean;
  currentUserId: string | null;
  isDarkMode?: boolean;
}

interface MessageGroup {
  messages: Message[];
  sender: "user" | "other";
}

// ============ UTILITY FUNCTIONS ============

const MessageList = ({
  messages,
  messagesEndRef,
  currentUserId,
  isDarkMode = false,
}: MessageListProps) => {
  const groupConsecutiveMessages = (msgs: Message[]): MessageGroup[] => {
    const grouped: MessageGroup[] = [];
    if (msgs.length === 0) return grouped;

    const TIME_THRESHOLD = 15 * 60 * 1000;

    let currentGroup: MessageGroup = {
      messages: [msgs[0]],
      sender: String(msgs[0].senderId) === currentUserId ? "user" : "other",
    };

    for (let i = 1; i < msgs.length; i++) {
      const msg = msgs[i];
      const prevMsg = msgs[i - 1];
      const senderType =
        String(msg.senderId) === currentUserId ? "user" : "other";

      const timeDiff =
        new Date(msg.createdAt).getTime() -
        new Date(prevMsg.createdAt).getTime();

      if (senderType === currentGroup.sender && timeDiff < TIME_THRESHOLD) {
        currentGroup.messages.push(msg);
      } else {
        grouped.push(currentGroup);
        currentGroup = {
          messages: [msg],
          sender: senderType,
        };
      }
    }
    grouped.push(currentGroup);
    return grouped;
  };

  const groupedMessages = groupConsecutiveMessages(messages);

  return (
    <div
      className={`flex-1 overflow-y-auto px-1.5 py-4 space-y-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {groupedMessages.map((group, groupIndex) => {
        const isMe = group.sender === "user";

        return (
          <div
            key={groupIndex}
            className={`flex ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 mb-2`}
          >
            {!isMe && (
              <div className="flex-shrink-0 mb-5">
                <FaUserCircle className="text-gray-400 w-8 h-8" />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex flex-col w-full">
                {group.messages.map((message, idx) => {
                  const parsed = parseMessageContent(message.content) as any;
                  const isMediaOnly = parsed.isMedia && !parsed.text;

                  const isFirst = idx === 0;
                  const isLast = idx === group.messages.length - 1;

                  // Logic bo góc tùy biến
                  let borderRadiusClass = isMe
                    ? group.messages.length === 1
                      ? "rounded-2xl rounded-br-none"
                      : isFirst
                        ? "rounded-2xl rounded-br-sm mb-[2px]"
                        : isLast
                          ? "rounded-2xl rounded-tr-sm rounded-br-none"
                          : "rounded-2xl rounded-tr-sm rounded-br-sm mb-[2px]"
                    : group.messages.length === 1
                      ? "rounded-2xl rounded-bl-none"
                      : isFirst
                        ? "rounded-2xl rounded-bl-sm mb-[2px]"
                        : isLast
                          ? "rounded-2xl rounded-tl-sm rounded-bl-none"
                          : "rounded-2xl rounded-tl-sm rounded-bl-sm mb-[2px]";

                  return (
                    <div
                      key={message.messageId}
                      className="flex flex-col items-end w-full"
                    >
                      <div
                        className={`relative ${isMediaOnly ? "p-0" : "px-3 py-1.5"} shadow-sm transition-all w-fit max-w-[100%] ${borderRadiusClass} ${
                          isMe
                            ? "bg-blue-600 text-white ml-auto"
                            : isDarkMode
                              ? "bg-gray-800 text-white mr-auto"
                              : "bg-white text-gray-800 border border-gray-200 mr-auto"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-tight text-sm">
                          {parsed.text || message.content}
                        </p>
                      </div>

                      {/* HIỂN THỊ THỜI GIAN VÀ TRẠNG THÁI (FIX LỖI TẠI ĐÂY) */}
                      {isLast && (
                        <div
                          className={`flex items-center mt-0.5 text-[10px] font-medium text-gray-400 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                          {isMe && (
                            <>
                              <span className="mx-1">•</span>
                              {/* Sửa messages.isRead (sai) thành message.isRead (đúng) */}
                              <span
                                className={
                                  message.isRead ? "text-blue-500" : ""
                                }
                              >
                                {message.isRead ? "Đã xem" : "Đã gửi"}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
