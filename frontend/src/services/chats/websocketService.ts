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

    // Trong hàm connect của WebSocketService.ts
    this.stompClient.connect(headers, (frame: any) => {
      // Lấy userId thực tế mà Server vừa trả về trong frame (nếu có) hoặc dùng từ token
      console.log(
        "✅ Kết nối thành công! User Principal:",
        frame.headers["user-name"],
      );

      // THỬ NGHIỆM: Subscribe trực tiếp vào queue của User
      // Thay vì "/user/queue/messages", hãy thử subscribe đường dẫn mà Spring thực sự gửi:
      this.stompClient.subscribe("/user/queue/messages", (message: any) => {
        console.log("📩 ĐÃ NHẬN ĐƯỢC TIN NHẮN!");
        console.log("Nội dung:", message.body);

        if (message.body) {
          const data = JSON.parse(message.body);
          this.newMessageListeners.forEach((callback) => callback(data));
        }
      });
    });
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
