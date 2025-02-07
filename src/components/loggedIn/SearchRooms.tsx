import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent"; // Modal Component

const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 72px;
`;

const TopContainer = styled.div`
  display: flex;
  width: 100%;
  height: 12vh;
`;

const Title = styled.h1`
  font-family: Roboto;
  font-weight: 800;
  font-size: 2.5rem;
  margin-left: 32%;
`;

const SearchContainer = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  right: 2rem;
  top: 6.8rem;
  width: auto;
  z-index: 1000;
`;

const SearchIcon = styled(CiSearch)`
  font-size: 1.5rem;
  margin-left: 0.5rem;
  color: black;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #b7b7b7;
  color: #757575;
  background: white;
  border-radius: 6px;
  outline: #016532;
  cursor: pointer;

  &:focus {
    border-color: #333;
  }
`;

const SearchRoomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 4rem;
  padding: 2rem;
  box-sizing: border-box;
`;

const RoomContainer = styled.div`
  width: 45%; /* Two columns */
  border-radius: 6px;
  border: solid #d9d9d9;
  padding: 1rem;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
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

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 4rem;
`;

const Ellipsis = styled.span`
  padding: 0 0.5rem;
`;

const PageButton = styled.button<PageButtonProps>`
  background: ${(props) => (props.active ? "black" : "white")};
  color: ${(props) => (props.active ? "white" : "black")};
  border: ${(props) => (props.active ? "1px solid #d9d9d9" : "none")};
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

interface PageButtonProps {
  active?: boolean;
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

const SearchRooms: React.FC = () => {
  const rooms = Array.from({ length: 68 }, (_, i) => ({
    title: `${i + 1}`,
    admin: "Jane Smith",
    desc: `Description for Room ${i + 1}.`,
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage, setRoomsPerPage] = useState(8);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const roomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateRoomsPerPage = () => {
      if (roomRef.current) {
        const roomHeight = roomRef.current.offsetHeight;
        const containerHeight = window.innerHeight * 0.65;
        const verticalGap = 32;

        const rowHeight = roomHeight + verticalGap;
        const rowsPerPage = Math.floor(containerHeight / rowHeight);

        const calculatedRoomsPerPage = rowsPerPage * 2;

        setRoomsPerPage(calculatedRoomsPerPage || 8);
      }
    };

    calculateRoomsPerPage();

    window.addEventListener("resize", calculateRoomsPerPage);
    return () => {
      window.removeEventListener("resize", calculateRoomsPerPage);
    };
  }, []);

  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentRooms = rooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  return (
    <>
      {isCreateRoomOpen && (
        <CreateRoomComponent onClose={() => setIsCreateRoomOpen(false)} />
      )}
      <Container style={{ filter: isCreateRoomOpen ? "blur(5px)" : "none" }}>
        <TopContainer>
          <Title>Public Chat Rooms</Title>
          <SearchContainer>
            <SearchInput placeholder="Search Public Rooms" />
            <SearchIcon />
          </SearchContainer>
        </TopContainer>
        <SearchRoomsContainer>
          {currentRooms.map((room, index) => (
            <RoomContainer key={index} ref={index === 0 ? roomRef : null}>
              <RoomTitle>Room {room.title}</RoomTitle>
              <RoomAdmin>Admin: {room.admin}</RoomAdmin>
              <RoomDescription>{room.desc}</RoomDescription>
            </RoomContainer>
          ))}
        </SearchRoomsContainer>
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
                active={currentPage === page}
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
    </>
  );
};

export default SearchRooms;
