import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent"; // Modal Component
import { useRoomContext } from "./RoomContext";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  background: white;
  width: 100%;
  margin-top: 72px;
`;

const TopContainer = styled.div`
  display: flex;
  width: 100%;
  height: 12vh;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-family: Roboto;
  font-weight: 800;
  font-size: 2.5rem;

  @media (max-width: 800px) {
    font-size: 2rem;
    font-weight: 700;
  }

  @media (max-width: 500px) {
    font-size: 1.7rem;
  }
`;

const SearchContainer = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  right: 5rem;
  top: 9.5rem;
  width: auto;
  z-index: 1000;

  @media (max-width: 1000px) {
    right: 1.5rem;
  }
`;

const SearchIcon = styled(CiSearch)`
  font-size: 1.5rem;
  margin-left: 0.5rem;
  color: black;
`;

const SearchInput = styled.input`
  padding: 5% 1%;
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

  font-size: 80%;
`;

const SearchRoomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 4rem;
  padding: 2rem;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  justify-content: flex-start;

  @media (max-width: 1000px) {
    gap: 2rem;
  }
  @media (max-width: 600px) {
    gap: 2rem 0.8rem;
    padding: 2rem 1rem;
  }
`;

const RoomContainer = styled.div`
  width: 45%;
  border-radius: 6px;
  border: solid #d9d9d9;
  padding: 1rem;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.3rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #016532;
  }

  @media (max-width: 600px) {
    padding: 1rem 0.5rem;
  }
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

const SearchRooms: React.FC = () => {
  const { mainAreaRooms, mainAreaRoomsPagination, setMainAreaRoomListRequest } =
    useRoomContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage, setRoomsPerPage] = useState(8);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const roomRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const calculateRoomsPerPage = () => {
  //     if (roomRef.current) {
  //       const roomHeight = roomRef.current.offsetHeight;
  //       const containerHeight = window.innerHeight * 0.65;
  //       const verticalGap = 32;

  //       const rowHeight = roomHeight + verticalGap;
  //       const rowsPerPage = Math.floor(containerHeight / rowHeight);

  //       const calculatedRoomsPerPage = rowsPerPage * 2;

  //       setRoomsPerPage(calculatedRoomsPerPage || 8);
  //       setRoomsPerPage(8);
  //     }
  //   };

  // calculateRoomsPerPage();

  //   window.addEventListener("resize", calculateRoomsPerPage);
  //   return () => {
  //     window.removeEventListener("resize", calculateRoomsPerPage);
  //   };
  // }, []);

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

  const navigate = useNavigate();

  return (
    <>
      {isCreateRoomOpen && (
        <CreateRoomComponent onClose={() => setIsCreateRoomOpen(false)} />
      )}
      <Container style={{ filter: isCreateRoomOpen ? "blur(5px)" : "none" }}>
        <TopContainer>
          <Title>Public Chat Rooms</Title>
          <SearchContainer>
            <SearchInput
              placeholder="Search Public Rooms"
              value={searchKeyword}
              onChange={handleSearchChange}
            />
            <SearchIcon />
          </SearchContainer>
        </TopContainer>
        <SearchRoomsContainer>
          {loading ? (
            <div>Loading...</div>
          ) : mainAreaRooms.length === 0 ? (
            <div>No rooms found</div>
          ) : (
            mainAreaRooms.map((room, index) => (
              <RoomContainer
                key={room.groupId}
                onClick={() => {
                  console.log("/my-room-${room.groupId.toString()}");
                  navigate(`/my-room/${room.groupId.toString()}`, {
                    state: {
                      title: room.groupName,
                      desc: room.groupDescription,
                      groupId: room.groupId,
                      adminId: room.adminId,
                      adminName: room.adminName,
                      memberCount: room.memberCount,
                      groupType: room.groupType,
                    },
                  });
                }}
                ref={index === 0 ? roomRef : null}
              >
                <RoomTitle>{room.groupName}</RoomTitle>
                <RoomAdmin>Admin: {room.adminName}</RoomAdmin>
                <RoomDescription>{room.groupDescription}</RoomDescription>
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
