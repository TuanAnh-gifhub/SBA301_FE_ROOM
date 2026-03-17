import type { NotificationResponse } from "../../../services/notificationService";

const notificationHelper = (data: NotificationResponse) => {
  if (Notification.permission !== "granted") return;

  // Lấy ID người gửi từ link (ví dụ link là "/chat/123" -> lấy được "123")
  const senderId = data.link ? data.link.split("/").pop() : "default";

  // Tag theo ID người gửi cho loại CHAT
  const notificationTag =
    data.type === "CHAT"
      ? `chat-${senderId}`
      : `other-noti-${data.notificationId}`;

  const options: NotificationOptions = {
    body: data.notificationBody,
    icon: "/logo.png",
    tag: notificationTag,
    badge: "/logo.png",
    // @ts-ignore
    renotify: false,
    silent: false,
  };

  navigator.serviceWorker.getRegistrations().then(() => {
    new Notification(data.notificationTitle, options);
  });
};

export default notificationHelper;
