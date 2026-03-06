import React, { useRef, useLayoutEffect, useState } from "react";
import { type MessageResponse } from "../../../services/chats/chatService";
import { parseMessageContent } from "../../../services/upload/uploadService";
import { FaUserCircle, FaSpinner } from "react-icons/fa";

// ============ TYPE DEFINITIONS ============

export interface Message extends MessageResponse {
  sender: "user" | "other";
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  currentUserId: string | null;
  isDarkMode?: boolean;
  // Các props mới cho phân trang
  hasMore: boolean;
  loadMoreMessages: () => void;
  isFetchingMore: boolean;
}

interface MessageGroup {
  messages: Message[];
  sender: "user" | "other";
}

const MessageList = ({
  messages,
  messagesEndRef,
  currentUserId,
  isDarkMode = false,
  hasMore,
  loadMoreMessages,
  isFetchingMore,
}: MessageListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  // Logic giữ vị trí cuộn khi load tin nhắn cũ
  useLayoutEffect(() => {
    if (isFetchingMore && scrollContainerRef.current) {
      setPrevScrollHeight(scrollContainerRef.current.scrollHeight);
    }
  }, [isFetchingMore]);

  useLayoutEffect(() => {
    if (!isFetchingMore && prevScrollHeight > 0 && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages, isFetchingMore, prevScrollHeight]);

  // Nhận diện nhóm tin nhắn (Giữ nguyên logic của bạn)
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
        currentGroup = { messages: [msg], sender: senderType };
      }
    }
    grouped.push(currentGroup);
    return grouped;
  };

  const groupedMessages = groupConsecutiveMessages(messages);

  return (
    <div
      ref={scrollContainerRef}
      className={`flex-1 overflow-y-auto px-1.5 py-4 space-y-4 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* NÚT LOAD MORE TẠI ĐÂY */}
      {hasMore && (
        <div className="flex justify-center py-2">
          {isFetchingMore ? (
            <FaSpinner className="animate-spin text-blue-500" />
          ) : (
            <button
              onClick={loadMoreMessages}
              className="text-[11px] font-medium bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded-full transition-colors shadow-sm"
            >
              Xem tin nhắn cũ hơn
            </button>
          )}
        </div>
      )}

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
                  const isFirst = idx === 0;
                  const isLast = idx === group.messages.length - 1;
                  const hasImage = !!message.imageUrl;
                  const actualText = (
                    parsed.text ||
                    message.content ||
                    ""
                  ).trim();
                  const hasText = actualText.length > 0;
                  const isMediaOnly = hasImage && !hasText;

                  // Logic border-radius (Giữ nguyên của bạn)
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
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} w-full`}
                    >
                      <div
                        className={`relative transition-all w-fit max-w-[100%] ${
                          isMe ? "ml-auto" : "mr-auto"
                        } ${
                          isMediaOnly
                            ? "p-0 bg-transparent shadow-none"
                            : `px-3 py-1.5 shadow-sm ${borderRadiusClass} ${
                                isMe
                                  ? "bg-blue-600 text-white"
                                  : isDarkMode
                                    ? "bg-gray-800 text-white"
                                    : "bg-white text-gray-800 border border-gray-200"
                              }`
                        }`}
                      >
                        {hasImage && (
                          <div className={`${!isMediaOnly ? "mb-2" : ""}`}>
                            <img
                              src={message.imageUrl!}
                              alt="Attachment"
                              className={`max-w-[240px] cursor-pointer hover:opacity-95 transition-opacity shadow-md object-cover ${
                                isMediaOnly ? borderRadiusClass : "rounded-lg"
                              }`}
                              onClick={() =>
                                window.open(message.imageUrl!, "_blank")
                              }
                            />
                          </div>
                        )}
                        {hasText && (
                          <p className="whitespace-pre-wrap leading-tight text-sm">
                            {actualText}
                          </p>
                        )}
                      </div>

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
                              <span
                                className={
                                  message.status === "READ"
                                    ? "text-blue-500"
                                    : ""
                                }
                              >
                                {message.status === "READ"
                                  ? "Đã xem"
                                  : "Đã gửi"}
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
