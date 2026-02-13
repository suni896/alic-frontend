import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  IoMdPersonAdd,
} from "react-icons/io";
import { FiTag } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { MdPeopleAlt, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import CreateRoomComponent from "./CreateRoomComponent";
import { FaTag } from "react-icons/fa";
import JoinRooms from "./JoinRooms";
import CreateNewTag from "./CreateNewTag";
import axios from "axios";
import apiClient from "../loggedOut/apiClient";
import { UserInformation } from "./types";
import { useUser } from "./UserContext";
import { useRoomContext } from "./RoomContext";
import { RoomGroup } from "./useJoinRoom";
import { MdGroup } from "react-icons/md";
import LabeledInputWithCount from "../Input";
import { HorizontalLine } from "../common/HorizontalLine";
import logo from "../../assets/alicloggreen.png";
import {
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
} from "../SharedComponents";

const Logo = styled.img`
  width: 8rem;
  height: 3.25rem;
  align-items: center;
  margin: 0 4rem 0 0;
`;
const SidebarContainer = styled.div`
  width: 16rem;
  height: 100vh;
  background-color: var(--white);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  position: fixed; /* 保持固定定位 */
  left: 0; /* 固定在左侧 */
  top: 0; 
  z-index: 9999; /* 确保侧边栏在其他内容之上 */
  border-right: 1px solid var(--color-line); /* 右侧灰色边框 */
`;
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 5rem;
  width: 100%;
`;

const SearchContainer = styled.div`
  width: 95%;            
  height: var(--space-8);           
  padding: var(--space-4);
  margin: var(--space-3);      
  background-color: var(--input-bg);
  border-radius: var(--radius-5);   
  display: inline-flex;    /* inline-flex */
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-3);             
  height: 100%;
  flex: 1;
  position: relative;
`;

const SearchIcon = styled(CiSearch)`
  font-size: var(--space-5);
  color: var(--input);   
  z-index: 1;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: var(--space-2);
  margin: var(--space-3);
  gap: var(--space-2);
  width: 95%;
  height: var(--space-8);
  background-color: var(--color-line);
  border-radius: var(--radius-5);
  border: 1px solid var(--color-line);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
`;

const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 90%;
  padding: var(--space-3);
  border: 1px solid ${({ $isActive }) => ($isActive ? "var(--white)" : "transparent")};
  border-radius: var(--radius-5);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--space-4);
  word-wrap: break-word;
  word-break: break-word;
  background-color: ${({ $isActive }) => ($isActive ? "var(--white)" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "var(--slate-grey)" : "var(--slate-500)")};
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: ${({ $isActive }) =>
    $isActive ? "0 1px 3px var(--shadow-10)" : "none"};
  outline: none;

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? "var(--white)" : "var(--gray-200-slate)")};
    border-color: ${({ $isActive }) => ($isActive ? "var(--white)" : "var(--gray-200-slate)")};
    color: ${({ $isActive }) => ($isActive ? "var(--emerald-green)" : "var(--slate-grey)")};
  }
`;

interface ToggleButtonProps {
  $isActive: boolean;
}




const GroupIcon = styled(MdGroup)`
  color: var(--muted-6b7280);
  font-size: var(--space-5);
  margin-right: var(--space-4);
  align-self: flex-start;   /* 与 RoomTitle 顶部对齐 */
  flex-shrink: 0;
`;
const Tag = styled(FiTag)`
  color: var(--muted-6b7280);
  font-size: var(--space-5);
  margin-right: var(--space-4);
  align-self: flex-start;   /* 与 RoomTitle 顶部对齐 */
  flex-shrink: 0;
`;


const PlusButtonOverlayContainer = styled.div`
  background-color: var(--white);
  z-index: 20;
  width: 14rem;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: var(--space-1) 0;
`;
const PlusButtonTitleContainer = styled.div`
  position: relative;
  width: 14rem; 
  height: var(--space-7); 
`;
const PlusButtonOptionContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 13rem;
  height: 2rem;
  cursor: pointer;
  gap: var(--space-5);
  transition: background-color 0.2s ease, transform 0.1s ease;
  border-radius: var(--radius-5);
  padding: 0 var(--space-3) ;
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
  font-size: var(--space-9);
