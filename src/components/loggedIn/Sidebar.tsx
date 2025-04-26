import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  IoIosArrowDown,
  IoIosStarOutline,
  IoMdPersonAdd,
} from "react-icons/io";
import { FiTag } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { TiPlus } from "react-icons/ti";
import { PiSignOutBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import { MdPeopleAlt } from "react-icons/md";
import CreateRoomComponent from "./CreateRoomComponent";
import { FaTag } from "react-icons/fa";
import JoinRooms from "./JoinRooms";
import CreateNewTag from "./CreateNewTag";
import axios from "axios";
import apiClient from "../loggedOut/apiClient";
import { UserInformation } from "./types";
import { useUser } from "./UserContext";

const SidebarContainer = styled.div`
  width: 23%;
  height: 100vh;
  background-color: #ffffff;
  padding: 2rem 0rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #016532;
  margin-top: 72px;
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

const ErrorContainer = styled.div`
  padding: 1rem;
  color: #dc2626;
  text-align: center;
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;

  @media (max-width: 600px) {
    font-size: 0.6rem;
  }
`;

const EmptyStateContainer = styled.div`
  padding: 1rem;
  text-align: center;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const LineSeparator = styled.hr`
  width: 90%;
  margin-left: 0;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 12px;

  @media (max-width: 900px) {
    width: 30px;
    height: 30px;
    margin-right: 5px;
  }

  @media (max-width: 500px) {
    width: 22px;
    height: 22px;
    margin-left: -5px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: 2px;
`;

const UserNameContainer = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.span<{ $textLength?: number }>`
  font-weight: bold;
  color: #333;
  width: 80%;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.2;
  font-size: ${(props) => {
    const length = props.$textLength || 0;
    if (length <= 10) return "1rem";
    if (length <= 15) return "0.9rem";
    if (length <= 20) return "0.8rem";
    if (length <= 25) return "0.75rem";
    return "0.7rem";
  }};

  @media (max-width: 600px) {
    font-size: 0.6rem;
    width: 80%;
  }
`;

const UserEmail = styled.span<{ $textLength?: number }>`
  color: #666;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.2;
  font-size: ${(props) => {
    const length = props.$textLength || 0;
    if (length <= 20) return "0.8rem";
    if (length <= 30) return "0.75rem";
    if (length <= 40) return "0.7rem";
    if (length <= 50) return "0.65rem";
    return "0.6rem";
  }};

  @media (max-width: 600px) {
    font-size: ${(props) => {
      const length = props.$textLength || 0;
      if (length <= 20) return "0.5rem";
      if (length <= 30) return "0.45rem";
      if (length <= 40) return "0.4rem";
      if (length <= 50) return "0.35rem";
      return "0.6rem";
    }};
  }
`;
const StyledArrowDown = styled(IoIosArrowDown)`
  color: black;
  margin-left: 0.1rem;
  font-size: 1rem;
  cursor: pointer;

  @media (max-width: 500px) {
    font-size: 0.7rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  margin-top: 1.5rem;
  z-index: 0;
`;

const SearchInput = styled.input`
  width: 55%;
  padding: 0.6rem 0.5rem 0.6rem 2rem;
  font-size: 0.7rem;
  border: 1px solid #9f9e9e;
  color: black;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 4%;

  @media (max-width: 1000px) {
    width: 60%;
    font-size: 0.55rem;
    padding: 0.6rem 0rem 0.6rem 1.5rem;
    word-break: break-word;
    word-wrap: break-word;
  }
  @media (max-width: 700px) {
    font-size: 0.4rem;
    padding: 0.6rem 0rem 0.6rem 0.7rem;
  }
`;

const StyledPlusContainer = styled.div`
  background-color: #d9d9d9;
  width: 14%;
  height: 88%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1000px) {
    width: 12%;
  }
`;

const StyledPlus = styled(TiPlus)`
  color: #016532;
  font-size: 1.8rem;
  cursor: pointer;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.4rem;
  margin-top: 1vh;
  gap: 0.3rem;
  width: 84%;
  background-color: #d9d9d9;

  @media (max-width: 600px) {
    gap: 0rem;
    padding: 0.2rem;
  }
`;

const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.5rem;
  height: 100%;
  border: none;
  border-radius: 0;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  word-wrap: break-word;
  word-break: break-word;
  background-color: ${({ isActive }) => (isActive ? "white" : "transparent")};
  color: ${({ isActive }) => (isActive ? "#016532" : "black")};
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${({ isActive }) => (isActive ? "white" : "#e0e0e0")};
  }
  @media (max-width: 900px) {
    font-size: 0.65rem;
    padding: 0.5rem 0rem;
  }
  @media (max-width: 800px) {
    font-size: 0.6rem;
  }
  @media (max-width: 600px) {
    font-size: 0.5rem;
    height: 90%;
  }
  @media (max-width: 500px) {
    font-size: 0.45rem;
  }
