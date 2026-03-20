import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import {
  IoMdPersonAdd,
} from "react-icons/io";
import { FiTag, FiX } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { MdPeopleAlt, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import CreateRoomComponent from "./CreateRoomComponent";
import { FaTag } from "react-icons/fa";
import JoinRooms from "./JoinRooms";
import CreateNewTag from "./CreateNewTag";
import { useUserInfo } from "../../hooks/queries/useUser";
import { useRoomContext } from "./RoomContext";
import type { Tag } from "./RoomContext";
import { RoomGroup } from "./useJoinRoom";
import { MdGroup } from "react-icons/md";
import LabeledInputWithCount from "../ui/Input";
import logo from "../../assets/alicloggreen.png";
import {
  HorizontalLine,
  PaginationContainer,
  PageButton,
  PaginationCenter,
  PageNumber,
  EllipsisBlock,
  RoomList,
  RoomContainer,
  RoomInfoContainer,
  RoomTitle,
  RoomDesc,
} from "../ui/SharedComponents";

const Logo = styled.img`
  width: 6rem;
  height: 2.5rem;
  align-items: center;
  margin: 0 2rem 0 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 7rem;
    height: 3rem;
    margin: 0 3rem 0 0;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 8rem;
    height: 3.25rem;
    margin: 0 4rem 0 0;
  }
`;

const SidebarContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: var(--white);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  border-right: 1px solid var(--color-line);
  transform: translateX(-100%);
  transition: transform 0.3s ease;

  &.open {
    transform: translateX(0);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 14rem;
    transform: translateX(0);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 16rem;
    transform: translateX(0);
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.5rem;
  width: 100%;
  position: relative;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: 4.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: 5rem;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: var(--space-1);
  cursor: pointer;
  color: var(--slate-grey);
  font-size: var(--space-5);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    display: none;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    display: none;
  }

  &:hover {
    color: var(--emerald-green);
  }
`;

const SearchContainer = styled.div`
  width: 95%;
  height: auto;
  padding: var(--space-3);
  margin: var(--space-2);
  background-color: var(--input-bg);
  border-radius: var(--radius-5);
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: var(--space-8);
    padding: var(--space-4);
    margin: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: var(--space-8);
    padding: var(--space-4);
    margin: var(--space-3);
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-2);
  height: 100%;
  flex: 1;
  position: relative;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-3);
  }
`;

const SearchIcon = styled(CiSearch)`
  font-size: var(--space-4);
  color: var(--input);
  z-index: 1;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: var(--space-2);
  margin: var(--space-2);
  gap: var(--space-2);
  width: 95%;
  height: var(--space-7);
  background-color: var(--color-line);
  border-radius: var(--radius-5);
  border: 1px solid var(--color-line);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-2);
    margin: var(--space-3);
    height: var(--space-8);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-2);
    margin: var(--space-3);
    height: var(--space-8);
  }
`;

const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 90%;
  padding: var(--space-2);
  border: 1px solid ${({ $isActive }) => ($isActive ? "var(--emerald-green)" : "transparent")};
  border-radius: var(--radius-5);
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);
  font-size: var(--space-3);
  word-wrap: break-word;
  word-break: break-word;
  background-color: ${({ $isActive }) => ($isActive ? "var(--white)" : "var(--gray-200-slate)")};
  color: ${({ $isActive }) => ($isActive ? "var(--emerald-green)" : "var(--slate-grey)")};
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  outline: none;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-3);
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-3);
    font-size: var(--space-4);
  }

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? "var(--white)" : "var(--gray-200-slate)")};
    border-color: ${({ $isActive }) => ($isActive ? "var(--emerald-green)" : "var(--gray-200-slate)")};
    color: ${({ $isActive }) => ($isActive ? "var(--emerald-green)" : "var(--slate-grey)")};
  }
  &:focus {
    outline: none;
    background-color: ${({ $isActive }) => ($isActive ? "var(--white)" : "var(--gray-200-slate)")};
    color: ${({ $isActive }) => ($isActive ? "var(--emerald-green)" : "var(--slate-grey)")};
  }
`;

interface ToggleButtonProps {
  $isActive: boolean;
}

const GroupIcon = styled(MdGroup)`
  color: var(--muted-6b7280);
  font-size: var(--space-4);
  margin-right: var(--space-3);
  align-self: flex-start;
  flex-shrink: 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
    margin-right: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
    margin-right: var(--space-4);
  }
`;
const Tag = styled(FiTag)`
  color: var(--muted-6b7280);
  font-size: var(--space-4);
  margin-right: var(--space-3);
  align-self: flex-start;
  flex-shrink: 0;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
    margin-right: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
    margin-right: var(--space-4);
  }
`;