`;

const StyledMdPeopleAlt = styled(MdPeopleAlt)`
  color: var(--slate-grey);
  font-size: var(--space-9);
`;

const StyledFiTag = styled(FaTag)`
  font-size: var(--space-5);
  color: var(--slate-grey);
  position: relative;
  margin-left: var(--space-1);
`;

const StyledPlusButtonTitleText = styled.span`
  font-family: var(--font-roboto-serif);
  font-weight: var(--weight-medium);
  font-size: var(--space-5);
  color: var(--slate-grey);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;  
`;

const StyledPlusButtonOptionText = styled.span`
  font-family: var(--font-roboto-serif);
  font-weight: var(--weight-medium);  
  color: var(--slate-grey);       
  font-size: var(--space-10);  
  font-weight: var(--weight-medium); 
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;  
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
`;
const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: black;

  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

const LoadingSpinner = () => (
  <SpinnerWrapper>
    <Spinner />
  </SpinnerWrapper>
);

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

interface Tag {
  tagId: number;
  tagName: string;
}

interface TagListResponse {
  code: number;
  message: string;
  data: {
    pageSize: number;
    pageNum: number;
    pages: number;
    total: number;
    data: Tag[];
  };
}

function Sidebar() {
  const { userInfo } = useUser();
  const { sidebarRooms, sidebarRoomsPagination, setSidebarRoomListRequest } =
    useRoomContext();
  const [roomSearch, setRoomSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 将子组件的状态提升到这里
  const [isCreateRoomOverlayVisible, setIsCreateRoomOverlayVisible] = useState(false);
  const [isJoinRoomsOverlayVisible, setIsJoinRoomsOverlayVisible] = useState(false);
  const [isCreateTagOverlayVisible, setIsCreateTagOverlayVisible] = useState(false);

  const [tagsPagination, setTagsPagination] = useState({
    pageSize: 10,
    pageNum: 1,
    total: 0,
    pages: 0,
  });

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
      setTagsPagination((prev) => ({
        ...prev,
        pageNum: clampedPage,
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
    } else {
      fetchTags();
    }
  }, [
    sidebarRoomsPagination.pageNum,
    tagsPagination.pageNum,
    roomSearch,
    tagSearch,
    activeTab,
  ]);

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

  const fetchTags = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        keyword: tagSearch || undefined,
        pageRequestVO: {
          pageSize: tagsPagination.pageSize,
          pageNum: tagsPagination.pageNum,
        },
      };

      console.log("Fetching tags with params:", requestData);

      const response = await apiClient.post<TagListResponse>(
        "/v1/tag/get_tag_list",
        requestData
      );

      console.log("Tag API response:", response.data);

      if (response.data.code === 200) {
        const fetchedTags = response.data.data.data;
        setTags(fetchedTags);
        setTagsPagination({
          pageSize: response.data.data.pageSize,
          pageNum: response.data.data.pageNum,
          total: response.data.data.total,
          pages: response.data.data.pages,
        });
      } else {
        setError(
          `API returned error code: ${response.data.code}, message: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in fetchTags:",
          error.response?.data || error.message
        );
        setError(
          error.response?.data?.message ||
            "Failed to fetch tags. Please try again."
        );
      } else {
        console.error("Unexpected error in fetchTags:", error);
        setError(
          "An unexpected error occurred while fetching tags. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTags = useCallback(() => {
    setTagsPagination((prev) => ({
      ...prev,
      pageNum: 1,
    }));
    fetchTags();
  }, [fetchTags]);

  return (
    <SidebarContainer>
      <LogoContainer><Logo src={logo} alt="EduHK Logo" /></LogoContainer>
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

      {/* 子组件独立渲染 */}
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
          onTagCreated={refreshTags}
        />
      )}
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

      {error && <ErrorMessage>{error}</ErrorMessage>}
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

      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
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
                  : !isLoading && <ErrorMessage>No rooms found.</ErrorMessage>}
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
                  : !isLoading && <ErrorMessage>No tags found.</ErrorMessage>}
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
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