`;

interface ToggleButtonProps {
  isActive: boolean;
}

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 45vh;
  overflow-y: auto;
`;

const RoomContainer = styled.div`
  display: flex;
  margin: 0;
  margin-bottom: 12px;
`;

const Tag = styled(FiTag)`
  color: black;
  font-size: 1.3rem;
  margin: 0rem 1rem 0 1rem;

  @media (max-width: 700px) {
    margin: 0rem 0.3rem 0 0.2rem;
    font-size: 1rem;
  }
  @media (max-width: 400px) {
    margin: 0rem 0.2rem 0 0.1rem;
  }
`;

const RoomDescContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%; /* or set a specific width like width: 200px; */
  min-width: 0; /* Important for text truncation/wrapping */
`;

const RoomTitle = styled.p`
  font-size: 0.9rem;
  font-family: Roboto;
  color: black;
  margin: 0;
  cursor: pointer;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 500px) {
    font-size: 0.6rem;
  }
`;

const RoomDesc = styled.p`
  font-family: Roboto;
  font-size: 0.8rem;
  color: #757575;
  margin: 0;

  @media (max-width: 500px) {
    font-size: 0.5rem;
  }
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  font-size: 1.5rem;
  left: 0.5rem;

  @media (max-width: 1000px) {
    font-size: 1.2rem;
    left: 0.3rem;
  }
  @media (max-width: 700px) {
    font-size: 0.7rem;
    left: 0.1rem;
  }
`;

const Star = styled(IoIosStarOutline)`
  color: black;
  font-size: 1.3rem;
  margin: 0.2rem 1rem 0 1rem;

  @media (max-width: 700px) {
    margin: 0.2rem 0.3rem 0 0.2rem;
    font-size: 1rem;
  }
  @media (max-width: 400px) {
    margin: 0.2rem 0.2rem 0 0.1rem;
  }
`;

const ProfilePopUpContainer = styled.div`
  position: absolute;
  top: 13vh;
  left: 5%;
  width: 12%;
  height: 8vh;
  border: 1px solid #016532;
  border-radius: 8px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1vh 1%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 3000;

  @media (max-width: 1000px) {
    font-size: 0.8rem;
  }

  @media (max-width: 500px) {
    height: 5.5vh;
    font-size: 0.5rem;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: -3%;
  right: -5%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 1000px) {
    right: -10%;
  }
  @media (max-width: 600px) {
    top: -5%;
    right: -12%;
    font-size: 0.8rem;
  }
  @media (max-width: 500px) {
    top: -5%;
    right: -15%;
    font-size: 0.8rem;
  }
`;

const StyledProfilePopUpCross = styled(RxCross2)`
  color: #016532;
`;

const StyledMe = styled.p`
  margin: 0;
  padding-left: 1%;
  font-style: italic;
  font-family: Roboto;
`;

const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid #d9d9d9;
  width: 100%;
  margin: 0 auto;
`;

