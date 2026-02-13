import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent"; // Modal Component
import { useRoomContext } from "./RoomContext";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import { MdGroup, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight} from "react-icons/md";
import {
  SearchRoomsContainer,
  LoadingContainer,
  EmptyState,
  IntegrationCard,
  CardTop,
  CardHeader,
  HeaderLeft,
  Avatar,
  AvatarImg,
  NameBlock,
  NameText,
  StatusRow,
  StatusDot,
  StatusText,
  RoomInfo,
  InfoItem,
  InfoItemText,
  CardDescription,
  ActionButton,
  PageButton,            // 新增
  PaginationCenter,      // 新增
  PageNumber,            // 新增
  EllipsisBlock,         // 新增
} from "../SharedComponents";

// 样式区域（紧随已有样式组件之后）
const Container = styled.div`
  background: var(--color-line);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  height: calc(100vh - 5rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
`;


// Footer：把 gap 调小，让 PageButton 更贴近中心区
const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-1);
  position: relative;
  height: 1rem;
  width: 100%;
  background-color: white;
  padding: var(--space-6) 0;
  margin-top: var(--space-5);
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-weight: var(--weight-regular);
`;

// 在本地定义一个固定宽度版本，覆盖 SharedComponents 的 PaginationCenter（保持最多页码展示宽度）
const PaginationCenterFixed = styled(PaginationCenter)`
  flex: 0;
  gap: var(--space-2);
  min-width: calc(6 * (var(--space-9) + var(--space-3)) + 5 * var(--space-2));
`;

function SearchRooms() {
  const { mainAreaRooms, mainAreaRoomsPagination, setMainAreaRoomListRequest } =
    useRoomContext();
  const [currentPage] = useState(1);
  const [roomsPerPage] = useState(20);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [searchKeyword] = useState("");
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

  // 复制 Sidebar 的页码生成规则：两边 Ellipsis，中间数字；≤5 页全展示；>5 页按规则展示
  const getPageItems = (current: number, total: number): Array<number | "ellipsis"> => {
    // ≤5 页：全展示
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // >5 页：按你给出的规则与对称形式处理
    if (current === 1) {
      return [1, 2, "ellipsis", total - 1, total];
    }
    if (current === 2) {
      return [1, 2, 3, "ellipsis", total];
    }
    if (current === 3) {
      return [1, "ellipsis", 3, "ellipsis", total];
    }
    if (current === total) {
      return [1, 2, "ellipsis", total - 1, total];
    }
    if (current === total - 1) {
      return [1, "ellipsis", total - 2, total - 1, total];
    }
    if (current === total - 2) {
      return [1, "ellipsis", total - 2, total - 1, total];
    }

    // 中间页：左右省略，当前页居中
    return [1, "ellipsis", current, "ellipsis", total];
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
                  {room.isJoined ? "Enter" : "Join"}
                </ActionButton>
              </IntegrationCard>
            ))
          )}
        </SearchRoomsContainer>

        {/* 替换为与 Sidebar 完全一致的分页器结构与样式 */}
        <Footer>
          <PageButton
            onClick={() => handlePageChange(1)}
            disabled={mainAreaRoomsPagination.pageNum === 1}
          >
            <MdKeyboardDoubleArrowLeft/>
          </PageButton>

          <PageButton
            onClick={() => handlePageChange(mainAreaRoomsPagination.pageNum - 1)}
            disabled={mainAreaRoomsPagination.pageNum === 1}
          >
            <MdKeyboardArrowLeft/>
          </PageButton>

          {/* 替换为固定宽度的中心区，防抖动 */}
          <PaginationCenterFixed>
            {getPageItems(mainAreaRoomsPagination.pageNum, mainAreaRoomsPagination.pages).map(
              (item, idx) =>
                item === "ellipsis" ? (
                  <EllipsisBlock key={`e-${idx}`}>...</EllipsisBlock>
                ) : (
                  <PageNumber
                    key={item}
                    $active={mainAreaRoomsPagination.pageNum === item}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </PageNumber>
                )
            )}
          </PaginationCenterFixed>

          <PageButton
            onClick={() => handlePageChange(mainAreaRoomsPagination.pageNum + 1)}
            disabled={mainAreaRoomsPagination.pageNum === mainAreaRoomsPagination.pages}
          >
            <MdKeyboardArrowRight/>
          </PageButton>

          <PageButton
            onClick={() => handlePageChange(mainAreaRoomsPagination.pages)}
            disabled={mainAreaRoomsPagination.pageNum === mainAreaRoomsPagination.pages}
          >
            <MdKeyboardDoubleArrowRight/>
          </PageButton>
        </Footer>
      </Container>
    </>
  );
};

export default SearchRooms;
