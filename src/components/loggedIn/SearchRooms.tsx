import React, { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent"; // Modal Component
import { useRoomContext } from "./RoomContext";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import LabeledInputWithCount from "../Input";
import { MdGroup } from "react-icons/md";


// 样式区域（紧随已有样式组件之后）
const RoomInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  // margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  /* 允许子元素在 flex 中触发文本省略 */
  min-width: 0;
`;
const InfoItemText = styled.span`
  flex: 1;        /* 占满剩余空间 */
  min-width: 0;   /* 允许在 flex 中收缩以触发省略 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Container = styled.div`
  background: #F5F5F5;
  width: 100%;
  padding-top: 20px;
  padding-left: 10px;
  padding-right: 10px;
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem 2rem; /* 去掉左右内边距，只保留上下 */
  box-sizing: border-box;
  margin: 0 auto;
  min-height: 20vh;
  overflow-y: auto;
  width: 100%;
  // background-color: lightblue;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    padding: 1rem 0;
  }

  @media (max-width: 600px) {
    gap: 1.25rem 0.8rem;
    padding: 0.75rem 0;
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
const RoomContent = styled.div`
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

// 新增：卡片样式组件，参考 feed.html 页签设计
const IntegrationCard = styled.div`
  width: 85%;
  padding: 24px; /* p-6 */
  background: white;
  border-radius: 8px; /* rounded */
  display: flex; /* 填满网格单元更稳定 */
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 24px; /* gap-6 */
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08);
    transform: translateY(-1px);
    border-color: #10b981; /* emerald-400 */
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const CardTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px; /* gap-4 */
`;

const CardHeader = styled.div`
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px; /* gap-4 */
`;

const Avatar = styled.div`
  width: 48px; /* w-12 */
  height: 48px; /* h-12 */
  position: relative;
  background: #6366f1; /* indigo-500 */
  border-radius: 12px; /* rounded-xl */
  overflow: hidden;
`;

const AvatarImg = styled.img`
  width: 32px; /* w-8 */
  height: 32px; /* h-8 */
  position: absolute;
  left: 8px; /* left-[8px] */
  top: 8px; /* top-[8px] */
`;

const NameBlock = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px; /* gap-1 */
`;

const NameText = styled.div`
  color: #111827; /* gray-900 */
  font-size: 1rem; /* text-base */
  font-weight: 600; /* font-semibold */
  letter-spacing: 0.02em; /* tracking-tight-ish */

  /* 单行省略 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0; /* 允许在 flex 中收缩以触发省略 */
`;

const StatusRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px; /* gap-2 */
`;

const StatusDot = styled.div<{ $joined: boolean }>`
  width: 8px; /* w-2 */
  height: 8px; /* h-2 */
  background: ${(props) => (props.$joined ? "#10b981" : "#cbd5e1")}; /* green/gray */
  border-radius: 999px; /* rounded-full */
`;

// 样式区域（紧随已有样式组件之后）
const StatusText = styled.div`
  color: #64748b; /* slate-500 */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  line-height: 1.5rem; /* leading-6 */
`;

const CardDescription = styled.div`
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3em;
  color: #64748b; 
`;

const ActionButton = styled.button`
  width: 100%; /* self-stretch */
  height: 38px; /* h-12 */
  padding: 8px; /* p-2 */
  background: #10b981; /* emerald-400 */
  border: none;
  border-radius: 8px; /* rounded */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* gap-2.5 */
  color: white;
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* font-semibold */
  line-height: 1.25rem; /* leading-5 */
  cursor: pointer;

  &:hover {
    filter: brightness(0.95);
  }
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
        <SearchRoomsContainer>
          {loading ? (
            <LoadingContainer>Loading...</LoadingContainer>
          ) : mainAreaRooms.length === 0 ? (
            <EmptyState>No rooms found</EmptyState>
          ) : (
            mainAreaRooms.map((room, index) => (
              // 卡片：参考 feed 页签样式
              <IntegrationCard key={room.groupId} ref={index === 0 ? roomRef : null}>
                <CardTop>
                  <CardHeader>
                    <HeaderLeft>
                      <Avatar>
                        <AvatarImg src="https://placehold.co/32x32" alt="" />
                      </Avatar>
                      <NameBlock>
                        <NameText>{room.groupName}</NameText>
                        <StatusRow>
                          <StatusDot $joined={room.isJoined} />
                          <StatusText>{room.isJoined ? "Joined" : "Not Join"}</StatusText>
                        </StatusRow>
                      </NameBlock>
                    </HeaderLeft>
                  </CardHeader>

                  {/* 新增：房间信息区块（成员数与管理员） */}
                  <RoomInfo>
                    <InfoItem>
                      <MdGroup />
                      <InfoItemText>{room.memberCount} members</InfoItemText>
                    </InfoItem>
                    <InfoItem>
                      <InfoItemText>Admin: {room.adminName}</InfoItemText>
                    </InfoItem>
                  </RoomInfo>

                  <CardDescription>
                    {room.groupDescription || "Join this room to start chatting."}
                  </CardDescription>
                </CardTop>

                <ActionButton
                  onClick={() =>
                    handleJoinClick(room.groupId, room.groupType, room.isJoined)
                  }
                >
                  {room.isJoined ? "Joined" : "Join"}
                </ActionButton>
              </IntegrationCard>
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
