import { Avatar, Button, Col, Input, Row, Select, Switch } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface AdminProfileProps {
  data: any;
}
const onChange = (checked: boolean) => {
  console.log(`switch to ${checked}`);
};
export default function AdminProfile({ data }: AdminProfileProps) {
  if (!data) return null;

  return (
    <div className="p-8 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar size={72} icon={<UserOutlined />} />
          <div>
            <h3 className="text-xl font-semibold">{data.name}</h3>
            <p className="text-gray-500">{data.email}</p>
          </div>
        </div>

        <Button type="primary">Edit</Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <label className="block mb-1 text-gray-600">Full Name</label>
          <Input value={data.name} disabled />
        </Col>

        <Col span={12}>
          <label className="block mb-1 text-gray-600">Email</label>
          <Input value={data.email} disabled />
        </Col>

        <Col span={12}>
          <label className="block mb-1 text-gray-600">Gender</label>
          <Select
            value={data.gender}
            disabled
            className="w-full"
            options={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
          />
        </Col>

        <Col span={12}>
          <label className="block mb-1 text-gray-600">Role</label>
          <Input value={data.role} disabled />
        </Col>

        <Col span={12}>
          <label className="block mb-1 text-gray-600">Phone</label>
          <Input value={data.phone} disabled />
        </Col>

        <Col span={12}>
          <label className="block mb-1 text-gray-600">Date of Birth</label>
          <Input value={data.dateOfBirth} disabled />
        </Col>
      </Row>

      <div className="mt-10">
        <h4 className="font-semibold mb-2">My setting</h4>

        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            Email Notifications
            <Switch
              defaultChecked
              onChange={onChange}
              style={{ marginLeft: 10 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
