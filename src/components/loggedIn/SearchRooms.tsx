import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent"; // Modal Component
import { useRoomContext } from "./RoomContext";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";

const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 72px;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2vh 4vw;
  width: 100%;
  height: 12vh;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 800px) {
    padding: 2vh 2vw;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    height: auto;
    gap: 1rem;
    padding: 2vh 1rem;
  }
`;

const Title = styled.h1`
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: 0.5px;
  color: #222;
  text-align: center;
  margin: 0;

  @media (max-width: 800px) {
    font-size: 1.8rem;
  }

  @media (max-width: 500px) {
    font-size: 1.5rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: 4vw;
  background-color: white;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 280px;
  max-width: 100%;
  flex-shrink: 0;

  &:focus-within {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: #016532;
    transform: translateY(-1px);
  }

  @media (max-width: 1000px) {
    width: 240px;
    right: 2vw;
  }

  @media (max-width: 800px) {
    width: 200px;
  }

  @media (max-width: 600px) {
    position: static;
    width: 100%;
    max-width: 300px;
    padding: 0.7rem 0.8rem;
  }
`;

const SearchIcon = styled(CiSearch)`
  font-size: 1.4rem;
  color: #6b7280;
  margin-right: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 600px) {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 1rem;
  color: #374151;
  background: transparent;
  width: 100%;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const SearchRoomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 4rem;
  padding: 2rem 4rem;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
  justify-content: flex-start;

  @media (max-width: 1200px) {
    gap: 2rem 3rem;
    padding: 2rem 3rem;
  }

  @media (max-width: 1000px) {
    gap: 2rem;
  }

  @media (max-width: 800px) {
    padding: 2rem;
  }

  @media (max-width: 600px) {
    gap: 2rem 0.8rem;
    padding: 1.5rem 1rem;
  }
`;

const RoomContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 45%;
  padding: 0.75rem;
  background-color: white;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #016532;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 0.6rem;
  }
`;
const RoomDescContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  gap: 0.25rem;
`;

const RoomTitle = styled.h2`
  color: black;
  font-size: 1rem;
  font-family: Roboto;
  font-weight: 700;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
  @media (max-width: 400px) {
    font-size: 0.75rem;
  }
`;

const RoomAdmin = styled.p`
  font-size: 0.8rem;
  font-family: Roboto;
  font-weight: 400;
  color: #757575;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 0.7rem;
  }
`;

const RoomDescription = styled.span`
  color: black;
  font-size: 0.9rem;
  font-family: Roboto;
  font-weight: 400;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 0.7rem;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  position: fixed;
  bottom: 4vh;
  width: 80%;
  background-color: white;
`;

const Ellipsis = styled.span`
  padding: 0 0.5rem;
`;

const PageButton = styled.button<PageButtonProps>`
  background: ${(props) => (props.active ? "black" : "white")};
  color: ${(props) => (props.active ? "white" : "black")};
  border: ${(props) => (props.active ? "1px solid #d9d9d9" : "none")};
  border-radius: 4px;
  padding: 0.3rem 1rem;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }

  &:disabled {
    color: #d9d9d9;
    cursor: not-allowed;
  }
  @media (max-width: 800px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
  }

  @media (max-width: 500px) {
    font-size: 0.6rem;
    padding: 0.3rem;
  }
`;

interface PageButtonProps {
  active?: boolean;
}

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  font-family: 'Roboto', sans-serif;
  width: 100%;
  grid-column: 1 / -1;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  font-family: 'Roboto', sans-serif;
  width: 100%;
  grid-column: 1 / -1;
`;

const SearchRooms: React.FC = () => {
  const { mainAreaRooms, mainAreaRoomsPagination, setMainAreaRoomListRequest } =
    useRoomContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(8);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading] = useState(false);

  const roomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { handleJoinClick, redirectPath, setRedirectPath } = useJoinRoom();

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
    }
  }, [redirectPath, navigate, setRedirectPath]);

  useEffect(() => {
    fetchRooms();
  }, [currentPage, roomsPerPage, searchKeyword]);

  const fetchRooms = async () => {
    setMainAreaRoomListRequest({
      keyword: searchKeyword,
      groupDemonTypeEnum: "PUBLICROOM",
      pageRequestVO: {
        pageSize: roomsPerPage,
        pageNum: currentPage,
      },
    });
  };

  const handlePageChange = (page: number) => {
    const clampedPage = Math.max(
      1,
      Math.min(page, mainAreaRoomsPagination.pages)
    );
    setMainAreaRoomListRequest({
      keyword: searchKeyword,
      groupDemonTypeEnum: "PUBLICROOM",
      pageRequestVO: {
        pageSize: mainAreaRoomsPagination.pageSize,
        pageNum: clampedPage,
      },
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setSearchKeyword(value);
      setCurrentPage(1); // Reset to first page when search changes
    }
  };

  return (
    <>
      {isCreateRoomOpen && (
        <CreateRoomComponent onClose={() => setIsCreateRoomOpen(false)} />
      )}
      <Container style={{ filter: isCreateRoomOpen ? "blur(5px)" : "none" }}>
        <TopContainer>
          <Title>Public Chat Rooms</Title>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              placeholder="Search Public Rooms"
              value={searchKeyword}
              onChange={handleSearchChange}
            />
          </SearchContainer>
        </TopContainer>
        <SearchRoomsContainer>
          {loading ? (
            <LoadingContainer>Loading...</LoadingContainer>
          ) : mainAreaRooms.length === 0 ? (
            <EmptyState>No rooms found</EmptyState>
          ) : (
            mainAreaRooms.map((room, index) => (
              <RoomContainer
                key={room.groupId}
                onClick={() => handleJoinClick(room.groupId, room.groupType)}
                ref={index === 0 ? roomRef : null}
              >
                <RoomDescContainer>
                  <RoomTitle>{room.groupName}</RoomTitle>
                  <RoomAdmin>Admin: {room.adminName}</RoomAdmin>
                  {room.groupDescription && (
                    <RoomDescription>{room.groupDescription}</RoomDescription>
                  )}
                </RoomDescContainer>
              </RoomContainer>
            ))
          )}
        </SearchRoomsContainer>
        <Footer>
          <PageButton
            onClick={() => handlePageChange(1)}
            disabled={mainAreaRoomsPagination.pageNum === 1}
          >
            First
          </PageButton>
          <PageButton
            onClick={() =>
              handlePageChange(mainAreaRoomsPagination.pageNum - 1)
            }
            disabled={mainAreaRoomsPagination.pageNum === 1}
          >
            Previous
          </PageButton>
          <Ellipsis>
            Page {mainAreaRoomsPagination.pageNum} of{" "}
            {mainAreaRoomsPagination.pages}
          </Ellipsis>
          <PageButton
            onClick={() =>
              handlePageChange(mainAreaRoomsPagination.pageNum + 1)
            }
            disabled={
              mainAreaRoomsPagination.pageNum === mainAreaRoomsPagination.pages
            }
          >
            Next
          </PageButton>
          <PageButton
            onClick={() => handlePageChange(mainAreaRoomsPagination.pages)}
            disabled={
              mainAreaRoomsPagination.pageNum === mainAreaRoomsPagination.pages
            }
          >
            Last
          </PageButton>
        </Footer>
      </Container>
    </>
  );
};

export default SearchRooms;
