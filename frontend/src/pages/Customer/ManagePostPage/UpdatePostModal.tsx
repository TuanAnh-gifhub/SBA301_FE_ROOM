import React, { useEffect } from "react";
import { Form, Input, Modal, Skeleton, message } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import postsService, {
  type PostSummaryResponse,
} from "../../../services/posts/posts";

type Props = {
  open: boolean;
  initial: PostSummaryResponse | null;
  onClose: () => void;
  onUpdated: () => void;
};

const UpdatePostModal: React.FC<Props> = ({
  open,
  initial,
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  useEffect(() => {
    if (!open || !initial) return;

    form.resetFields();

    (async () => {
      try {
        setLoadingDetail(true);
        const res = await postsService.getMyPostDetail(initial.postId);
        form.setFieldsValue({
          title: res.result?.title,
          content: res.result?.content,
        });
      } catch (e) {
        console.error(e);
        message.error("Không tải được dữ liệu chi tiết tin đăng");
      } finally {
        setLoadingDetail(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.postId]);

  const onSubmit = async () => {
    if (!initial) return;

    try {
      const values = await form.validateFields();
      setSaving(true);

      await postsService.updateMyPost(initial.postId, {
        title: values.title,
        content: values.content,
      });

      message.success("Cập nhật tin đăng thành công");
      onUpdated();
    } catch (e: any) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      confirmLoading={saving}
      destroyOnClose
      width={720}
      className="[&_.ant-modal-content]:!rounded-3xl [&_.ant-modal-content]:!p-0 [&_.ant-modal-header]:!hidden"
      okButtonProps={{ className: "!rounded-xl !h-10 !font-semibold" }}
      cancelButtonProps={{ className: "!rounded-xl !h-10" }}
    >
      <div className="overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-5 md:px-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <EditOutlined className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Chỉnh sửa tin đăng
              </h2>
              <p className="mt-1 text-sm text-white/85">
                Cập nhật nội dung để bài viết rõ ràng và thu hút hơn
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 md:px-7">
          {initial && (
            <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <InfoCircleOutlined className="mt-0.5 text-violet-500" />
                <div>
                  Đang chỉnh sửa bài viết cho phòng{" "}
                  <b>{initial.roomName || "Không xác định"}</b>.
                </div>
              </div>
            </div>
          )}

          {loadingDetail ? (
            <div className="py-2">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : (
            <Form form={form} layout="vertical" requiredMark={false}>
              <Form.Item
                name="title"
                label={
                  <span className="font-medium text-slate-700">Tiêu đề</span>
                }
                rules={[
                  { required: true, message: "Nhập tiêu đề" },
                  { max: 150, message: "Tối đa 150 ký tự" },
                ]}
              >
                <Input
                  prefix={<FileTextOutlined className="text-slate-400" />}
                  placeholder="Nhập tiêu đề mới cho tin đăng"
                  className="!h-11 !rounded-xl"
                  maxLength={150}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="content"
                label={
                  <span className="font-medium text-slate-700">Nội dung</span>
                }
                rules={[{ required: true, message: "Nhập nội dung" }]}
              >
                <Input.TextArea
                  rows={7}
                  placeholder="Cập nhật mô tả chi tiết cho tin đăng..."
                  className="!rounded-xl"
                  maxLength={2000}
                  showCount
                />
              </Form.Item>
            </Form>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UpdatePostModal;
