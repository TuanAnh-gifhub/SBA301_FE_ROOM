import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { message } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function ScanQR() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);

  const navigate = useNavigate();

  const [isCameraOn, setIsCameraOn] = useState(true);

  // 🔒 chống spam scan theo thời gian
  const scanLockRef = useRef(false);

  // 🔁 tránh scan lại cùng 1 QR
  const lastValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isCameraOn) {
      controlsRef.current?.stop();
      return;
    }

    const codeReader = new BrowserMultiFormatReader();

    if (!videoRef.current) return;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          const token = result.getText();

          // ❌ nếu đang lock thì bỏ qua
          if (scanLockRef.current) return;

          // ❌ nếu trùng QR trước đó thì bỏ qua
          if (token === lastValueRef.current) return;

          // 🔒 lock ngay lập tức
          scanLockRef.current = true;
          lastValueRef.current = token;

          console.log("QR:", token);

          axios
            .get(token)
            .then((res) => {
              const data = res.data;
              console.log("DATA:", data);

              if (data.code === 200) {
                controlsRef.current?.stop();

                navigate("/qr-success", {
                  state: {
                    message: data.message,
                    data: data,
                  },
                });
              } else {
                toast.error(data.message);
              }
            })
            .catch((err) => {
              console.error(err);

              if (err.response?.data?.message) {
                toast.error(err.response.data.message);
              } else {
                message.error("Lỗi server");
              }
            })
            .finally(() => {
              // ⏱ mở lại scan sau 3 giây
              setTimeout(() => {
                scanLockRef.current = false;
              }, 3000);
            });
        }

        if (err && err.name !== "NotFoundException") {
          console.error(err);
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(console.error);

    return () => {
      controlsRef.current?.stop();
    };
  }, [isCameraOn, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 30 }}>
      <h2>Scan QR</h2>
      <p>Vui lòng bật camera để quét</p>

      <div
        style={{
          display: "inline-block",
          padding: 10,
          border: "2px solid #00c853",
          borderRadius: 10,
        }}
      >
        {isCameraOn ? (
          <video
            ref={videoRef}
            width="320"
            height="240"
            autoPlay
            muted
            playsInline
            style={{ borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 320,
              height: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Camera đang tắt
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, color: "#666" }}>Đưa QR vào khung để quét</p>

      <p>Nếu có lỗi vui lòng liên hệ hỗ trợ</p>

      <button
        onClick={() => setIsCameraOn(!isCameraOn)}
        style={{
          marginTop: 15,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          background: isCameraOn ? "#d32f2f" : "#00c853",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {isCameraOn ? "Tắt Camera" : "Bật Camera"}
      </button>
    </div>
  );
}
