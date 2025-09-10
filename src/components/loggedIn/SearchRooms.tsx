import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent"; // Modal Component
import { useRoomContext } from "./RoomContext";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import LabeledInputWithCount from "../Input";

const Container = styled.div`
  background: white;
  width: 100%;
  // margin-left: 280px; /* 为侧边栏留出空间 */
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  position: relative;
  min-height: calc(100vh - 7vh);
  overflow-y: auto;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2vh 4vw;
  width: 100%;
  height: 12vh;
  box-sizing: border-box;

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

  @media (max-width: 800px) {
    font-size: 1.8rem;
  }

  @media (max-width: 500px) {
    font-size: 1.5rem;
  }
`;

const SearchContainer = styled.div`
  padding: 1.5rem 2rem;
  background: #white;
  // border-bottom: 1px solid #e9ecef;
  position: relative;
`;
const SearchWrapper = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #6c757d;
  z-index: 1;
`;


const SearchRoomsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 4rem;
  padding: 1rem 4rem;
  box-sizing: border-box;
  margin: 0 auto;
  justify-content: flex-start;
  min-height: 20vh;
  overflow-y: auto;
  width: 100%;
  // background-color: lightblue;

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
  width: 420px;
  height: 70px;
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
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 1.4em; /* 1 line * 1.4 line-height */
  word-break: break-word;
  
  @media (max-width: 600px) {
    font-size: 0.7rem;
    -webkit-line-clamp: 1;
    max-height: 1.4em; /* 1 line on mobile */
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  height: 4vh;
  width: 100%;
  background-color: white;
  padding: 1.5rem 0;
  margin-top: 1rem;
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
  const [roomsPerPage] = useState(20);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            <SearchWrapper>
              <SearchIcon />
              <LabeledInputWithCount
                variant="withIcon"
                value={searchKeyword}
                onChange={handleSearchChange}
                placeholder="Search rooms by name or description..."
                type="text"
                showCount={false} // 搜索框通常不需要字数统计
              />
            </SearchWrapper>
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
