import React from "react";
import styled from "styled-components";
import  Button  from "./button"; // 引入你自己的 Button 组件
import ModalHeader from "./Header";
import { MdWarning} from "react-icons/md";

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
    <Overlay onClick={onClose} style={{ zIndex: 3000 }}>
      <Container onClick={(e) => e.stopPropagation()}>
      <ModalHeader
          icon={MdWarning}
          title={title}
          onClose={onClose}
        />
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
  border: none;
  // border-radius: 20px;
  padding: 2.5rem;
`;

const Container = styled.div`
  background: white;
  border-radius: 16px;
  width: 500px;
  min-width: 300px;
  max-width: 500px;
  height: 250px;
  min-height: 200px;
  max-height: 300px;
  position: relative;
  border-radius: 20px;
  padding: 2.5rem;
`;

const Message = styled.p`
  color: #555;
  font-size: 1.2rem;
  margin-top: 2.5rem;
  margin-left: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 3rem;
  justify-content: center;
  height: 50px;

`;