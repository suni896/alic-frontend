import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  IoIosArrowDown,
  IoMdPersonAdd,
} from "react-icons/io";
import { FiTag } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { PiSignOutBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import { MdPeopleAlt, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
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
import PlusButton from "../PlusButton";
import UserNameEdit from "./UserNameEdit";

const SidebarContainer = styled.div`
  width: 280px;
  max-width: 320px; /* Fixed maximum width for consistency */
  min-width: 280px; /* Minimum width to prevent too narrow display */
  height: calc(100vh - 7vh);
  background-color: #ffffff;
  padding: 0rem 0rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #016532;
  position: fixed; /* 保持固定定位 */
  left: 0; /* 固定在左侧 */
  z-index: 100; /* 确保侧边栏在其他内容之上 */
  top: 7vh; /* 使用top替代margin-top，与导航栏高度匹配 */
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
  color: black;
  text-align: center;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
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

const EmptyStateContainer = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  margin: 0.5rem 0;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;

  @media (max-width: 500px) {
    font-size: 0.75rem;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  // margin-bottom: 10px;
  margin-top: 10px;
  height: 60px;
  // background-color: lightblue;
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
  min-width: 100px;
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
  align-items: flex-start;
  // margin-top: 0.8rem;
  gap: 1rem;
  padding: 0 1rem;
  justify-content: flex-start;
  margin-left: -10px;
  width: 250px;
  max-width: 320px; /* Fixed maximum width for consistency */
  min-width: 250px; /* Minimum width to prevent too narrow display */ 
  height: 40px;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 1000px;
  width: 160px;
  height: 40px;

  // 让里面的输入框继承这个高度
  display: flex;
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

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.25rem;
  margin: 0.5rem 0 0.5rem 0;
  gap: 0.2rem;
  width: 250px;
  height: 40px;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

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
  height: 90%;
  padding: 0.7rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  font-family: Roboto, sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  word-wrap: break-word;
  word-break: break-word;
  background-color: ${({ $isActive }) => ($isActive ? "white" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#016532" : "#64748b")};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $isActive }) =>
    $isActive ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none"};
  outline: none;

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? "white" : "#e2e8f0")};
    color: ${({ $isActive }) => ($isActive ? "#016532" : "#374151")};
  }

  &:focus {
    outline: none;
    box-shadow: ${({ $isActive }) =>
      $isActive 
        ? "0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(1, 101, 50, 0.2)" 
        : "0 0 0 2px rgba(1, 101, 50, 0.2)"};
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
  $isActive: boolean;
}

const RoomList = styled.ul`
  list-style: none;
  padding: 0.5rem;
  // flex: 1;
  overflow-y: auto;
  margin: 0 0 0.5rem 0;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  // width: 100%;
  width: 90%;
  height: calc(100vh - 7vh - 190px - 90px);

  @media (max-width: 900px) {
    max-width: 280px;
    min-width: 240px;
  }

  @media (max-width: 600px) {
    max-width: 240px;
    min-width: 200px;
  }

  @media (max-width: 400px) {
    max-width: 200px;
    min-width: 180px;
  }
`;

const RoomContainer = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: flex-start;
  margin: 0 0 0.5rem 0;
  padding: 0.75rem;
  background-color: white;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  width: 90%;
  height: calc(calc(100vh - 7vh - 190px - 90px)/12);
  ${({ $isActive }) =>
    $isActive &&
    `
      background-color: #e6f7ff;
      border: 2px solid #016532;
      box-shadow: 0 0 0 2px rgba(1, 101, 50, 0.2);
    `}

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #016532;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Tag = styled(FiTag)`
  color: #016532;
  font-size: 1.2rem;
  margin-right: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 700px) {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
  @media (max-width: 400px) {
    margin-right: 0.3rem;
    font-size: 0.9rem;
  }
`;

const RoomDescContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: calc(100% - 2rem); /* Fixed width accounting for icon space */
  min-width: 0;
  gap: 0.25rem;
  flex: 1;

  @media (max-width: 700px) {
    width: calc(100% - 1.5rem);
  }
  
  @media (max-width: 400px) {
    width: calc(100% - 1.2rem);
  }
`;

const RoomTitle = styled.p`
  font-size: 0.9rem;
  font-family: Roboto, sans-serif;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  transition: color 0.2s ease;

  &:hover {
    color: #016532;
  }

  @media (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const RoomDesc = styled.p`
  font-family: Roboto, sans-serif;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 100%;

  @media (max-width: 500px) {
    font-size: 0.65rem;
  }
`;


const GroupIcon = styled(MdGroup)`
  color: #016532;
  font-size: 1.2rem;
  margin-right: 0.75rem;
  margin-top: 0.1rem;
  flex-shrink: 0;

  @media (max-width: 700px) {
    margin-right: 0.5rem;
    font-size: 1rem;
    margin-top: 0.05rem;
  }
  @media (max-width: 400px) {
    margin-right: 0.3rem;
    font-size: 0.9rem;
    margin-top: 0.05rem;
  }
`;

const ProfilePopUpContainer = styled.div`
  position: absolute;
  left: 90px;
  top: 40px;
  width: 180px;
  height: 60px;
  border: 1px solid #016532;
  border-radius: 8px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1vh 1%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 3500;

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
  outline: none;
  &:focus {
    outline: none;
  }
  &:hover {
    opacity: 0.7;
  }

`;

const StyledProfilePopUpCross = styled(RxCross2)`
  color: #016532;
`;

const StyledMe = styled.p`
  margin: 0;
  padding-left: 1%;
  // font-style: italic;
  font-family: Roboto;
  color: #333;
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
  color: #333;

  @media (max-width: 700px) {
    width: 130%;
    margin-right: -1rem;
  }

  @media (max-width: 350px) {
    font-size: 0.45rem;
  }
`;

const StyledSignOutIcon = styled(PiSignOutBold)`
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
  color: #333;

  @media (max-width: 600px) {
    width: 1.2rem;
    height: 1.2rem;
  }

  @media (max-width: 350px) {
    width: 0.8rem;
    height: 0.8rem;
  }
`;

const PlusButtonOverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: calc(100% + 0.5rem);
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  width: 180px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlusButtonWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
`;

const PlusButtonOptionContainer = styled.div`
  margin: 0;
  width: 100%;
  height: 33.5%;
  display: flex;
  align-items: center;
  gap: 3%;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: #f4f4f4;
  }

  // &:active {
  //   transform: scale(0.9);
  // }
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
  position: relative;
  left: 2px;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  // background-color: lightblue;
  position: sticky;
  bottom: 10px;
  width: 90%;
  height: 30px;
  margin-top: auto;
  border-top: 1px solid #e2e8f0;
  // border-radius: 0 0 0.5rem 0.5rem;
  // box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 900px) {
    max-width: 280px;
    min-width: 240px;
  }

  @media (max-width: 600px) {
    max-width: 240px;
    min-width: 200px;
  }

  @media (max-width: 400px) {
    max-width: 200px;
    min-width: 180px;
  }

  @media (max-width: 800px) {
    gap: 0.3rem;
    padding: 0.75rem 0.5rem;
  }
`;

const PageButton = styled.button<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? "#386641" : "white")};
  color: ${(props) => (props.$active ? "white" : "#374151")};
  border: 1px solid ${(props) => (props.$active ? "#386641" : "#d1d5db")};
  border-radius: 0.375rem;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$active
      ? "0 1px 3px rgba(1, 101, 50, 0.2)"
      : "0 1px 2px rgba(0, 0, 0, 0.05)"};

  &:hover {
    background: ${(props) => (props.$active ? "#014d28" : "#f3f4f6")};
    border-color: ${(props) => (props.$active ? "#014d28" : "#9ca3af")};
    transform: translateY(-1px);
  }

  &:disabled {
    color: #9ca3af;
    background: #f9fafb;
    border-color: #e5e7eb;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &:hover {
      background: #f9fafb;
      border-color: #e5e7eb;
      transform: none;
    }
  }

  @media (max-width: 800px) {
    font-size: 0.7rem;
    padding: 0.3rem 0.5rem;
  }

  @media (max-width: 500px) {
    font-size: 0.6rem;
    padding: 0.25rem 0.4rem;
  }
