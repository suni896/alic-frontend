import styled from "styled-components";
import { IoMdPersonAdd } from "react-icons/io";
import { MdPeopleAlt } from "react-icons/md";
import { useState } from "react";
import CreateRoomComponent from "./CreateRoomComponent";

const CreateRoomJoinButtonContainer = styled.div`
  background: white;
  width: 70%;
`;

const NewContainer = styled.button`
  display: flex;
  width: 100%;
  height: 1.6rem;
  align-items: center;
  gap: 1rem;
  margin-top: 0.3rem;
  border: solid #016532;
  background: #016532;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const StyledIoMdPersonAdd = styled(IoMdPersonAdd)`
  width: 20px;
  height: 20px;
  color: white;
`;

const StyledMdPeopleAlt = styled(MdPeopleAlt)`
  width: 20px;
  height: 20px;
  margin-left: 2px;
  color: white;
`;

const StyledText = styled.span`
  font-family: Roboto;
  font-weight: 700;
  font-size: 0.71rem;
  color: white;
`;

const CreateRoomJoinButton = () => {
  const [isCreateRoomOverlayVisible, setIsCreateRoomOverlayVisible] =
    useState(false);

  return (
    <CreateRoomJoinButtonContainer>
      <NewContainer onClick={() => setIsCreateRoomOverlayVisible(true)}>
        <StyledIoMdPersonAdd />
        <StyledText>CREATE NEW ROOM</StyledText>
      </NewContainer>
      {isCreateRoomOverlayVisible && (
        <CreateRoomComponent
          onClose={() => setIsCreateRoomOverlayVisible(false)}
        />
      )}
      <NewContainer>
        <StyledMdPeopleAlt />
        <StyledText>JOIN A ROOM</StyledText>
      </NewContainer>
    </CreateRoomJoinButtonContainer>
  );
};

export default CreateRoomJoinButton;
