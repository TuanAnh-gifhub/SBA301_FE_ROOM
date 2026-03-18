import React, { useMemo, useState } from "react";
import { Button, Drawer, Tag } from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { RentalAreaResponse } from "../../../services/rental-areas/rentalAreas";
import RoomCardList from "./RoomCardList";
import CreateRoomModal from "./CreateRoomModal";

type Props = {
  open: boolean;
  rentalArea: RentalAreaResponse | null;
  openCreateRoom?: boolean;
  onClose: () => void;
};

const statusColor = (s?: string) => {
  if (s === "ACTIVE") return "green";
  if (s === "INACTIVE") return "default";
  if (s === "SUSPENDED") return "volcano";
  return "blue";
};

const RentalAreaRoomsDrawer: React.FC<Props> = ({
  open,
  rentalArea,
  openCreateRoom,
  onClose,
}) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  React.useEffect(() => {
    if (open && openCreateRoom) {
      setCreateOpen(true);
    }
  }, [open, openCreateRoom]);

  const summary = useMemo(() => {
    if (!rentalArea) return null;

    return [
      {
        icon: <EnvironmentOutlined style={{ color: "#1677ff" }} />,
        label: "Địa chỉ",
        value: rentalArea.address || "—",
      },
      {
        icon: <UserOutlined style={{ color: "#7c3aed" }} />,
        label: "Người liên hệ",
        value: rentalArea.contactName || "—",
      },
      {
        icon: <PhoneOutlined style={{ color: "#059669" }} />,
        label: "SĐT liên hệ",
        value: rentalArea.contactPhone || "—",
      },
    ];
  }, [rentalArea]);

  const closeCreate = () => setCreateOpen(false);

  return (
    <Drawer
      title={null}
      open={open}
      width={1120}
      onClose={onClose}
      destroyOnClose
      styles={{
        body: {
          padding: 20,
          background: "#f8fafc",
        },
      }}
    >
      {!rentalArea ? null : (
        <>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-[#eff6ff] via-white to-[#f8fafc] border-b border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-[#1677ff]/10 flex items-center justify-center">
                      <HomeOutlined
                        style={{ color: "#1677ff", fontSize: 20 }}
                      />
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-slate-800">
                        {rentalArea.rentalAreaName}
                      </div>
                      <div className="text-sm text-slate-500">
                        Quản lý phòng học trong tòa nhà
                      </div>
                    </div>
                    <Tag color={statusColor(rentalArea.status)}>
                      {rentalArea.status}
                    </Tag>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  className="rounded-xl"
                  onClick={() => setCreateOpen(true)}
                >
                  Thêm phòng mới
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                {summary?.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="mt-1 font-medium text-slate-800 line-clamp-2">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-lg font-semibold text-slate-800">
                    Danh sách phòng học
                  </div>
                  <div className="text-sm text-slate-500">
                    Theo dõi, chỉnh sửa và cập nhật trạng thái phòng học
                  </div>
                </div>
              </div>

              <RoomCardList
                key={refreshKey}
                rentalAreaId={rentalArea.rentalAreaId}
                onChanged={() => setRefreshKey((x) => x + 1)}
              />
            </div>
          </div>

          <CreateRoomModal
            open={createOpen}
            rentalAreaId={rentalArea.rentalAreaId}
            onClose={closeCreate}
            onCreated={() => {
              closeCreate();
              setRefreshKey((x) => x + 1);
            }}
          />
        </>
      )}
    </Drawer>
  );
};

export default RentalAreaRoomsDrawer;
