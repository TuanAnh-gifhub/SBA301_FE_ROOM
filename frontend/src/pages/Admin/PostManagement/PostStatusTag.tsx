import React from "react";
import { Tag } from "antd";
import type { PostStatus } from "../../../services/posts/posts";

const PostStatusTag: React.FC<{ status: PostStatus }> = ({ status }) => {
  switch (status) {
    case "PENDING":
      return <Tag color="gold">Chờ duyệt</Tag>;
    case "PUBLISHED":
      return <Tag color="green">Đã đăng</Tag>;
    case "HIDDEN":
      return <Tag>Đang ẩn</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

export default PostStatusTag;
