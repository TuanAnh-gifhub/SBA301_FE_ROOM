import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaCommentDots, FaUser } from "react-icons/fa";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

import {
  getUserConversations,
  getMessages,
  sendMessage,
  getConversation,
  markMessageAsRead,
} from "../../../services/chats/chatService";

import websocketService from "../../../services/chats/websocketService";
import { tokenService } from "../../../services/auth/tokenService";

// ============ TYPE DEFINITIONS ============

interface User {
  userId: string;
  fullName?: string;
  userName?: string;
  avatar?: string;
}

interface Conversation {
  conversationId: string;
  conversationTitle?: string;
  lastMessage?: string;
  updatedAt?: string;
  sender?: User;
  recipient?: User;
  otherPerson?: User;
  // UI properties added to fix type errors
  name?: string;
  avatar?: string;
  isRead?: boolean;
  isOnline?: boolean;
  lastActive?: string;
  type?: string;
  listing?: any;
}

interface Message {
  messageId: string; // Renamed from id to match Backend and MessageList
  sender: "user" | "other";
  content: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
  isRead?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

const generateAvatarSVG = (
  name: string,
  userId: string | null = null,
): string => {
  const letter = name.charAt(0).toUpperCase();
  const color = userId
    ? `hsl(${parseInt(userId.slice(0, 8), 16) % 360}, 70%, 60%)`
    : "#10b981";
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-family="Arial">${letter}</text></svg>`;
};

const getInitialDisplayInfo = (
  sellerName: string | null,
  buyerName: string | null,
): { name: string; avatar: string } => {
  if (sellerName) {
    const name = decodeURIComponent(sellerName);
    return { name, avatar: generateAvatarSVG(name) };
  }
  return { name: "Đang tải...", avatar: generateAvatarSVG("?") };
};

const ChatBoxHome = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode] = useState(
    () => localStorage.getItem("landing_dark_mode") === "true",
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<string | null>(null);

  const getCurrentUserId = (): string | null => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo
        ? (JSON.parse(userInfo) as { userId: string }).userId
        : null;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  const conversationId = searchParams.get("conversationId");
  // const sellerName = searchParams.get("sellerName"); // Unused
  // const buyerName = searchParams.get("buyerName");   // Unused

  const loadConversationName = async (
    conversation: Conversation,
  ): Promise<Conversation> => {
    try {
      const response = (await getConversation(
        conversation.conversationId,
      )) as ApiResponse<{ sender: User; recipient: User }>;
      if (response.success && response.data) {
        const { sender, recipient } = response.data;
        const otherPerson =
          sender?.userId === currentUserId ? recipient : sender;
        const otherPersonName =
          otherPerson?.userName || otherPerson?.fullName || "Unknown User";

        const updatedConversation: Conversation = {
          ...conversation,
          name: otherPersonName,
          sender,
          recipient,
          otherPerson,
          avatar:
            otherPerson?.avatar ||
            generateAvatarSVG(otherPersonName, otherPerson?.userId || null),
        };
        setSelectedChat(updatedConversation);
        return updatedConversation;
      }
      return conversation;
    } catch (error) {
      return conversation;
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
      const token = tokenService.getAccessToken();
      const wsUrl =
        import.meta.env.VITE_WS_URL ||
        "http://localhost:8080/api/v1/rent-room/ws";

      if (!websocketService.isConnected()) {
        websocketService.connect(wsUrl, token);
      }

      // Fixed: Use correct event listener name
      websocketService.onNewMessage((data: any) => {
        const incomingMsg: Message = {
          messageId: data.messageId, // Mapped correctly
          content: data.content,
          sender: data.senderId === currentUserId ? "user" : "other",
          senderId: data.senderId,
          conversationId: data.conversationId,
          createdAt: data.createdAt,
          isRead: data.isRead,
        };

        if (currentConversationIdRef.current === incomingMsg.conversationId) {
          setMessages((prev) =>
            prev.find((m) => m.messageId === incomingMsg.messageId)
              ? prev
              : [...prev, incomingMsg],
          );
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === incomingMsg.conversationId
              ? {
                  ...conv,
                  lastMessage: incomingMsg.content,
                  updatedAt: incomingMsg.createdAt,
                }
              : conv,
          ),
        );
      });
    }
    return () => websocketService.disconnect();
  }, [currentUserId]);

  const loadConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const response = (await getUserConversations(currentUserId)) as ApiResponse<
      Conversation[]
    >;
    if (response.success) setConversations(response.data || []);
    setLoading(false);
  };

  const loadMessages = async (id: string) => {
    currentConversationIdRef.current = id;
    const response = (await getMessages(id)) as ApiResponse<any[]>;
    if (response.success && response.data) {
      const transformed = response.data.map((msg) => ({
        messageId: msg.messageId, // Mapped correctly
        sender: msg.senderId === currentUserId ? "user" : "other",
        content: msg.content,
        createdAt: msg.createdAt,
        senderId: msg.senderId,
        conversationId: id,
        isRead: msg.isRead,
      }));
      setMessages(transformed as Message[]);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      const recipientId = selectedChat.otherPerson?.userId;
      if (!recipientId) {
        setError("Không tìm thấy người nhận");
        return;
      }

      const messagePayload = {
        senderId: currentUserId,
        recipientId: recipientId,
        content: newMessage.trim(),
        conversationId: selectedChat.conversationId,
      };

      if (websocketService.isConnected()) {
        websocketService.send("/app/chat", messagePayload);
        setNewMessage("");
      } else {
        // Fixed: Passed all 4 required arguments
        const response = await sendMessage(
          selectedChat.conversationId,
          currentUserId || "",
          recipientId,
          newMessage.trim(),
        );
        if (response.success) setNewMessage("");
      }
    }
  };

  const handleChatSelect = async (chat: Conversation) => {
    const id = chat.conversationId;
    currentConversationIdRef.current = id;
    setSelectedChat(chat);
    await loadMessages(id);
    if (!chat.name) await loadConversationName(chat);
  };

  return (
    <div
      className={`h-screen flex overflow-hidden ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}
      style={{ height: "calc(100vh - 68px)" }}
    >
      <ChatList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        settingsMenuRef={settingsMenuRef}
        conversations={conversations}
        loading={loading}
        error={error}
        isDarkMode={isDarkMode}
      />
      <div className="flex-1 flex flex-col h-full">
        {selectedChat ? (
          <>
            <ChatHeader selectedChat={selectedChat} isDarkMode={isDarkMode} />
            <MessageList
              messages={messages}
              messagesEndRef={messagesEndRef}
              isDarkMode={isDarkMode}
            />
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              isRecording={isRecording}
              onVoiceRecord={() => setIsRecording(!isRecording)}
              onFileSelect={() => {}}
              onRemoveFile={() => {}}
              onRemoveImagePreview={() => {}}
              onClearAllFiles={() => {}}
              isDarkMode={isDarkMode}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FaCommentDots className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
            <Link
              to="/"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBoxHome;
