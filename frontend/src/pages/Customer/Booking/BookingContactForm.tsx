import { Card, Input, Space } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export default function BookingContactForm({ intent }: any) {
  return (
    <Card title="Thông tin đặt lịch của bạn" bordered={false}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Input
          prefix={<UserOutlined />}
          value={intent?.userName || ""}
          disabled
        />

        <Input
          prefix={<PhoneOutlined />}
          value={intent?.userPhone || ""}
          disabled
        />

        <TextArea
          prefix={<FileTextOutlined />}
          rows={3}
          value={intent?.note || "Không có ghi chú"}
          disabled
        />
      </Space>
    </Card>
  );
}
