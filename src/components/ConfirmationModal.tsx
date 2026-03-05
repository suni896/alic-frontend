import React from "react";
import styled from "styled-components";
import { MdWarning } from "react-icons/md";
import { FiX } from "react-icons/fi";
import Button from "./button";
import {
  ModalBackdrop,
  ModalContainer,
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  ButtonContainer,
  FixedButtonContainer,
} from "./SharedComponents";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose} style={{ zIndex: 3000 }}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 */}
        <HeaderSection>
          <WarningIcon />
          <HeaderTitle>{title}</HeaderTitle>
          <HeaderSubTitle>{message}</HeaderSubTitle>
        </HeaderSection>

        {/* 底部按钮 */}
        <ButtonContainer>
          <FixedButtonContainer>
            <Button variant="cancel" onClick={onClose}>
              {cancelText}
            </Button>
          </FixedButtonContainer>
          <FixedButtonContainer>
            <Button variant="primary" onClick={onConfirm}>
              {confirmText}
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </ModalContainer>
    </ModalBackdrop>
  );
};

const WarningIcon = styled(MdWarning)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Box Model ================= */
  margin-bottom: var(--space-3);

  /* ================= Typography ================= */
  font-size: var(--space-8);

  /* ================= Visual ================= */
  color: var(--warning-orange);
`;

export default ConfirmationModal;