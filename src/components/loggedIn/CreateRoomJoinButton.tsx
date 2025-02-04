import styled from "styled-components";
import { IoMdPersonAdd } from "react-icons/io";
import { MdPeopleAlt } from "react-icons/md";
import { useState } from "react";
import CreateRoomComponent from "./CreateRoomComponent";
import JoinRooms from "./JoinRooms";

const CreateRoomJoinButtonContainer = styled.div`
  background: white;
  width: 55%;
  margin-left: 75%;
  z-index: 2000;
`;

const NewContainer = styled.button`
  display: flex;
  width: 100%;
  height: 1.6rem;
  align-items: center;
  gap: 0.5rem;
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
  font-size: 0.65rem;
  color: white;
`;

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
  z-index: 3000;
`;

const PopupContainer = styled.div`
  background: white;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  border-radius: 8px;
  position: relative;
  padding: 1rem;
  overflow-y: auto;
  border: 1px solid #016532;
`;

const CreateRoomJoinButton = () => {
  const [isCreateRoomOverlayVisible, setIsCreateRoomOverlayVisible] =
    useState(false);
  const [isJoinRoomsOverlayVisible, setIsJoinRoomsOverlayVisible] =
    useState(false);

  return (
    <>
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
        <NewContainer onClick={() => setIsJoinRoomsOverlayVisible(true)}>
          <StyledMdPeopleAlt />
          <StyledText>JOIN A ROOM</StyledText>
        </NewContainer>
      </CreateRoomJoinButtonContainer>

      {isJoinRoomsOverlayVisible && (
        <Overlay>
          <PopupContainer>
            <JoinRooms onClose={() => setIsJoinRoomsOverlayVisible(false)} />
          </PopupContainer>
        </Overlay>
      )}
    </>
  );
};

export default CreateRoomJoinButton;
