import SockJS from "sockjs-client";
import Stomp from "stompjs";

class WebSocketService {
  private stompClient: any = null;
  private socket: any = null;
  private newMessageCallback: ((data: any) => void) | null = null;
  private readReceiptCallback: ((messageId: string) => void) | null = null;

  connect(url: string, token: string | null = null): void {
    this.socket = new SockJS(url);
    this.stompClient = Stomp.over(this.socket);
    this.stompClient.debug = () => {}; // Tắt log rác nếu muốn

    const headers = { Authorization: `Bearer ${token}` };

    this.stompClient.connect(
      headers,
      (frame: any) => {
        console.log("✅ Connected to STOMP");

        // 1. Nhận tin nhắn mới
        this.stompClient.subscribe("/user/queue/messages", (message: any) => {
          if (message.body && this.newMessageCallback) {
            this.newMessageCallback(JSON.parse(message.body));
          }
        });

        // 2. Nhận thông báo "Đã xem" (Read Receipt)
        this.stompClient.subscribe(
          "/user/queue/read-receipts",
          (message: any) => {
            if (message.body && this.readReceiptCallback) {
              this.readReceiptCallback(message.body); // message.body là messageId
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

  onNewMessage(callback: (data: any) => void): void {
    this.newMessageCallback = callback;
  }

  onReadReceipt(callback: (messageId: string) => void): void {
    this.readReceiptCallback = callback;
  }

  disconnect(): void {
    if (this.stompClient) this.stompClient.disconnect();
  }

  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
