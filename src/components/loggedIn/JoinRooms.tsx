import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import styled, { css } from "styled-components";

const OverlayContainer = styled.div`
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

const Container = styled.div`
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

const StyledCross = styled(RxCross2)`
  color: #016532;
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  gap: 2rem;
  align-items: center;
  margin: 2.2% 4%;
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  font-size: 2.2rem;
  color: #b3b3b3;
  left: 0.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 4vh;
  padding: 0.65rem 3.5rem;
  font-size: 1.2rem;
  font-family: Roboto;
  font-weight: 400;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  color: #b3b3b3;
  background: white;
  cursor: pointer;
`;

const RoomList = styled.div<{ blur: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 0 4%;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(5px);
      pointer-events: none;
    `}
`;

const RoomCard = styled.div`
  border: 1px solid #016532;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
`;

const RoomHeader = styled.span`
  font-family: Roboto;
  font-weight: 600;
`;

const JoinButton = styled.button`
  padding: 0.5rem 1.5rem;
  background-color: #eaeaea;
  color: #016532;
  border: 1px solid #016532;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #43a047;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: Roboto;
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
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border: 1px solid #016532;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  width: 20%;
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 0.5vh;
  right: 1%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    opacity: 0.7;
  }
`;

const PasswordTitle = styled.label`
  font-family: Roboto;
  font-weight: 400;
`;

const PasswordInput = styled.input`
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
`;

const SubmitButton = styled.button`
  padding: 0.5rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #016532;
  }
`;

const ErrorMessage = styled.div`
  font-size: 1rem;
  color: black;
  font-weight: 600;
  margin-bottom: 2.5vh;
`;

const ErrorModalButton = styled.button`
  padding: 5px 10px;
  background-color: black;
  margin-left: 44%;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

type Room = {
  id: number;
  title: string;
  members: number;
  description: string;
};

const mockRoomsNotJoined: Room[] = [
  {
    id: 1,
    title: "ROOM 1",
    members: 3,
    description: "For Computer Science students",
  },
  { id: 2, title: "ROOM 2", members: 5, description: "For Math enthusiasts" },
  {
    id: 3,
    title: "ROOM 3",
    members: 10,
    description: "For Physics discussions",
  },
  { id: 4, title: "ROOM 4", members: 8, description: "For Literature lovers" },
  {
    id: 5,
    title: "ROOM 5",
    members: 4,
    description: "For History discussions",
  },
  { id: 6, title: "ROOM 6", members: 7, description: "For Art enthusiasts" },
  { id: 7, title: "ROOM 7", members: 6, description: "For Music discussions" },
];

interface CreateRoomComponentProps {
  onClose: () => void;
}

const JoinRooms: React.FC<CreateRoomComponentProps> = ({ onClose }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  useEffect(() => {
    setRooms(mockRoomsNotJoined);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredRooms(
      rooms.filter((room) => room.title.toLowerCase().includes(query))
    );
  };

  const handleJoinClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    setShowPasswordModal(false);
    setShowErrorModal(true);
  };

  return (
    <OverlayContainer>
      <Container>
        <ModalCloseButton onClick={onClose}>
          <StyledCross size={24} />
        </ModalCloseButton>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            placeholder="Search in Platform"
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        {searchQuery && (
          <RoomList blur={showPasswordModal || showErrorModal}>
            {filteredRooms.map((room) => (
              <RoomCard key={room.id}>
                <RoomHeader>{room.title}</RoomHeader>
                <RoomInfo>
                  <JoinButton onClick={handleJoinClick}>JOIN</JoinButton>•{" "}
                  {room.members} members • {room.description}
                </RoomInfo>
              </RoomCard>
            ))}
          </RoomList>
        )}

        {(showPasswordModal || showErrorModal) && (
          <Overlay>
            {showPasswordModal && (
              <Modal>
                <ModalCloseButton onClick={() => setShowPasswordModal(false)}>
                  <StyledCross size={24} />
                </ModalCloseButton>
                <PasswordTitle>PASSWORD</PasswordTitle>
                <PasswordInput type="password" placeholder="Enter password" />
                <ButtonContainer>
                  <SubmitButton onClick={handlePasswordSubmit}>
                    Submit
                  </SubmitButton>
                </ButtonContainer>
              </Modal>
            )}
            {showErrorModal && (
              <Modal>
                <ErrorMessage>Chat Room Password Error</ErrorMessage>
                <ErrorModalButton onClick={() => setShowErrorModal(false)}>
                  OK
                </ErrorModalButton>
              </Modal>
            )}
          </Overlay>
        )}
      </Container>
    </OverlayContainer>
  );
};

export default JoinRooms;
