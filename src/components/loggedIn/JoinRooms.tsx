import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";

// Styled Components
const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 72px;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  height: 5vh;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const RoomList = styled.div<{ blur: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;
  overflow-y: auto; /* Enable vertical scrolling */
  border: 1px solid #e0e0e0;
  padding: 10px;
  ${({ blur }) =>
    blur &&
    css`
      filter: blur(5px); /* Apply blur when modals are open */
      pointer-events: none;
    `}
`;

const RoomCard = styled.div`
  border: 2px solid #4caf50;
  border-radius: 5px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const JoinButton = styled.button`
  padding: 5px 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #43a047;
  }
`;

const RoomInfo = styled.div`
  font-size: 14px;
  color: #555;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border: 1px solid #4caf50;
  border-radius: 5px;
  padding: 20px;
  width: 300px;
  text-align: center;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const SubmitButton = styled.button`
  padding: 10px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
`;

const CloseButton = styled.button`
  padding: 5px 10px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

// Mock Database
type Room = {
  id: number;
  title: string;
  members: number;
  description: string;
};

const mockRoomsNotJoined: Room[] = [
  {
    id: 1,
    title: "Room 1",
    members: 3,
    description: "For Computer Science students",
  },
  { id: 2, title: "Room 2", members: 5, description: "For Math enthusiasts" },
  {
    id: 3,
    title: "Room 3",
    members: 10,
    description: "For Physics discussions",
  },
  { id: 4, title: "Room 4", members: 8, description: "For Literature lovers" },
  {
    id: 5,
    title: "Room 5",
    members: 4,
    description: "For History discussions",
  },
  { id: 6, title: "Room 6", members: 7, description: "For Art enthusiasts" },
  { id: 7, title: "Room 7", members: 6, description: "For Music discussions" },
];

// React Component
const RoomPlatform: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  useEffect(() => {
    // Simulate fetching data from database
    setRooms(mockRoomsNotJoined);
    setFilteredRooms(mockRoomsNotJoined);
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
    <Container>
      <SearchBar
        placeholder="Search in Platform"
        value={searchQuery}
        onChange={handleSearch}
      />

      <RoomList blur={showPasswordModal || showErrorModal}>
        {filteredRooms.map((room) => (
          <RoomCard key={room.id}>
            <RoomHeader>
              <span>{room.title}</span>
              <JoinButton onClick={handleJoinClick}>JOIN</JoinButton>
            </RoomHeader>
            <RoomInfo>
              • {room.members} members • {room.description}
            </RoomInfo>
          </RoomCard>
        ))}
      </RoomList>

      {(showPasswordModal || showErrorModal) && (
        <Overlay>
          {showPasswordModal && (
            <Modal>
              <div>
                <label>PASSWORD</label>
                <PasswordInput type="password" placeholder="Enter password" />
              </div>
              <SubmitButton onClick={handlePasswordSubmit}>Submit</SubmitButton>
            </Modal>
          )}
          {showErrorModal && (
            <Modal>
              <ErrorMessage>Chat Room Password Error</ErrorMessage>
              <CloseButton onClick={() => setShowErrorModal(false)}>
                OK
              </CloseButton>
            </Modal>
          )}
        </Overlay>
      )}
    </Container>
  );
};

export default RoomPlatform;