const PlusButtonOverlayContainer = styled.div`
  background-color: var(--white);
  z-index: 20;
  width: 100%;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: var(--space-1) 0;
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 14rem;
    padding: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 14rem;
    padding: var(--space-4);
  }
`;
const PlusButtonTitleContainer = styled.div`
  position: relative;
  width: 100%;
  height: var(--space-6);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 14rem;
    height: var(--space-7);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 14rem;
    height: var(--space-7);
  }
`;
const PlusButtonOptionContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 1.75rem;
  cursor: pointer;
  gap: var(--space-4);
  transition: background-color 0.2s ease, transform 0.1s ease;
  border-radius: var(--radius-5);
  padding: 0 var(--space-3);
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 13rem;
    height: 2rem;
    gap: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 13rem;
    height: 2rem;
    gap: var(--space-5);
  }

  &:hover {
    background-color: var(--color-line);
  }

  &:hover svg {
    color: var(--emerald-green);
  }

  &:hover span {
    color: var(--emerald-green);
  }
`;

const StyledIoMdPersonAdd = styled(IoMdPersonAdd)`
  color: var(--slate-grey);
  font-size: var(--space-4);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-9);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-9);
  }
`;

const StyledMdPeopleAlt = styled(MdPeopleAlt)`
  color: var(--slate-grey);
  font-size: var(--space-4);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-9);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-9);
  }
`;

const StyledFiTag = styled(FaTag)`
  font-size: var(--space-4);
  color: var(--slate-grey);
  position: relative;
  margin-left: var(--space-1);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const StyledPlusButtonTitleText = styled.span`
  font-family: var(--font-roboto-serif);
  font-weight: var(--weight-medium);
  font-size: var(--space-4);
  color: var(--slate-grey);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const StyledPlusButtonOptionText = styled.span`
  font-family: var(--font-roboto-serif);
  font-weight: var(--weight-medium);
  color: var(--slate-grey);
  font-size: var(--space-4);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-10);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-10);
  }
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: var(--space-3);
  font-weight: 500;
  color: black;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;
interface UserInformation {
    userId: number;
    userEmail: string;
    userName: string;
    userPortrait: string;
  }
interface PlusButtonOverlayProps {
  userInfo?: UserInformation | null;
  onTagCreated?: () => void;
  isCreateRoomOverlayVisible: boolean;
  setIsCreateRoomOverlayVisible: (visible: boolean) => void;
  isJoinRoomsOverlayVisible: boolean;
  setIsJoinRoomsOverlayVisible: (visible: boolean) => void;
  isCreateTagOverlayVisible: boolean;
  setIsCreateTagOverlayVisible: (visible: boolean) => void;
}

