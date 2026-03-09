import { Card, Input, Space, Typography } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useEffect } from "react";

const { TextArea } = Input;
const { Text } = Typography;

export default function BookingContactForm({ formData, setFormData }: any) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData((prev: any) => ({
        ...prev,
        name: user.userName || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  return (
    <Card title="Thông tin đặt lịch của bạn" bordered={false}>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <>
          <Input
            prefix={<UserOutlined />}
            placeholder="Tên người đặt"
            value={formData.name}
            disabled
          />
        </>

        <>
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
          />
        </>

        <>
          <TextArea
            prefix={<FileTextOutlined />}
            placeholder="Nhập ghi chú cho chủ phòng (không bắt buộc)"
            rows={3}
            value={formData.note}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                note: e.target.value,
              }))
            }
          />
        </>
      </Space>
    </Card>
  );
}
