import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border: 1px solid #016532;
  border-radius: 8px;
  padding: 2vh 2%;
  width: 20%;
  position: relative;
`;

const ModalTitle = styled.label`
  font-family: Roboto;
  font-weight: 400;
`;

const ModalInput = styled.input`
  margin-top: 1vh;
  margin-bottom: 3vh;
  width: 85%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #016532;
  border-radius: 8px;
  color: #b3b3b3;
  background-color: white;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1vh;
  gap: 5%;
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: black;
`;

const CreateButton = styled.button``;

interface CreateNewTagProps {
  onClose: () => void;
}

const CreateNewTag: React.FC<CreateNewTagProps> = ({ onClose }) => {
  return (
    <Overlay>
      <Modal>
        <ModalTitle>Tag Name</ModalTitle>
        <ModalInput type="string" placeholder="CLASS D" />
        <ButtonContainer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <CreateButton onClick={onClose}>Create</CreateButton>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default CreateNewTag;