const PlusButtonOverlay: React.FC<PlusButtonOverlayProps> = ({
  userInfo,
  onTagCreated,
  isCreateRoomOverlayVisible,
  setIsCreateRoomOverlayVisible,
  isJoinRoomsOverlayVisible,
  setIsJoinRoomsOverlayVisible,
  isCreateTagOverlayVisible,
  setIsCreateTagOverlayVisible,
}) => {
  return (
    <PlusButtonOverlayContainer>
      <PlusButtonTitleContainer>
        <StyledPlusButtonTitleText>Create New</StyledPlusButtonTitleText>
      </PlusButtonTitleContainer>
      <PlusButtonOptionContainer
        onClick={() => {
          setIsCreateRoomOverlayVisible(true);
        }}
      >
        <StyledIoMdPersonAdd />
        <StyledPlusButtonOptionText>Create New Room</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>
      <PlusButtonOptionContainer
        onClick={() => {
          setIsJoinRoomsOverlayVisible(true);
        }}
      >
        <StyledMdPeopleAlt />
        <StyledPlusButtonOptionText>Join A Room</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>
      <PlusButtonOptionContainer
        onClick={() => {
          setIsCreateTagOverlayVisible(true);
        }}
      >
        <StyledFiTag />
        <StyledPlusButtonOptionText>Create New Tag</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>

      {isCreateRoomOverlayVisible && (
        <CreateRoomComponent
          onClose={() => setIsCreateRoomOverlayVisible(false)}
          fromSidebar={true}
        />
      )}
      {isJoinRoomsOverlayVisible && userInfo && (
        <JoinRooms onClose={() => setIsJoinRoomsOverlayVisible(false)} />
      )}
      {isCreateTagOverlayVisible && (
        <CreateNewTag
          onClose={() => setIsCreateTagOverlayVisible(false)}
          onTagCreated={onTagCreated}
        />
      )}
    </PlusButtonOverlayContainer>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { userInfo } = useUserInfo();
  const {
    sidebarRooms,
    sidebarRoomsPagination,
    tags,
    tagsPagination,
    setSidebarRoomListRequest,
    setTagListRequest,
    refreshTags,
  } = useRoomContext();
  const [roomSearch, setRoomSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  // 将子组件的状态提升到这里
  const [isCreateRoomOverlayVisible, setIsCreateRoomOverlayVisible] = useState(false);
  const [isJoinRoomsOverlayVisible, setIsJoinRoomsOverlayVisible] = useState(false);
  const [isCreateTagOverlayVisible, setIsCreateTagOverlayVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"myRooms" | "myTags">(
    location.pathname.startsWith("/my-class/") ? "myTags" : "myRooms"
  );
  useEffect(() => {
    if (location.pathname.startsWith("/my-class/")) {
      setActiveTab("myTags");
    } else if (location.pathname.startsWith("/my-room/")) {
      setActiveTab("myRooms");
    }
  }, [location.pathname]);

  const navigateToRoom = useCallback(
    (room: RoomGroup) => {
      navigate(`/my-room/${room.groupId.toString()}`, {
        state: {
          title: room.groupName,
          desc: room.groupDescription,
          groupId: room.groupId,
          adminId: room.adminId,
          adminName: room.adminName,
          memberCount: room.memberCount,
          groupType: room.groupType,
          isJoined: room.isJoined,
        },
      });
    },
    [navigate]
  );

  const navigateToTag = useCallback(
    (tag: Tag) => {
      navigate(`/my-class/${tag.tagId.toString()}`, {
        state: { title: tag.tagName, tagId: tag.tagId },
      });
    },
    [navigate]
  );

  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  useEffect(() => {
    const match = location.pathname.match(/\/my-room\/(\d+)/);
    if (match) {
      setActiveRoomId(parseInt(match[1], 10));
    } else {
      setActiveRoomId(null);
    }
  }, [location.pathname]);

  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  useEffect(() => {
    const match = location.pathname.match(/\/my-class\/(\d+)/);
    if (match) {
      setActiveTagId(parseInt(match[1], 10));
    } else {
      setActiveTagId(null);
    }
  }, [location.pathname]);

  const handlePageChange = (page: number) => {
    if (activeTab === "myRooms") {
      const clampedPage = Math.max(
        1,
        Math.min(page, sidebarRoomsPagination.pages)
      );
      setSidebarRoomListRequest({
        keyword: roomSearch,
        groupDemonTypeEnum: "JOINEDROOM",
        pageRequestVO: {
          pageSize: sidebarRoomsPagination.pageSize,
          pageNum: clampedPage,
        },
      });
    } else {
      const clampedPage = Math.max(1, Math.min(page, tagsPagination.pages));
      setTagListRequest((prev) => ({
        ...prev,
        pageRequestVO: {
          ...prev.pageRequestVO,
          pageNum: clampedPage,
        },
      }));
    }
  };

  // 与 SearchRooms 一致的页码生成规则
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

  useEffect(() => {
    if (activeTab === "myRooms") {
      fetchRooms();
    }
  }, [sidebarRoomsPagination.pageNum, roomSearch, activeTab]);

  useEffect(() => {
    setTagListRequest({
      keyword: tagSearch,
      pageRequestVO: {
        pageSize: tagsPagination.pageSize,
        pageNum: tagsPagination.pageNum,
      },
    });
  }, [tagSearch]);

  const fetchRooms = async () => {
    setSidebarRoomListRequest({
      keyword: roomSearch,
      groupDemonTypeEnum: "JOINEDROOM",
      pageRequestVO: {
        pageSize: sidebarRoomsPagination.pageSize,
        pageNum: sidebarRoomsPagination.pageNum,
      },
    });
  };



  return (
    <SidebarContainer className={isOpen ? 'open' : ''}>
      <LogoContainer>
        <Logo src={logo} alt="EduHK Logo" />
        <CloseButton onClick={onClose} aria-label="Close sidebar">
          <FiX size={24} />
        </CloseButton>
      </LogoContainer>
      <HorizontalLine/>
      <PlusButtonOverlay
        userInfo={userInfo}
        onTagCreated={refreshTags}
        isCreateRoomOverlayVisible={isCreateRoomOverlayVisible}
        setIsCreateRoomOverlayVisible={setIsCreateRoomOverlayVisible}
        isJoinRoomsOverlayVisible={isJoinRoomsOverlayVisible}
        setIsJoinRoomsOverlayVisible={setIsJoinRoomsOverlayVisible}
        isCreateTagOverlayVisible={isCreateTagOverlayVisible}
        setIsCreateTagOverlayVisible={setIsCreateTagOverlayVisible}
      />

      <HorizontalLine />
      <ToggleContainer>
        <ToggleButton
          $isActive={activeTab === "myRooms"}
          onClick={() => setActiveTab("myRooms")}
        >
          MY ROOMS
        </ToggleButton>
        <ToggleButton
          $isActive={activeTab === "myTags"}
          onClick={() => setActiveTab("myTags")}
        >
          MY TAGS
        </ToggleButton>
      </ToggleContainer>

      <SearchContainer>
        <SearchWrapper>
          <SearchIcon />

          <LabeledInputWithCount
            variant="unstyled"
            placeholder={
              activeTab === "myRooms" ? "Search in MY ROOMS" : "Search in MY TAGS"
            }
            value={activeTab === "myRooms" ? roomSearch : tagSearch}
            onChange={
              activeTab === "myRooms"
                ? (e) => setRoomSearch(e.target.value)
                : (e) => setTagSearch(e.target.value)
            }
            type="text"
            showCount={false}
          />
        </SearchWrapper>
      </SearchContainer>


        <>
          {activeTab === "myRooms" && (
            <>
              <RoomList>
                {sidebarRooms.length > 0
                  ? sidebarRooms.map((room) => (
                      <RoomContainer
                        key={room.groupId}
                        onClick={() => navigateToRoom(room)}
                        $isActive={room.groupId === activeRoomId}
                      >
                        <GroupIcon />
                        <RoomInfoContainer>
                          <RoomTitle>{room.groupName}</RoomTitle>
                          <RoomDesc>{room.groupDescription}</RoomDesc>
                        </RoomInfoContainer>
                      </RoomContainer>
                    ))
                  : <ErrorMessage>No rooms found.</ErrorMessage>}
              </RoomList>
              <PaginationContainer>
                
                <PageButton
                  onClick={() =>
                    handlePageChange(sidebarRoomsPagination.pageNum - 1)
                  }
                  disabled={sidebarRoomsPagination.pageNum === 1}
                >
                  <MdKeyboardArrowLeft />
                </PageButton>

                <PaginationCenter>
                  {getPageItems(
                    sidebarRoomsPagination.pageNum,
                    sidebarRoomsPagination.pages
                  ).map((item, idx) =>
                    item === "ellipsis" ? (
                      <EllipsisBlock key={`rooms-ellipsis-${idx}`}>...</EllipsisBlock>
                    ) : (
                      <PageNumber
                        key={`rooms-page-${item}`}
                        $active={item === Number(sidebarRoomsPagination.pageNum)}
                        onClick={() => handlePageChange(item)}
                      >
                        {item}
                      </PageNumber>
                    )
                  )}
                </PaginationCenter>

                <PageButton
                  onClick={() =>
                    handlePageChange(sidebarRoomsPagination.pageNum + 1)
                  }
                  disabled={
                    sidebarRoomsPagination.pageNum ===
                    sidebarRoomsPagination.pages
                  }
                >
                  <MdKeyboardArrowRight />
                </PageButton>
                
              </PaginationContainer>
            </>
          )}

          {activeTab === "myTags" && (
            <>
              <RoomList>
                {tags.length > 0
                  ? tags.map((tag) => (
                      <RoomContainer
                        key={tag.tagId}
                        onClick={() => navigateToTag(tag)}
                        $isActive={tag.tagId === activeTagId}
                      >
                        <Tag />
                        <RoomInfoContainer>
                          <RoomTitle>{tag.tagName}</RoomTitle>
                        </RoomInfoContainer>
                      </RoomContainer>
                    ))
                  : <ErrorMessage>No tags found.</ErrorMessage>}
              </RoomList>
              <PaginationContainer>
                <PageButton
                  onClick={() => handlePageChange(tagsPagination.pageNum - 1)}
                  disabled={tagsPagination.pageNum === 1}
                >
                  <MdKeyboardArrowLeft />
                </PageButton>

                <PaginationCenter>
                  {getPageItems(tagsPagination.pageNum, tagsPagination.pages).map(
                    (item, idx) =>
                      item === "ellipsis" ? (
                        <EllipsisBlock key={`tags-ellipsis-${idx}`}>...</EllipsisBlock>
                      ) : (
                        <PageNumber
                          key={`tags-page-${item}`}
                          $active={item === Number(tagsPagination.pageNum)}
                          onClick={() => handlePageChange(item)}
                        >
                          {item}
                        </PageNumber>
                      )
                  )}
                </PaginationCenter>

                <PageButton
                  onClick={() => handlePageChange(tagsPagination.pageNum + 1)}
                  disabled={tagsPagination.pageNum === tagsPagination.pages}
                >
                  <MdKeyboardArrowRight />
                </PageButton>
              </PaginationContainer>
            </>
          )}
        </>
    </SidebarContainer>
  );
};

export default Sidebar;
