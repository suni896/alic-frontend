import React, { useState } from "react";
import { FiTag } from "react-icons/fi";
import {
  AiOutlinePlus,
  AiOutlineClose,
  AiOutlineMinusCircle,
} from "react-icons/ai";
import styled from "styled-components";

interface RoomContainerProps {
  $isEditMode: boolean;
}

interface EditButtonProps {
  $isEditMode: boolean;
}

interface PageButtonProps {
  $active?: boolean;
}

const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 72px;
`;

const TopContainer = styled.div`
  display: flex;
  gap: 1.5%;
  width: 100%;
  height: 10vh;
  align-items: center;
  padding: 3vh 3%;
`;

const Title = styled.p`
  font-family: Roboto;
  font-weight: 600;
  font-size: 2.2rem;
`;

const Tag = styled(FiTag)`
  color: black;
  font-size: 2rem;
`;

const StyledPlus = styled(AiOutlinePlus)`
  color: #016532;
  font-size: 2rem;
  cursor: pointer;
`;

const SearchRoomsContainer = styled.div<RoomContainerProps>`
  display: flex;
  flex-direction: ${(props) => (props.$isEditMode ? "column" : "row")};
  flex-wrap: ${(props) => (props.$isEditMode ? "nowrap" : "wrap")};
  min-height: 50vh;
  gap: 2rem;
  padding: 0 2rem;
  margin-bottom: 8vh;
  box-sizing: border-box;
`;

const SearchRoomContainer = styled.div<RoomContainerProps>`
  display: flex;
  align-items: center;
  width: ${(props) => (props.$isEditMode ? "55%" : "45%")};
  gap: 1rem;
`;

const RoomContainer = styled.div<RoomContainerProps>`
  width: ${(props) => (props.$isEditMode ? "80%" : "100%")};
  border-radius: 6px;
  border: solid #d9d9d9;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100px; // Fixed height for consistency
`;

const StyledMinus = styled(AiOutlineMinusCircle)`
  color: red;
  font-size: 1.5rem;
  cursor: pointer;
  flex-shrink: 0;
`;

const RoomContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const RoomTitle = styled.h2`
  color: black;
  font-size: 1rem;
  font-family: Roboto;
  font-weight: 700;
  margin: 0;
`;

const RoomAdmin = styled.p`
  font-size: 0.8rem;
  font-family: Roboto;
  font-weight: 400;
  color: #757575;
  margin: 0;
`;

const RoomDescription = styled.span`
  color: black;
  font-size: 0.9rem;
  font-family: Roboto;
  font-weight: 400;
  margin: 0;
`;

const DeleteButton = styled(AiOutlineClose)`
  color: red;
  font-size: 1.5rem;
  cursor: pointer;
`;

const EditButton = styled.button<EditButtonProps>`
  display: block;
  margin: 0 auto;
  width: 15%;
  padding: 0.5rem;
  background-color: ${(props) => (props.$isEditMode ? "#016532" : "#000")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$isEditMode ? "#015528" : "#333")};
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 4vh;
`;

const PageButton = styled.button<PageButtonProps>`
  background: ${(props) => (props.$active ? "black" : "white")};
  color: ${(props) => (props.$active ? "white" : "black")};
  border: ${(props) => (props.$active ? "1px solid #d9d9d9" : "none")};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }

  &:disabled {
    color: #d9d9d9;
    cursor: not-allowed;
  }
`;

const Ellipsis = styled.span`
  padding: 0 0.5rem;
`;

interface Room {
  id: number;
  title: string;
  admin: string;
  desc: string;
}

interface MyClassProps {
  title?: string;
  desc?: string;
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let pages = [];

  pages.push(1);

  if (currentPage <= 3) {
    pages.push(2, 3, 4);
    pages.push("...");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push("...");
    pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push("...");
    pages.push(currentPage - 1, currentPage, currentPage + 1);
    pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};

const MyClass: React.FC<MyClassProps> = ({
  title = "Default Title",
  desc = "Default Description",
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Room[]>(
    Array.from({ length: 68 }, (_, i) => ({
      id: i + 1,
      title: `${i + 1}`,
      admin: "Jane Smith",
      desc: `Description for Room ${i + 1}.`,
    }))
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  const roomsPerPage = isEditMode ? 3 : 6;
  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const currentRooms = rooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  const handlePageChange = (page: number): void => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRemoveRoom = (roomId: number): void => {
    setRooms(rooms.filter((room) => room.id !== roomId));
    if (currentRooms.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleEditMode = (): void => {
    setIsEditMode(!isEditMode);
    setCurrentPage(1);
  };

  return (
    <Container>
      <TopContainer>
        <Tag />
        <Title>CLASS {title}</Title>
        <StyledPlus />
      </TopContainer>
      <SearchRoomsContainer $isEditMode={isEditMode}>
        {currentRooms.map((room) => (
          <SearchRoomContainer key={room.id} $isEditMode={isEditMode}>
            <RoomContainer $isEditMode={isEditMode}>
              <RoomContent>
                <RoomTitle>Room {room.title}</RoomTitle>
                <RoomAdmin>Admin: {room.admin}</RoomAdmin>
                <RoomDescription>{room.desc}</RoomDescription>
              </RoomContent>
            </RoomContainer>
            {isEditMode && (
              <StyledMinus onClick={() => handleRemoveRoom(room.id)} />
            )}
          </SearchRoomContainer>
        ))}
      </SearchRoomsContainer>
      <EditButton onClick={toggleEditMode} $isEditMode={isEditMode}>
        {isEditMode ? "SUBMIT" : "EDIT"}
      </EditButton>
      <Footer>
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </PageButton>
        {getPageNumbers(currentPage, totalPages).map((page, index) =>
          page === "..." ? (
            <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
          ) : (
            <PageButton
              key={`page-${page}`}
              $active={currentPage === page}
              onClick={() => handlePageChange(page as number)}
            >
              {page}
            </PageButton>
          )
        )}
        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </PageButton>
      </Footer>
    </Container>
  );
};

export default MyClass;