const StyledSignOutContainer = styled.div`
  margin: 0;
  width: 100%;
  height: 50%;
  padding-left: 1%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledSignOutText = styled.p`
  font-family: Roboto;

  @media (max-width: 700px) {
    width: 130%;
    margin-right: -1rem;
  }

  @media (max-width: 350px) {
  font-size: 0.45rem; }
`;

const StyledSignOutIcon = styled(PiSignOutBold)`
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;

  @media (max-width: 600px) {
    width: 1.2rem;
    height: 1.2rem;
  }

  @media (max-width: 350px){
  width: 0.8rem;
  height: 0.8rem;}
`;

const PlusButtonOverlayContainer = styled.div`
  position: absolute;
  top: 24vh;
  left: 14.8%;
  width: 13%;
  height: 12vh;
  border: 1px solid #016532;
  border-radius: 8px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.8vh 1%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 650px) {
    left: -10%;
    width: 305;
  }

  @media (max-width: 800px) {
    left: 9%;
    width: 18%;
  }
`;

const PlusButtonOptionContainer = styled.div`
  margin: 0;
  width: 100%;
  height: 33.5%;
  display: flex;
  align-items: center;
  gap: 3%;
`;

const StyledIoMdPersonAdd = styled(IoMdPersonAdd)`
  width: 20px;
  height: 20px;
  color: #016532;

  @media (max-width: 500px) {
    width: 16px;
    height: 16px;
  }
`;

const StyledMdPeopleAlt = styled(MdPeopleAlt)`
  width: 20px;
  height: 20px;
  margin-left: 2px;
  color: #016532;
  @media (max-width: 500px) {
    width: 16px;
    height: 16px;
  }
`;

const StyledFiTag = styled(FaTag)`
  width: 20px;
  height: 20px;
  color: #016532;
  @media (max-width: 500px) {
    width: 16px;
    height: 16px;
  }
`;

const StyledPlusButtonOptionText = styled.span`
  font-family: Roboto;
  font-weight: 600;
  font-size: 0.9rem;
  color: black;

  @media (max-width: 1200px) {
    font-size: 0.8rem;
  }

  @media (max-width: 1090px) {
    font-size: 0.75rem;
  }

  @media (max-width: 800px) {
    font-size: 0.65rem;
  }
  @media (max-width: 700px) {
    font-size: 0.55rem;
  }
  @media (max-width: 500px) {
    font-size: 0.45rem;
  }
