import { useLocation, useNavigate } from "react-router-dom";

export default function SuccessQrPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1 style={{ color: "green" }}>Quét Thành công</h1>
      <p>{data?.message || "Quét QR thành công!"}</p>

      <button
        onClick={() => navigate("/owner/qr")}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          background: "#00c853",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Quét tiếp
      </button>
    </div>
  );
}
