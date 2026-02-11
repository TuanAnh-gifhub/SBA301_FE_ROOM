import React from "react";
import { FaMicrophone } from "react-icons/fa";
import { parseMessageContent } from "../../../services/upload/uploadService";
import { normalizeImageUrl } from "../../../utils/imageUrlHelper";

// ============ TYPE DEFINITIONS ============

interface Message {
  messageId: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  isVoice?: boolean;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showBackground?: boolean;
  isDarkMode?: boolean;
}

interface MediaData {
  type: "image" | "video" | "multiple";
  url: string;
  text?: string;
  isMedia: boolean; // Thêm trường này để đồng bộ với parseMessageContent
  metadata?: {
    thumbnail?: string;
    format?: string;
    width?: number;
    height?: number;
    size?: number;
    duration?: number;
  };
  media?: Array<{
    type: "image" | "video";
    url: string;
    metadata?: {
      thumbnail?: string;
      format?: string;
    };
  }>;
}

interface MessageGroup {
  messages: Message[];
  sender: "user" | "other";
}

// ============ UTILITY FUNCTIONS ============

const formatMessageTime = (createdAt: string): string => {
  const messageTime = new Date(createdAt);
  return messageTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MediaContent = ({
  mediaData,
}: {
  mediaData: MediaData;
  isDarkMode: boolean;
}) => {
  const { type, url, text, metadata } = mediaData;
  const normalizedUrl = normalizeImageUrl(url);
  const normalizedThumbnail = metadata?.thumbnail
    ? normalizeImageUrl(metadata.thumbnail)
    : null;

  if (type === "image") {
    return (
      <div className="space-y-1">
        <img
          src={normalizedUrl}
          alt="attachment"
          className="rounded-lg max-w-full h-auto cursor-pointer hover:brightness-90 transition-all"
          style={{ maxWidth: "250px", maxHeight: "300px", objectFit: "cover" }}
          onClick={() => window.open(normalizedUrl, "_blank")}
        />
        {text && <p className="text-sm px-1">{text}</p>}
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="space-y-1">
        <video
          controls
          className="rounded-lg max-w-full h-auto"
          style={{ maxWidth: "250px" }}
          poster={normalizedThumbnail || undefined}
        >
          <source
            src={normalizedUrl}
            type={`video/${metadata?.format || "mp4"}`}
          />
        </video>
        {text && <p className="text-sm px-1">{text}</p>}
      </div>
    );
  }

  return <p className="text-sm italic">Định dạng không hỗ trợ</p>;
};

// ============ MAIN COMPONENT ============

const MessageList = ({
  messages,
  messagesEndRef,
  isDarkMode = false,
}: MessageListProps) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const currentUserId = userInfo.userId;

  // Hàm nhóm các tin nhắn liên tiếp của cùng một người gửi
  const groupConsecutiveMessages = (msgs: Message[]): MessageGroup[] => {
    const grouped: MessageGroup[] = [];
    if (msgs.length === 0) return grouped;

    let currentGroup: MessageGroup = {
      messages: [msgs[0]],
      sender: msgs[0].senderId === currentUserId ? "user" : "other",
    };

    for (let i = 1; i < msgs.length; i++) {
      const msg = msgs[i];
      const senderType = msg.senderId === currentUserId ? "user" : "other";

      // Nếu cùng người gửi, thêm vào nhóm hiện tại
      if (senderType === currentGroup.sender) {
        currentGroup.messages.push(msg);
      } else {
        // Khác người gửi, chốt nhóm cũ và tạo nhóm mới
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
      className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {groupedMessages.map((group, groupIndex) => {
        const isMe = group.sender === "user";

        return (
          <div
            key={groupIndex}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="space-y-1">
                {group.messages.map((message) => {
                  const parsed = parseMessageContent(
                    message.content,
                  ) as MediaData;
                  const isMediaOnly = parsed.isMedia && !parsed.text;

                  return (
                    <div
                      key={message.messageId}
                      className={`${isMediaOnly ? "p-0" : "px-4 py-2"} rounded-2xl shadow-sm break-words ${
                        isMe
                          ? "bg-[#4da6ff] text-white rounded-tr-none"
                          : (isDarkMode
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-800 border") +
                            " rounded-tl-none"
                      }`}
                    >
                      {message.isVoice ? (
                        <div className="flex items-center gap-2 py-1">
                          <FaMicrophone
                            className={isMe ? "text-white" : "text-[#4da6ff]"}
                          />
                          <span className="text-sm italic">Tin nhắn thoại</span>
                        </div>
                      ) : parsed.isMedia ? (
                        <MediaContent
                          mediaData={parsed}
                          isDarkMode={isDarkMode}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">
                          {parsed.text || message.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Thời gian và trạng thái cho tin nhắn cuối cùng trong nhóm */}
              <div
                className={`flex items-center mt-1 gap-1 px-1 text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                <span>
                  {formatMessageTime(
                    group.messages[group.messages.length - 1].createdAt,
                  )}
                </span>
                {isMe && (
                  <>
                    <span>•</span>
                    <span>
                      {group.messages[group.messages.length - 1].isRead
                        ? "Đã xem"
                        : "Đã gửi"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
};

export default MessageList;
