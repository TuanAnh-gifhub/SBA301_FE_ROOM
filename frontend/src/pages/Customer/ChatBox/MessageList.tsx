import React from "react";
import { parseMessageContent } from "../../../services/upload/uploadService";
import { normalizeImageUrl } from "../../../utils/imageUrlHelper";
import { FaUserCircle } from "react-icons/fa";
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
  currentUserId: string | null;
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

const MessageList = ({
  messages,
  messagesEndRef,
  currentUserId,
  isDarkMode = false,
}: MessageListProps) => {

  const groupConsecutiveMessages = (msgs: Message[]): MessageGroup[] => {
    const grouped: MessageGroup[] = [];
    if (msgs.length === 0) return grouped;

    // Khoảng thời gian để tách đoạn (ví dụ 15 phút = 15 * 60 * 1000 ms)
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

      // Tính khoảng cách thời gian giữa tin nhắn hiện tại và tin nhắn trước đó
      const timeDiff =
        new Date(msg.createdAt).getTime() -
        new Date(prevMsg.createdAt).getTime();

      // ĐIỀU KIỆN GỘP: Cùng người gửi VÀ cách nhau chưa tới 15 phút
      if (senderType === currentGroup.sender && timeDiff < TIME_THRESHOLD) {
        currentGroup.messages.push(msg);
      } else {
        // Nếu khác người gửi HOẶC thời gian cách nhau quá xa -> Tạo nhóm mới
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
            {/* AVATAR: Chỉ hiện cho người khác */}
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
                  const parsed = parseMessageContent(
                    message.content,
                  ) as MediaData;
                  const isMediaOnly = parsed.isMedia && !parsed.text;

                  // Xác định vị trí của tin nhắn trong group
                  const isFirst = idx === 0;
                  const isLast = idx === group.messages.length - 1;
                  const isMiddle = !isFirst && !isLast;

                  // Logic bo góc tùy biến theo vị trí (Style giống Messenger/Zalo)
                  let borderRadiusClass = "";
                  if (isMe) {
                    // Cho chính mình (bên phải)
                    if (group.messages.length === 1)
                      borderRadiusClass = "rounded-2xl rounded-br-none";
                    else if (isFirst)
                      borderRadiusClass = "rounded-2xl rounded-br-sm mb-[2px]";
                    else if (isMiddle)
                      borderRadiusClass =
                        "rounded-2xl rounded-tr-sm rounded-br-sm mb-[2px]";
                    else if (isLast)
                      borderRadiusClass =
                        "rounded-2xl rounded-tr-sm rounded-br-none";
                  } else {
                    // Cho người khác (bên trái)
                    if (group.messages.length === 1)
                      borderRadiusClass = "rounded-2xl rounded-bl-none";
                    else if (isFirst)
                      borderRadiusClass = "rounded-2xl rounded-bl-sm mb-[2px]";
                    else if (isMiddle)
                      borderRadiusClass =
                        "rounded-2xl rounded-tl-sm rounded-bl-sm mb-[2px]";
                    else if (isLast)
                      borderRadiusClass =
                        "rounded-2xl rounded-tl-sm rounded-bl-none";
                  }

                  return (
                    <div
                      key={message.messageId}
                      className={`relative ${isMediaOnly ? "p-0" : "px-3 py-1.5"} 
        shadow-sm transition-all w-fit max-w-[85%]
        ${borderRadiusClass} 
        ${
          isMe
            ? "bg-blue-600 text-white ml-auto"
            : isDarkMode
              ? "bg-gray-800 text-white mr-auto"
              : "bg-white text-gray-800 border border-gray-200 mr-auto"
        }`}
                    >
                      {/* Nội dung tin nhắn (Voice, Media, Text) giữ nguyên... */}
                      <p className="whitespace-pre-wrap leading-tight">
                        {parsed.text || message.content}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* THỜI GIAN VÀ TRẠNG THÁI */}
              <div
                className={`flex items-center mt-0.5 text-[10px] font-medium text-gray-400`}
              >
                <span>
                  {formatMessageTime(
                    group.messages[group.messages.length - 1].createdAt,
                  )}
                </span>
                {isMe && (
                  <>
                    <span className="mx-1">•</span>
                    <span
                      className={
                        group.messages[group.messages.length - 1].isRead
                          ? "text-blue-500"
                          : ""
                      }
                    >
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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