`;

const Ellipsis = styled.span`
  padding: 0 0.5rem;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 500;

  @media (max-width: 500px) {
    font-size: 0.7rem;
    padding: 0 0.3rem;
  }
`;

const LoadingSpinner = () => (
  <SpinnerWrapper>
    <Spinner />
  </SpinnerWrapper>
);

interface ProfilePopUpProps {
  onClose: () => void;
  userInfo?: UserInformation | null;
}

interface PlusButtonOverlayProps {
  onClose: () => void;
  userInfo?: UserInformation | null;
  onTagCreated?: () => void;
  isCreateRoomOverlayVisible: boolean;
  setIsCreateRoomOverlayVisible: (visible: boolean) => void;
  isJoinRoomsOverlayVisible: boolean;
  setIsJoinRoomsOverlayVisible: (visible: boolean) => void;
  isCreateTagOverlayVisible: boolean;
  setIsCreateTagOverlayVisible: (visible: boolean) => void;
}

const ProfilePopUp: React.FC<ProfilePopUpProps> = ({ onClose }) => {
  const navigate = useNavigate(); // Call useNavigate directly
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // Add useRef to reference the popup container
  const popupRef = React.useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = async () => {
    try {
      const response = await apiClient.post("/v1/user/logout");
      if (response.data.code === 200) {
        localStorage.clear();
        document.cookie =
          "jwtToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=None";
        alert("Successfully logged out!");
        navigate("/");
      } else {
        alert(response.data.message || "Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out", error);
      alert("Failed to log out.");
    }
  };

  const handleEditUsername = () => {
    setIsEditingUsername(true);
  };

  const handleCloseEdit = () => {
    setIsEditingUsername(false);
  };

  const handleEditSuccess = () => {
    setIsEditingUsername(false);
  };

  if (isEditingUsername) {
    return (
      <UserNameEdit 
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <ProfilePopUpContainer ref={popupRef}>
      <ModalCloseButton onClick={onClose}>
        <StyledProfilePopUpCross />
      </ModalCloseButton>
      <StyledMe onClick={handleEditUsername} style={{cursor: 'pointer'}}>ME</StyledMe>
      <HorizontalLine />
      <StyledSignOutContainer onClick={handleLogout}>
        <StyledSignOutText>Sign Out</StyledSignOutText>
        <StyledSignOutIcon />
      </StyledSignOutContainer>
    </ProfilePopUpContainer>
  );
};

const PlusButtonOverlay: React.FC<PlusButtonOverlayProps> = ({
  onClose,
  userInfo,
  onTagCreated,
  isCreateRoomOverlayVisible,
  setIsCreateRoomOverlayVisible,
  isJoinRoomsOverlayVisible,
  setIsJoinRoomsOverlayVisible,
  isCreateTagOverlayVisible,
  setIsCreateTagOverlayVisible,
}) => {
  // Add useRef to reference the overlay container
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <PlusButtonOverlayContainer ref={overlayRef}>
      <ModalCloseButton onClick={onClose}>
        <StyledProfilePopUpCross />
      </ModalCloseButton>
      <PlusButtonOptionContainer
        onClick={() => {
          setIsCreateRoomOverlayVisible(true);
          onClose(); // 关闭 plus button overlay
        }}
      >
        <StyledIoMdPersonAdd />
        <StyledPlusButtonOptionText>Create New Room</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>
      <PlusButtonOptionContainer
        onClick={() => {
          setIsJoinRoomsOverlayVisible(true);
          onClose(); // 关闭 plus button overlay
        }}
      >
        <StyledMdPeopleAlt />
        <StyledPlusButtonOptionText>Join A Room</StyledPlusButtonOptionText>
      </PlusButtonOptionContainer>
      <PlusButtonOptionContainer
        onClick={() => {
          setIsCreateTagOverlayVisible(true);
          onClose(); // 关闭 plus button overlay
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

const Sidebar: React.FC = () => {
  const { userInfo, isUserInfoLoading, userInfoError } = useUser();
  const { sidebarRooms, sidebarRoomsPagination, setSidebarRoomListRequest } =
    useRoomContext();
  const [roomSearch, setRoomSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlusButtonOverlayVisible, setIsPlusButtonOverlayVisible] = useState(false);
  
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

  // 渲染加载状态
  const renderLoadingState = () => (
    <LoadingContainer>
      <LoadingSpinner />
    </LoadingContainer>
  );

  // 渲染错误状态
  const renderErrorState = () => (
    <ErrorContainer>
      <ErrorMessage>{userInfoError}</ErrorMessage>
    </ErrorContainer>
  );

  // 渲染用户信息
  const renderUserInfo = () => {
    if (!userInfo) return null;
    
    return (
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
                userInfo={userInfo}
              />
            )}
          </UserNameContainer>
          <UserEmail $textLength={userInfo.userEmail.toString().length}>
            {userInfo.userEmail}
          </UserEmail>
        </UserInfo>
      </>
    );
  };

  // 渲染空状态
  const renderEmptyState = () => (
    <EmptyStateContainer>
      <EmptyStateMessage>No user information available</EmptyStateMessage>
    </EmptyStateContainer>
  );

  // 渲染 ProfileSection 内容
  const renderProfileContent = () => {
    if (isUserInfoLoading) return renderLoadingState();
    if (userInfoError) return renderErrorState();
    if (userInfo) return renderUserInfo();
    return renderEmptyState();
  };

  return (
    <SidebarContainer>
      <ProfileSection>
        {renderProfileContent()}
      </ProfileSection>
      <LineSeparator />
      <SearchContainer>
        <SearchWrapper>
          <SearchIcon />

          <LabeledInputWithCount
            variant="withIcon"
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

        <PlusButtonWrapper>
          <PlusButton onClick={() => setIsPlusButtonOverlayVisible(true)} />
          {isPlusButtonOverlayVisible && (
            <PlusButtonOverlay
              onClose={() => setIsPlusButtonOverlayVisible(false)}
              userInfo={userInfo}
              onTagCreated={refreshTags}
              isCreateRoomOverlayVisible={isCreateRoomOverlayVisible}
              setIsCreateRoomOverlayVisible={setIsCreateRoomOverlayVisible}
              isJoinRoomsOverlayVisible={isJoinRoomsOverlayVisible}
              setIsJoinRoomsOverlayVisible={setIsJoinRoomsOverlayVisible}
              isCreateTagOverlayVisible={isCreateTagOverlayVisible}
              setIsCreateTagOverlayVisible={setIsCreateTagOverlayVisible}
            />
          )}
        </PlusButtonWrapper>
      </SearchContainer>

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
                        <RoomDescContainer>
                          <RoomTitle>{room.groupName}</RoomTitle>
                          <RoomDesc>{room.groupDescription}</RoomDesc>
                        </RoomDescContainer>
                      </RoomContainer>
                    ))
                  : !isLoading && <ErrorMessage>No rooms found.</ErrorMessage>}
              </RoomList>
              <PaginationContainer>
                <PageButton
                  onClick={() => handlePageChange(1)}
                  disabled={sidebarRoomsPagination.pageNum === 1}
                >
                  <MdKeyboardDoubleArrowLeft />
                </PageButton>
                <PageButton
                  onClick={() =>
                    handlePageChange(sidebarRoomsPagination.pageNum - 1)
                  }
                  disabled={sidebarRoomsPagination.pageNum === 1}
                >
                  <MdKeyboardArrowLeft />
                </PageButton>
                <Ellipsis>
                  Page {sidebarRoomsPagination.pageNum} of{" "}
                  {sidebarRoomsPagination.pages}
                </Ellipsis>
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
                <PageButton
                  onClick={() => handlePageChange(sidebarRoomsPagination.pages)}
                  disabled={
                    sidebarRoomsPagination.pageNum ===
                    sidebarRoomsPagination.pages
                  }
                >
                  <MdKeyboardDoubleArrowRight />
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
                        <RoomDescContainer>
                          <RoomTitle>{tag.tagName}</RoomTitle>
                        </RoomDescContainer>
                      </RoomContainer>
                    ))
                  : !isLoading && <ErrorMessage>No tags found.</ErrorMessage>}
              </RoomList>
              <PaginationContainer>
                <PageButton
                  onClick={() => handlePageChange(1)}
                  disabled={tagsPagination.pageNum === 1}
                >
                  <MdKeyboardDoubleArrowLeft />
                </PageButton>
                <PageButton
                  onClick={() => handlePageChange(tagsPagination.pageNum - 1)}
                  disabled={tagsPagination.pageNum === 1}
                >
                  <MdKeyboardArrowLeft />
                </PageButton>
                <Ellipsis>
                  Page {tagsPagination.pageNum} of {tagsPagination.pages}
                </Ellipsis>
                <PageButton
                  onClick={() => handlePageChange(tagsPagination.pageNum + 1)}
                  disabled={tagsPagination.pageNum === tagsPagination.pages}
                >
                  <MdKeyboardArrowRight />
                </PageButton>
                <PageButton
                  onClick={() => handlePageChange(tagsPagination.pages)}
                  disabled={tagsPagination.pageNum === tagsPagination.pages}
                >
                  <MdKeyboardDoubleArrowRight />
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
