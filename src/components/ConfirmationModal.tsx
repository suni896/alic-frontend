import React from "react";
import styled from "styled-components";
import  Button  from "./button"; // 引入你自己的 Button 组件
import CloseButton from "./CloseButton";

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
  confirmText = "Yes",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose} style={{ zIndex: 3000 }}>
      <Container onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
        </CloseButton>

        <Title>{title}</Title>
        <Message>{message}</Message>

        <ButtonContainer>
          <Button variant="cancel" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </ButtonContainer>
      </Container>
    </Overlay>
  );
};

export default ConfirmationModal;
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  position: relative;
`;

const Title = styled.h3`
  margin-top: 0;
  font-size: 1.25rem;
`;

const Message = styled.p`
  color: #555;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;