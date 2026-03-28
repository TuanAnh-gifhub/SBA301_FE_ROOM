import React, { useState } from "react";
import { Form, Input, Button, Card, message, Space, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import notificationService, { type BroadcastRequest } from "../../../services/notificationService";

const { Title, Text } = Typography;

const NotificationManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: BroadcastRequest) => {
    try {
      setLoading(true);
      await notificationService.broadcastNotification(values);
      message.success("Đã gửi thông báo đến toàn bộ người dùng thành công!");
      form.resetFields(); // Xóa form sau khi gửi xong
    } catch (error: any) {
      console.error("Broadcast error:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi thông báo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Card
        title={
          <Space>
            <SendOutlined style={{ color: "#1890ff" }} />
            <Title level={4} style={{ margin: 0 }}>
              Gửi thông báo hệ thống
            </Title>
          </Space>
        }
        bordered={false}
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
          Sử dụng tính năng này để gửi thông báo đồng loạt đến <b>tất cả</b> người dùng trong hệ thống (chủ phòng & người thuê).
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề!" },
              { max: 100, message: "Tiêu đề không được vượt quá 100 ký tự" },
            ]}
          >
            <Input placeholder="VD: Thông báo bảo trì hệ thống Edu Room" size="large" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung thông báo"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung!" },
              { max: 500, message: "Nội dung không được vượt quá 500 ký tự" },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập nội dung chi tiết muốn truyền đạt đến người dùng..."
              rows={5}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="link"
            label="Đường dẫn (Link đính kèm nếu có)"
            rules={[
              { type: "url", message: "Vui lòng nhập một đường dẫn hợp lệ (VD: https://...)" },
            ]}
          >
            <Input placeholder="VD: https://localhost:5173/news" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SendOutlined />}
              loading={loading}
            >
              Phát thông báo ngay
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NotificationManagement;