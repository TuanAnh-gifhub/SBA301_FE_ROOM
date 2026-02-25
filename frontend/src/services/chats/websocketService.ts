import SockJS from "sockjs-client";
import Stomp from "stompjs";

class WebSocketService {
  private stompClient: any = null;
  private socket: any = null;

  // Sửa thành Mảng để lưu nhiều callback
  private newMessageListeners: ((data: any) => void)[] = [];
  private readReceiptListeners: ((messageId: string) => void)[] = [];
  private connectedCallback: (() => void) | null = null;

  connect(url: string, token: string | null = null): void {
    if (this.isConnected()) return;

    this.socket = new SockJS(url);
    this.stompClient = Stomp.over(this.socket);
    this.stompClient.debug = (str: string) => {
      console.log("📡 STOMP Thô:", str); // Nó sẽ log mọi gói tin gửi/nhận lên Console
    };
    const headers = { Authorization: `Bearer ${token}` };

    this.stompClient.connect(
      headers,
      (frame: any) => {
        console.log("✅ Connected to STOMP");
        if (this.connectedCallback) this.connectedCallback();

        // 1. Nhận tin nhắn mới - Duyệt mảng để chạy TẤT CẢ các bên đang nghe
        this.stompClient.subscribe("/user/queue/messages", (message: any) => {
          console.log("📩 Đã nhận tin nhắn tại Service:", message.body); // LOG NÀY QUAN TRỌNG NHẤT
          if (message.body) {
            const data = JSON.parse(message.body);
            console.log(
              "🔍 Số lượng listener đang nghe:",
              this.newMessageListeners.length,
            );
            this.newMessageListeners.forEach((callback) => callback(data));
          }
        });

        // 2. Nhận thông báo "Đã xem"
        this.stompClient.subscribe(
          "/user/queue/read-receipts",
          (message: any) => {
            if (message.body) {
              this.readReceiptListeners.forEach((callback) =>
                callback(message.body),
              );
            }
          },
        );
      },
      (error: any) => {
        console.error("❌ STOMP error:", error);
      },
    );
  }

  send(destination: string, payload: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(payload));
    }
  }

  // Đăng ký và trả về hàm để hủy đăng ký (Tránh rò rỉ bộ nhớ)
  onNewMessage(callback: (data: any) => void) {
    this.newMessageListeners.push(callback);
    return () => {
      this.newMessageListeners = this.newMessageListeners.filter(
        (l) => l !== callback,
      );
    };
  }

  onReadReceipt(callback: (messageId: string) => void) {
    this.readReceiptListeners.push(callback);
    return () => {
      this.readReceiptListeners = this.readReceiptListeners.filter(
        (l) => l !== callback,
      );
    };
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log("Disconnected");
      });
      this.stompClient = null;
    }
  }

  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }

  onConnected(callback: () => void) {
    this.connectedCallback = callback;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