`;

const LoadingSpinner = () => (
  <SpinnerWrapper>
    <Spinner />
  </SpinnerWrapper>
);

interface OverlayProps {
  onClose: () => void;
  userInfo?: UserInformation | null;
}

const ProfilePopUp: React.FC<OverlayProps> = ({ onClose }) => {
  const navigate = useNavigate(); // Call useNavigate directly

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/v1/user/logout");
      if (response.data.code === 200) {
        alert("Successfully logged out!");
        navigate("/"); // Use the navigate function to go to the home page
      } else {
        alert(response.data.message || "Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out", error);
      alert("Failed to log out.");
    }
  };

  return (
    <ProfilePopUpContainer>
      <ModalCloseButton onClick={onClose}>
        <StyledProfilePopUpCross />
      </ModalCloseButton>
      <StyledMe>ME</StyledMe>
      <HorizontalLine />
      <StyledSignOutContainer onClick={handleLogout}>
        <StyledSignOutText>Sign Out</StyledSignOutText>
        <StyledSignOutIcon />
      </StyledSignOutContainer>
    </ProfilePopUpContainer>
  );
};

const PlusButtonOverlay: React.FC<OverlayProps> = ({ onClose, userInfo }) => {
  const [isCreateRoomOverlayVisible, setIsCreateRoomOverlayVisible] =
    useState(false);
  const [isJoinRoomsOverlayVisible, setIsJoinRoomsOverlayVisible] =
    useState(false);
  const [isCreateTagOverlayVisible, setIsCreateTagOverlayVisible] =
    useState(false);

  return (
    <PlusButtonOverlayContainer>
      <ModalCloseButton onClick={onClose}>
        <StyledProfilePopUpCross />
      </ModalCloseButton>
      <PlusButtonOptionContainer
        onClick={() => setIsCreateRoomOverlayVisible(true)}
      >
        <StyledIoMdPersonAdd />
        <StyledPlusButtonOptionText>CREATE NEW ROOM</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>
      <PlusButtonOptionContainer
        onClick={() => setIsJoinRoomsOverlayVisible(true)}
      >
        <StyledMdPeopleAlt />
        <StyledPlusButtonOptionText>JOIN A ROOM</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>
      <PlusButtonOptionContainer
        onClick={() => setIsCreateTagOverlayVisible(true)}
      >
        <StyledFiTag />
        <StyledPlusButtonOptionText>CREATE NEW TAG</StyledPlusButtonOptionText>
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
        <CreateNewTag onClose={() => setIsCreateTagOverlayVisible(false)} />
      )}
    </PlusButtonOverlayContainer>
  );
};

interface RoomGroup {
  groupId: number;
  groupName: string;
  groupDescription: string;
  groupType: number;
  adminId: number;
  adminName: string;
  memberCount: number;
}

interface GroupListResponse {
  code: number;
  message: string;
  data: {
    pageSize: number;
    pageNum: number;
    pages: number;
    total: number;
    data: RoomGroup[];
  };
}

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

const roomsCache = new Map<string, RoomGroup[]>(); // Cache keyed by search query
const tagsCache = new Map<string, Tag[]>(); // Cache keyed by search query

const Sidebar: React.FC = () => {
  const { userInfo, isUserInfoLoading, userInfoError } = useUser();
  const [roomSearch, setRoomSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [activeTab, setActiveTab] = useState<"myRooms" | "myTags">("myRooms");
  const [rooms, setRooms] = useState<RoomGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNum: 1,
    total: 0,
    pages: 0,
  });

  const [isPlusButtonOverlayVisible, setIsPlusButtonOverlayVisible] =
    useState(false);

  useEffect(() => {
    if (activeTab === "myRooms") {
      fetchRooms();
    } else {
      fetchTags();
    }
  }, [pagination.pageNum, roomSearch, tagSearch, activeTab]);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);

    // Generate cache key based on search query and pagination
    const cacheKey = `${roomSearch}-${pagination.pageNum}`;

    // Check if data is cached
    if (roomsCache.has(cacheKey)) {
      setRooms(roomsCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    try {
      const requestData = {
        keyword: roomSearch || undefined,
        groupDemonTypeEnum: "JOINEDROOM",
        pageRequestVO: {
          pageSize: pagination.pageSize,
          pageNum: pagination.pageNum,
        },
      };

      console.log("Fetching rooms with params:", requestData);

      const response = await apiClient.post<GroupListResponse>(
        "/v1/group/get_group_list",
        requestData
      );

      console.log("Room API response:", response.data);

      if (response.data.code === 200) {
        const fetchedRooms = response.data.data.data;
        setRooms(fetchedRooms);
        setPagination({
          pageSize: response.data.data.pageSize,
          pageNum: response.data.data.pageNum,
          total: response.data.data.total,
          pages: response.data.data.pages,
        });
        // Cache the fetched data
        roomsCache.set(cacheKey, fetchedRooms);
      } else {
        setError(
          `API returned error code: ${response.data.code}, message: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in fetchRooms:",
          error.response?.data || error.message
        );
        setError(
          error.response?.data?.message ||
            "Failed to fetch rooms. Please try again."
        );
      } else {
        console.error("Unexpected error in fetchRooms:", error);
        setError(
          "An unexpected error occurred while fetching rooms. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    setIsLoading(true);
    setError(null);

    // Generate cache key based on search query and pagination
    const cacheKey = `${tagSearch}-${pagination.pageNum}`;

    // Check if data is cached
    if (tagsCache.has(cacheKey)) {
      setTags(tagsCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    try {
      const requestData = {
        keyword: tagSearch || undefined,
        pageRequestVO: {
          pageSize: pagination.pageSize,
          pageNum: pagination.pageNum,
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
        setPagination({
          pageSize: response.data.data.pageSize,
          pageNum: response.data.data.pageNum,
          total: response.data.data.total,
          pages: response.data.data.pages,
        });
        // Cache the fetched data
        tagsCache.set(cacheKey, fetchedTags);
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

  const navigate = useNavigate();

  return (
    <SidebarContainer>
      <ProfileSection>
        {isUserInfoLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        ) : userInfoError ? (
          <ErrorContainer>
            <ErrorMessage>{userInfoError}</ErrorMessage>
          </ErrorContainer>
        ) : userInfo ? (
          <>
            <Avatar
              src={`data:image/png;base64,${userInfo.userPortrait}`}
              alt="User Avatar"
            />
            <UserInfo>
              <UserNameContainer>
                <UserName $textLength={userInfo.userName.toString().length}>
                  {userInfo.userName}
                </UserName>
                <StyledArrowDown
                  onClick={() => setIsProfileClicked(!isProfileClicked)}
                />
                {isProfileClicked && (
                  <ProfilePopUp
                    onClose={() => setIsProfileClicked(false)}
                    userInfo={userInfo} // Pass the actual userInfo here
                  />
                )}
              </UserNameContainer>
              <UserEmail $textLength={userInfo.userEmail.toString().length}>
                {userInfo.userEmail}
              </UserEmail>
            </UserInfo>
          </>
        ) : (
          <EmptyStateContainer>
            <EmptyStateMessage>No user information available</EmptyStateMessage>
          </EmptyStateContainer>
        )}
      </ProfileSection>
      <LineSeparator />

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          placeholder={
            activeTab === "myRooms" ? "Search in MY ROOMS" : "Search in MY TAGS"
          }
          value={activeTab === "myRooms" ? roomSearch : tagSearch}
          onChange={
            activeTab === "myRooms"
              ? (e) => setRoomSearch(e.target.value)
              : (e) => setTagSearch(e.target.value)
          }
        />

        <StyledPlusContainer>
          <StyledPlus onClick={() => setIsPlusButtonOverlayVisible(true)} />
        </StyledPlusContainer>
      </SearchContainer>
      {isPlusButtonOverlayVisible && (
        <PlusButtonOverlay
          onClose={() => setIsPlusButtonOverlayVisible(false)}
          userInfo={userInfo}
        />
      )}

      <ToggleContainer>
        <ToggleButton
          isActive={activeTab === "myRooms"}
          onClick={() => setActiveTab("myRooms")}
        >
          MY ROOMS
        </ToggleButton>
        <ToggleButton
          isActive={activeTab === "myTags"}
          onClick={() => setActiveTab("myTags")}
        >
          MY TAGS
        </ToggleButton>
      </ToggleContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        <>
          {activeTab === "myRooms" && (
            <RoomList>
              {rooms.length > 0
                ? rooms.map((room) => (
                    <RoomContainer key={room.groupId}>
                      <Star />
                      <RoomDescContainer>
                        <RoomTitle
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
                        >
                          {room.groupName}
                        </RoomTitle>
                        <RoomDesc>{room.groupDescription}</RoomDesc>
                      </RoomDescContainer>
                    </RoomContainer>
                  ))
                : !isLoading && <ErrorMessage>No rooms found.</ErrorMessage>}
            </RoomList>
          )}

          {activeTab === "myTags" && (
            <RoomList>
              {tags.length > 0
                ? tags.map((tag) => (
                    <RoomContainer key={tag.tagId}>
                      <Tag />
                      <RoomDescContainer>
                        <RoomTitle
                          onClick={() =>
                            navigate(`/my-class/${tag.tagId.toString()}`, {
                              state: { title: tag.tagName, tagId: tag.tagId },
                            })
                          }
                        >
                          {tag.tagName}
                        </RoomTitle>
                      </RoomDescContainer>
                    </RoomContainer>
                  ))
                : !isLoading && <ErrorMessage>No tags found.</ErrorMessage>}
            </RoomList>
          )}
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
