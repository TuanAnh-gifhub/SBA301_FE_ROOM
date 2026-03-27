import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const PageHeader: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  actionText,
  actionIcon = <PlusOutlined />,
  onAction,
  extra,
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-6 md:p-8 shadow-lg mb-6 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_30%)]" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-md">
                <div className="text-2xl text-white">{icon}</div>
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-white/85 mt-1 text-sm md:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {extra}
            {actionText && onAction && (
              <Button
                type="primary"
                size="large"
                icon={actionIcon}
                onClick={onAction}
                className="!h-11 !rounded-xl !border-0 !bg-white !px-5 !font-semibold !text-sky-600 hover:!bg-sky-50"
              >
                {actionText}
              </Button>
            )}
          </div>
        </div>

        {children && (
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
