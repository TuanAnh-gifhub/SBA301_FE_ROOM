import React from "react";
import { Tag } from "antd";
import type { PostStatus } from "../../../services/posts/posts";

const baseClass = "!rounded-full !px-3 !py-1 !font-medium !border-0";

const PostStatusTag: React.FC<{ status: PostStatus }> = ({ status }) => {
  switch (status) {
    case "PENDING":
      return (
        <Tag className={baseClass + " !bg-amber-100 !text-amber-700"}>
          Chờ duyệt
        </Tag>
      );
    case "PUBLISHED":
      return (
        <Tag className={baseClass + " !bg-emerald-100 !text-emerald-700"}>
          Đã đăng
        </Tag>
      );
    case "HIDDEN":
      return (
        <Tag className={baseClass + " !bg-slate-200 !text-slate-700"}>
          Đang ẩn
        </Tag>
      );
    default:
      return <Tag className={baseClass}>{status}</Tag>;
  }
};

export default PostStatusTag;
