"use client";

import { Modal } from "antd";
import type { ReactNode } from "react";

interface DefModalProps {
  open?: boolean;
  onClose: () => void;
  title?: ReactNode;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
}

const DefModal = ({
  open = true,
  onClose,
  title,
  width = 480,
  footer = null,
  children,
}: DefModalProps) => (
  <Modal
    open={open}
    onCancel={onClose}
    width={width}
    footer={footer}
    centered
    destroyOnHidden
    styles={{
      header: { borderBottom: "1px solid #9ca3af", paddingBottom: "12px" },
      body: { maxHeight: "65vh", overflowY: "auto" },
    }}
    title={title}
  >
    {children}
  </Modal>
);

export default DefModal;
