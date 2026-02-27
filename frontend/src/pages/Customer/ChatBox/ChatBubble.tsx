import { useState, useEffect, useRef } from "react";
import { FaTimes, FaMinus, FaCommentDots, FaArrowLeft } from "react-icons/fa";

import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

import chatService, {
  type ConversationResponse,
  type MessageResponse,
} from "../../../services/chats/chatService";

import websocketService from "../../../services/chats/websocketService";
import { useUnreadMessages } from "../../../hooks/useUnreadMessages";
import { useAuth } from "../../../context/AuthContext";

/* ================= TYPES ================= */

// ChatBubble.tsx
interface User {
  userId: string;
  userName: string;
}

interface Conversation extends ConversationResponse {
  otherPerson?: User;
}

interface Message extends MessageResponse {
  sender: "user" | "other";
  isRead: boolean;
}

/* ================= COMPONENT ================= */

const ChatBubble = () => {
  const { unreadCount } = useUnreadMessages(10000);
  const { user } = useAuth();
  const currentUserId = user?.userId || null;

  /* ---------- UI STATE ---------- */

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  /* ---------- DATA STATE ---------- */

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  /* ---------- INPUT STATE ---------- */

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const isOpenRef = useRef(isOpen);
  const showChatListRef = useRef(showChatList);
  const currentConversationIdRef = useRef(selectedChat?.conversationId || null);

  /* ================= LOAD CONVERSATIONS ================= */

  const loadConversations = async () => {
    if (!currentUserId) return;

    setLoading(true);
    const res = await chatService.getUserConversations(currentUserId);

    if (res.result && Array.isArray(res.result)) {
      const mapped: Conversation[] = res.result.map((c) => {
        // logic xác định người đối diện dựa trên user1 và user2 từ backend
        const other = c.user1.userId === currentUserId ? c.user2 : c.user1;
        return {
          ...c,
          // Chuyển đổi id sang userId để tương thích với các component cũ nếu cần
          otherPerson: {
            userId: other.userId,
            userName: other.userName,
          },
        };
      });
      setConversations(mapped);
    }
    setLoading(false);
  };

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (id: string) => {
    currentConversationIdRef.current = id;
    const res = await chatService.getMessages(id);

    if (res.result) {
      const transformed: Message[] = res.result.map((msg) => ({
        ...msg,
        sender: msg.senderId === currentUserId ? "user" : "other",
        isRead: msg.status === "READ",
      }));
      setMessages(transformed);
    }
  };

  /* ================= WEBSOCKET ================= */

  useEffect(() => {
    if (!currentUserId || window.location.pathname === "/chat") return;

    loadConversations();

    const unsubscribeNewMsg = websocketService.onNewMessage((data: any) => {
      const isCurrentChat =
        currentConversationIdRef.current === data.conversationId;

      const isWatchingChat =
        isCurrentChat && isOpenRef.current && !showChatListRef.current;

      if (isCurrentChat) {
        const incoming: Message = {
          messageId: data.messageId,
          senderId: data.senderId,
          conversationId: data.conversationId,
          sender: data.senderId === currentUserId ? "user" : "other",
          content: data.content,
          createdAt: data.createdAt,
          isRead: data.senderId === currentUserId ? false : isWatchingChat,
          senderName: "",
          status:
            data.senderId === currentUserId
              ? "SENT"
              : isWatchingChat
                ? "READ"
                : "SENT",
        };

        setMessages((prev) => {
          const isExisting = prev.some(
            (m) => m.messageId === incoming.messageId,
          );
          if (isExisting) return prev;

          const filtered = prev.filter(
            (m) =>
              !m.messageId.startsWith("temp-") ||
              m.content !== incoming.content,
          );
          return [
            ...prev.filter((m) => !m.messageId.startsWith("temp-")),
            incoming,
          ];
        });

        if (isWatchingChat && data.senderId !== currentUserId) {
          chatService.markMessageAsRead(data.conversationId, currentUserId!);
        }
      }
      loadConversations();
    });

    const unsubscribeReadReceipt = websocketService.onReadReceipt(
      (data: any) => {
        if (
          String(currentConversationIdRef.current) ===
          String(data.conversationId)
        ) {
          setMessages((prev) => {
            // Duyệt và cập nhật, đảm bảo trả về Message[]
            const updatedMessages: Message[] = prev.map((m) => {
              if (m.sender === "user") {
                return { ...m, isRead: true, status: "READ" };
              }
              return m;
            });
            return updatedMessages;
          });
        }
        loadConversations();
      },
    );

    return () => {
      unsubscribeNewMsg();
      unsubscribeReadReceipt();
    };
  }, [user?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !selectedChat) return;

    const recipientId =
      selectedChat.user1.userId === currentUserId
        ? selectedChat.user2.userId
        : selectedChat.user1.userId;

    if (!recipientId) {
      console.error("Không tìm thấy ID người nhận");
      return;
    }

    // 1. Tạo đối tượng tin nhắn tạm thời
    const tempMessage: Message = {
      messageId: `temp-${Date.now()}`,
      senderId: currentUserId,
      conversationId: selectedChat.conversationId || "",
      sender: "user",
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
      senderName: user?.userName || "",
      status: "SENT",
    };

    try {
      if (websocketService.isConnected()) {
        const messagePayload = {
          conversationId: selectedChat.conversationId || null,
          senderId: currentUserId,
          recipientId: recipientId,
          content: newMessage.trim(),
        };

        // 2. Gửi qua socket
        websocketService.send("/app/chat", messagePayload);

        // 3. CẬP NHẬT UI NGAY LẬP TỨC
        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage(""); // Xóa ô input

        if (selectedChat.conversationId === null) {
          setTimeout(() => {
            loadConversations();
            // Tùy chọn: Bạn có thể viết thêm logic để tự động
            // chuyển selectedChat sang ID thật vừa tạo
          }, 500);
        }
      } else {
        console.error("Chưa kết nối WebSocket!");
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    showChatListRef.current = showChatList;
  }, [showChatList]);

  useEffect(() => {
    currentConversationIdRef.current = selectedChat?.conversationId || null;
  }, [selectedChat]);

  // ChatBubble.tsx
  useEffect(() => {
    const handleOpenChatFromExternal = async (event: any) => {
      const { userId, userName } = event.detail;

      setIsOpen(true);
      setIsMinimized(false);

      // 1. Tìm xem đã có hội thoại với người này chưa
      const existingChat = conversations.find(
        (c) => c.user1.userId === userId || c.user2.userId === userId,
      );

      if (existingChat) {
        handleChatSelect(existingChat);
      } else {
        // 2. Tạo hội thoại tạm thời (Lúc này Interface đã gọn nên không còn lỗi)
        const fakeConversation: Conversation = {
          conversationId: null,
          user1: { userId: currentUserId!, userName: user?.userName || "" },
          user2: { userId: userId, userName: userName },
          otherPerson: { userId: userId, userName: userName },
          lastMessage: "",
          lastSenderName: "",
          updatedAt: new Date().toISOString(),
        };

        setSelectedChat(fakeConversation);
        setShowChatList(false);
        setMessages([]);
      }
    };

    window.addEventListener("OPEN_CHAT_WITH_USER", handleOpenChatFromExternal);
    return () =>
      window.removeEventListener(
        "OPEN_CHAT_WITH_USER",
        handleOpenChatFromExternal,
      );
  }, [conversations, currentUserId, user]);

  /* ================= CHAT SELECT ================= */

  const handleChatSelect = async (chat: Conversation) => {
    currentConversationIdRef.current = chat.conversationId;

    setSelectedChat(chat);
    setShowChatList(false);
    if (chat.conversationId) {
      await loadMessages(chat.conversationId);
      await chatService.markMessageAsRead(chat.conversationId, currentUserId!);
      loadConversations();
    }
  };

  if (window.location.pathname === "/chat") return null;

  /* ================= UI ================= */

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center relative"
          >
            <FaCommentDots size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border ${
            isMinimized ? "w-72 h-14" : "w-[340px] h-[520px]"
          }`}
        >
          <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* NÚT BACK CHỈ HIỆN KHI ĐANG MỞ CHAT CHI TIẾT */}
              {!showChatList && (
                <button
                  onClick={() => setShowChatList(true)}
                  className="hover:bg-blue-700 p-1 rounded-full transition-colors"
                >
                  <FaArrowLeft size={14} />
                </button>
              )}
              <span className="font-semibold truncate max-w-[18s0px]">
                {showChatList
                  ? "Đoạn chat"
                  : selectedChat?.otherPerson?.userName || "Người dùng1"}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)}>
                <FaMinus size={12} />
              </button>
              <button onClick={() => setIsOpen(false)}>
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {showChatList ? (
                <ChatList
                  conversations={conversations}
                  selectedChat={selectedChat}
                  onChatSelect={handleChatSelect}
                  loading={loading}
                  error={null}
                  // Truyền thêm các props này để tránh lỗi undefined.trim()
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <MessageList
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                    currentUserId={currentUserId}
                  />

                  <MessageInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    onSendMessage={handleSendMessage}
                    selectedFiles={[]}
                    setSelectedFiles={() => {}}
                    imagePreview={null}
                    setImagePreview={() => {}}
                    isRecording={false}
                    onVoiceRecord={() => {}}
                    onFileSelect={() => {}}
                    onRemoveFile={() => {}}
                    onRemoveImagePreview={() => {}}
                    onClearAllFiles={() => {}}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBubble;
