import { useState, useEffect, useRef } from "react";
import chatService from "../../../services/chats/chatService";
import websocketService from "../../../services/chats/websocketService";

export const useChat = (
  currentUserId: string | null,
  isChatActiveRef: React.MutableRefObject<boolean>,
) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const res = await chatService.getUserConversations(currentUserId);
    if (res.result && Array.isArray(res.result)) {
      const mapped = res.result.map((c: any) => {
        const other = c.user1?.userId === currentUserId ? c.user2 : c.user1;
        return {
          ...c,
          otherPerson: { userId: other.userId, userName: other.userName },
        };
      });
      setConversations(mapped);
    }
    setLoading(false);
  };

  const loadMessages = async (id: string) => {
    currentConversationIdRef.current = id;
    const res = await chatService.getMessages(id);
    if (res.result && Array.isArray(res.result)) {
      const transformed = res.result.map((msg: any) => ({
        ...msg,
        sender: msg.senderId === currentUserId ? "user" : "other",
        isRead: msg.status === "READ",
      }));
      setMessages(transformed);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    loadConversations();

    const unsubscribeNewMsg = websocketService.onNewMessage((data: any) => {
      const isCurrentChat =
        String(currentConversationIdRef.current) ===
        String(data.conversationId);
      const isWatchingChat = isCurrentChat && isChatActiveRef.current;
      const isMe = data.senderId === currentUserId;

      if (isCurrentChat) {
        const incoming = {
          ...data,
          messageId: data.messageId || `msg-${Date.now()}`,
          sender: isMe ? "user" : "other",
          isRead: isMe ? false : isWatchingChat,
          status: isMe ? "SENT" : isWatchingChat ? "READ" : "SENT",
        };

        setMessages((prev) => {
          const isExisting = prev.some(
            (m) => m.messageId === incoming.messageId,
          );
          if (isExisting) return prev;
          const filtered = prev.filter(
            (m) =>
              !(
                m.messageId.startsWith("temp-") &&
                m.content === incoming.content
              ),
          );
          return [...filtered, incoming];
        });

        if (isWatchingChat && !isMe) {
          chatService.markMessageAsRead(data.conversationId, currentUserId);
        }
      }
      loadConversations(); // Cập nhật last message
    });

    const unsubscribeReadReceipt = websocketService.onReadReceipt(
      (data: any) => {
        if (
          String(currentConversationIdRef.current) ===
          String(data.conversationId)
        ) {
          setMessages((prev) =>
            prev.map((m) =>
              m.sender === "user" ? { ...m, isRead: true, status: "READ" } : m,
            ),
          );
        }
        loadConversations();
      },
    );

    return () => {
      unsubscribeNewMsg();
      unsubscribeReadReceipt();
    };
  }, [currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (!selectedChat || !currentUserId) return;

    const recipientId = selectedChat.otherPerson?.userId;
    if (!recipientId) return;

    if (selectedFiles.length > 0 && selectedFiles[0]) {
      try {
        const formData = new FormData();
        const messageData = {
          content: newMessage.trim(),
          recipientId,
          conversationId: selectedChat.conversationId,
        };
        formData.append(
          "data",
          new Blob([JSON.stringify(messageData)], { type: "application/json" }),
        );
        if (selectedFiles[0].file) {
          formData.append("file", selectedFiles[0].file);
        }
        await chatService.sendMessageWithImage(formData);
        setNewMessage("");
        setSelectedFiles([]);
      } catch (err) {
        console.error("Lỗi gửi ảnh:", err);
      }
    } else {
      const content = newMessage.trim();
      const tempMessage = {
        messageId: `temp-${Date.now()}`,
        senderId: currentUserId,
        conversationId: selectedChat.conversationId,
        sender: "user",
        content,
        createdAt: new Date().toISOString(),
        isRead: false,
        status: "SENT",
      };

      if (websocketService.isConnected()) {
        websocketService.send("/app/chat", {
          senderId: currentUserId,
          recipientId,
          content,
          conversationId: selectedChat.conversationId,
        });
        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");
      }
    }
  };

  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    currentConversationIdRef.current = chat.conversationId;
    if (chat.conversationId) {
      await loadMessages(chat.conversationId);
      await chatService.markMessageAsRead(chat.conversationId, currentUserId!);
      loadConversations();
    }
  };

  return {
    conversations,
    messages,
    selectedChat,
    setSelectedChat,
    setMessages,
    newMessage,
    setNewMessage,
    selectedFiles,
    setSelectedFiles,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    loading,
    messagesEndRef,
    handleSendMessage,
    handleChatSelect,
  };
};
