import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Popconfirm, message, Space, Rate } from "antd";
import reviewService from "../../../services/reviews/reviewService"; 
import type { ReviewResponse, ReviewStatus } from "../../../types/review"; 

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAllReviewsAdmin(); 
      
      // LƯU Ý LẤY DATA:
      // Tuỳ thuộc vào cấu trúc ApiResponse và PageResponse của bạn.
      // Thường thì nó sẽ lồng nhau dạng: res.result.data (nếu dùng ApiResponse -> PageResponse)
      const dataList = res.result?.data || res.data?.data || res.data?.content || res.data || [];
      
      setReviews(dataList); 
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách đánh giá. Vui lòng kiểm tra lại API.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: ReviewStatus) => {
    try {
      await reviewService.updateStatus(reviewId, newStatus);
      message.success(`Đã cập nhật trạng thái thành: ${newStatus}`);
      fetchReviews();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      message.success("Đã xóa đánh giá thành công!");
      fetchReviews();
    } catch (error) {
      message.error("Lỗi khi xóa đánh giá!");
    }
  };

  const columns = [
    {
      title: "Mã Review",
      dataIndex: "reviewId",
      key: "reviewId",
      render: (text: string) => <span className="text-gray-500 font-mono">{text?.slice(0, 8)}...</span>,
    },
    // ĐÃ THÊM: Cột Người Đánh Giá (Trỏ vào object reviewer -> userName)
    {
      title: "Người Đánh Giá",
      dataIndex: ["reviewer", "userName"], 
      key: "reviewerName",
      render: (text: string) => <span className="font-semibold">{text || "Ẩn danh"}</span>,
    },
    {
      title: "Số Sao",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => <Rate disabled defaultValue={rating} className="text-sm" />,
    },
    // ĐÃ SỬA: dataIndex từ "content" thành "comment"
    {
      title: "Nội Dung",
      dataIndex: "comment", 
      key: "comment",
      width: "35%",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = status === "APPROVED" ? "green" : status === "HIDDEN" ? "red" : "gold";
        return <Tag color={color}>{status || "PENDING"}</Tag>;
      },
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_: any, record: ReviewResponse) => (
        <Space size="middle">
          {record.status !== "APPROVED" && (
            <Button size="small" type="primary" onClick={() => handleUpdateStatus(record.reviewId, "APPROVED" as ReviewStatus)}>
              Duyệt
            </Button>
          )}
          {record.status !== "HIDDEN" && (
            <Button size="small" danger onClick={() => handleUpdateStatus(record.reviewId, "HIDDEN" as ReviewStatus)}>
              Ẩn
            </Button>
          )}

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đánh giá này không?"
            onConfirm={() => handleDelete(record.reviewId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger type="text">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đánh Giá (Reviews)</h1>
        <Button onClick={fetchReviews} loading={loading}>Làm mới</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={reviews} 
        rowKey="reviewId" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}