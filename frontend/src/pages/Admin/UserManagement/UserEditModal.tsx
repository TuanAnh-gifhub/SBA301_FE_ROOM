import { Form, Input, Select, DatePicker, Row, Col, Divider } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const CreateUserForm = () => {
  return (
    <Form layout="vertical" className="mt-4">
      <Row gutter={16}>
        {/* Nhóm 1: Thông tin tài khoản */}
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="example@gmail.com"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>
        </Col>

        {/* Nhóm 2: Thông tin định danh */}
        <Col span={12}>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập họ và tên"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
        </Col>

        {/* Nhóm 3: Phân quyền và Đặc điểm */}
        <Col span={24}>
          <Divider style={{ margin: "12px 0" }} />
        </Col>

        <Col span={12}>
          <Form.Item label="Vai trò" name="role" rules={[{ required: true }]}>
            <Select placeholder="Chọn vai trò">
              <Select.Option value="ADMIN">Quản trị viên</Select.Option>
              <Select.Option value="OWNER">Chủ xe</Select.Option>
              <Select.Option value="RENTER">Khách thuê</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Giới tính" name="gender">
            <Select placeholder="Chọn giới tính">
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default CreateUserForm;
