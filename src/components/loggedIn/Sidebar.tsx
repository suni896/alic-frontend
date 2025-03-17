import React, { useEffect, useState } from "react";
import styled from "styled-components";
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

const SidebarContainer = styled.div`
  width: 22%;
  height: 100vh;
  background-color: #ffffff;
  padding: 2rem 0rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #016532;
  margin-top: 72px;
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
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserNameContainer = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

const StyledArrowDown = styled(IoIosArrowDown)`
  color: black;
  margin-left: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1.5rem;
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
`;

const StyledPlusContainer = styled.div`
  background-color: #d9d9d9;
  width: 14%;
  height: 88%;
  display: flex;
  align-items: center;
  justify-content: center;
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
`;

interface ToggleButtonProps {
  isActive: boolean;
}

const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 70%;
  height: 100%;
  border: none;
  border-radius: 0;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  background-color: ${({ isActive }) => (isActive ? "white" : "transparent")};
  color: ${({ isActive }) => (isActive ? "#016532" : "black")};
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: ${({ isActive }) => (isActive ? "white" : "#e0e0e0")};
  }
`;

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
  margin: 0.2rem 1rem 0 1rem;
`;

const RoomDescContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const RoomTitle = styled.p`
  font-size: 0.9rem;
  font-family: Roboto;
  color: black;
  margin: 0;
  cursor: pointer;
`;

const RoomDesc = styled.p`
  font-family: Roboto;
  font-size: 0.8rem;
  color: #757575;
  margin: 0;
`;

const UserEmail = styled.span`
  font-size: 0.8rem;
  color: #666;
  max-width: 85%;
  display: inline-block;
  overflow-wrap: break-word; /* Allow breaking words to fit */
  white-space: pre-wrap; /* Preserve whitespace and allow wrapping */
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  font-size: 1.5rem;
  left: 0.5rem;
`;

const Star = styled(IoIosStarOutline)`
  color: black;
  font-size: 1.3rem;
  margin: 0.2rem 1rem 0 1rem;
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
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 0;
  right: -3%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

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
`;

const StyledSignOutIcon = styled(PiSignOutBold)`
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
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
`;

const StyledMdPeopleAlt = styled(MdPeopleAlt)`
  width: 20px;
  height: 20px;
  margin-left: 2px;
  color: #016532;
`;

const StyledFiTag = styled(FaTag)`
  width: 20px;
  height: 20px;
  color: #016532;
`;

const StyledPlusButtonOptionText = styled.span`
  font-family: Roboto;
  font-weight: 700;
  font-size: 0.9rem;
  color: black;
`;
interface OverlayProps {
  onClose: () => void;
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

const PlusButtonOverlay: React.FC<OverlayProps> = ({ onClose }) => {
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
        />
      )}
      {isJoinRoomsOverlayVisible && (
        <JoinRooms onClose={() => setIsJoinRoomsOverlayVisible(false)} />
      )}
      {isCreateTagOverlayVisible && (
        <CreateNewTag onClose={() => setIsCreateTagOverlayVisible(false)} />
      )}
    </PlusButtonOverlayContainer>
  );
};

interface UserInformation {
  userId: number;
  userEmail: string;
  userName: string;
  userPortrait: string;
}

const Sidebar: React.FC = () => {
  const [user, setUser] = useState<UserInformation | null>(null);
  const [roomSearch, setRoomSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [activeTab, setActiveTab] = useState<"myRooms" | "myTags">("myRooms");

  const [isPlusButtonOverlayVisible, setIsPlusButtonOverlayVisible] =
    useState(false);

  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        // Authenticated request to fetch user info
        const response = await apiClient.get("/v1/user/get_user_info");
        if (response.data.code === 200) {
          setUser(response.data.data);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
          alert(
            error.response?.data?.message ||
              "Failed to fetch user info. Please try again."
          );
        } else {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      }
    };
    fetchUserInformation();
  }, []);

  const rooms = [
    { title: "1", desc: "Description for Room 1." },
    { title: "2", desc: "Description for Room 2." },
    { title: "3", desc: "Description for Room 3." },
    { title: "4", desc: "Description for Room 4." },
    { title: "5", desc: "Description for Room 5." },
    { title: "6", desc: "Description for Room 6." },
    { title: "7", desc: "Description for Room 7." },
    { title: "8", desc: "Description for Room 8." },
    { title: "9", desc: "Description for Room 9." },
    { title: "10", desc: "Description for Room 10." },
  ];

  const classes = [
    { title: "1", desc: "Description for Class 1." },
    { title: "2", desc: "Description for Class 2." },
    { title: "3", desc: "Description for Class 3." },
    { title: "4", desc: "Description for Class 4." },
    { title: "5", desc: "Description for Class 5." },
    { title: "6", desc: "Description for Class 6." },
    { title: "7", desc: "Description for Class 7." },
    { title: "8", desc: "Description for Class 8." },
    { title: "9", desc: "Description for Class 9." },
    { title: "10", desc: "Description for Class 10." },
  ];

  const filteredRooms = rooms.filter((room) =>
    room.title.toLowerCase().includes(roomSearch.toLowerCase())
  );

  const filteredTags = classes.filter((tag) =>
    tag.title.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const navigate = useNavigate();

  return (
    <SidebarContainer>
      <ProfileSection>
        {user && (
          <>
            <Avatar
              src={`data:image/png;base64,${user.userPortrait}`}
              alt="User Avatar"
            />
            <UserInfo>
              <UserNameContainer>
                <UserName>{user.userName}</UserName>
                <StyledArrowDown
                  onClick={() => setIsProfileClicked(!isProfileClicked)}
                />
                {isProfileClicked && (
                  <ProfilePopUp onClose={() => setIsProfileClicked(false)} />
                )}
              </UserNameContainer>
              <UserEmail>{user.userEmail}</UserEmail>
            </UserInfo>
          </>
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

      {activeTab === "myRooms" && (
        <RoomList>
          {filteredRooms.map((room, index) => (
            <RoomContainer key={index}>
              <Star />
              <RoomDescContainer>
                <RoomTitle>ROOM {room.title}</RoomTitle>
                <RoomDesc>{room.desc}</RoomDesc>
              </RoomDescContainer>
            </RoomContainer>
          ))}
        </RoomList>
      )}

      {activeTab === "myTags" && (
        <RoomList>
          {filteredTags.map((tag, index) => (
            <RoomContainer key={index}>
              <Tag />
              <RoomDescContainer>
                <RoomTitle
                  onClick={() =>
                    navigate(`/my-class-${tag.title}`, {
                      state: { title: tag.title, desc: tag.desc },
                    })
                  }
                >
                  CLASS {tag.title}
                </RoomTitle>
                <RoomDesc>{tag.desc}</RoomDesc>
              </RoomDescContainer>
            </RoomContainer>
          ))}
        </RoomList>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
