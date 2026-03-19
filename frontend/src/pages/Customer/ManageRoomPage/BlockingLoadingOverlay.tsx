import React from "react";
import ReactDOM from "react-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
};

const BlockingLoadingOverlay: React.FC<Props> = ({
  open,
  title = "Đang xử lý",
  description = "Vui lòng đợi trong giây lát...",
}) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "92%",
          maxWidth: 460,
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          border: "1px solid #e2e8f0",
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            margin: "0 auto 20px",
            width: 84,
            height: 84,
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #e0f2fe, #dbeafe)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 2px 10px rgba(255,255,255,0.8)",
          }}
        >
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 34,
                  color: "#1677ff",
                }}
                spin
              />
            }
          />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.7,
            color: "#64748b",
          }}
        >
          {description}
        </div>

        <div
          style={{
            marginTop: 20,
            height: 8,
            width: "100%",
            overflow: "hidden",
            borderRadius: 999,
            background: "#e2e8f0",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "40%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #1677ff 0%, #60a5fa 50%, #1677ff 100%)",
              animation: "blocking-loading-bar 1.4s ease-in-out infinite",
            }}
          />
        </div>

        <style>
          {`
            @keyframes blocking-loading-bar {
              0% {
                transform: translateX(-90%);
              }
              50% {
                transform: translateX(180%);
              }
              100% {
                transform: translateX(-90%);
              }
            }
          `}
        </style>
      </div>
    </div>,
    document.body,
  );
};

export default BlockingLoadingOverlay;
