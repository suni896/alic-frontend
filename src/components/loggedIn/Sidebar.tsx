import React, { useState } from "react";
import styled from "styled-components";
import { AiOutlinePlus } from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowUp, IoIosStarOutline } from "react-icons/io";
import { FiTag } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import CreateClassJoinButton from "./CreateClassJoinButton";
import CreateRoomJoinButton from "./CreateRoomJoinButton";

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
  width: 80%;
  margin-left: 0;
`;

const Avatar = styled.div`
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

const StyledArrowUp = styled(IoIosArrowUp)`
  color: black;
  margin-left: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
`;

const UserEmail = styled.span`
  font-size: 1rem;
  color: #666;
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  gap: 10px;
  align-items: center;
  margin-top: 1.5rem;
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  font-size: 1.5rem;
  left: 0.5rem;
`;

const SearchInput = styled.input`
  width: 60%;
  padding: 8px 33px;
  font-size: 0.8rem;
  border: 1px solid #b7b7b7;
  color: #757575;
  background: white;
  border-radius: 6px;
  cursor: pointer;
`;

const StyledPlus = styled(AiOutlinePlus)`
  color: #016532;
  font-size: 20px;
  cursor: pointer;
`;

const SectionTitleContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;
`;

const SectionLineSeparator = styled.hr`
  width: 70%;
  margin-left: 0;
  border: none;
  border-top: 2px solid #d9d9d9;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.div`
  font-size: 0.9rem;
  font-family: Roboto;
  font-weight: 700;
  color: #016532;
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 0;
  max-height: 18vh;
  overflow-y: auto;
`;

const RoomContainer = styled.div`
  display: flex;
  margin: 0;
  margin-bottom: 12px;
`;

const Star = styled(IoIosStarOutline)`
  color: black;
  font-size: 1.3rem;
  margin: 0.2rem 1rem 0 1rem;
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
`;

const RoomDesc = styled.p`
  font-family: Roboto;
  font-size: 0.8rem;
  color: #757575;
  margin: 0;
`;

const Sidebar: React.FC = () => {
  const [roomSearch, setRoomSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const [isRoomOverlayVisible, setIsRoomOverlayVisible] = useState(false);
  const [isTagOverlayVisible, setIsTagOverlayVisible] = useState(false);
  const [isRoomListVisible, setIsRoomListVisible] = useState(true); // Default to true to show rooms initially

  const rooms = [
    { title: "1", desc: "Description for Room 1." },
    { title: "2", desc: "Description for Room 2." },
    { title: "3", desc: "Description for Room 3." },
    { title: "4", desc: "Description for Room 4." },
    { title: "5", desc: "Description for Room 5." },
  ];

  const classes = [
    { title: "1", desc: "Description for Class 1." },
    { title: "2", desc: "Description for Class 2." },
    { title: "3", desc: "Description for Class 3." },
    { title: "4", desc: "Description for Class 4." },
    { title: "5", desc: "Description for Class 5." },
  ];

  const filteredRooms = rooms.filter((room) =>
    room.title.toLowerCase().includes(roomSearch.toLowerCase())
  );

  const filteredTags = classes.filter((tag) =>
    tag.title.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <SidebarContainer>
      <ProfileSection>
        <Avatar />
        <UserInfo>
          <UserNameContainer>
            <UserName>ME</UserName>
            <StyledArrowDown />
          </UserNameContainer>
          <UserEmail>xxx@xxx.com</UserEmail>
        </UserInfo>
      </ProfileSection>
      <LineSeparator />

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          placeholder="Search in MY ROOMS"
          value={roomSearch}
          onChange={(e) => setRoomSearch(e.target.value)}
        />
      </SearchContainer>

      <SectionTitleContainer>
        {/* Toggle Arrow Icons */}
        {isRoomListVisible ? (
          <StyledArrowUp onClick={() => setIsRoomListVisible(false)} />
        ) : (
          <StyledArrowDown onClick={() => setIsRoomListVisible(true)} />
        )}
        <SectionTitle>MY ROOMS</SectionTitle>
        {isRoomOverlayVisible ? (
          <StyledArrowUp onClick={() => setIsRoomOverlayVisible(false)} />
        ) : (
          <StyledPlus onClick={() => setIsRoomOverlayVisible(true)} />
        )}
      </SectionTitleContainer>
      {isRoomOverlayVisible && <CreateRoomJoinButton />}
      <SectionLineSeparator />

      {/* Conditionally Render Room List */}
      {isRoomListVisible && (
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

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          placeholder="Search in MY TAGS"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
        />
      </SearchContainer>

      <SectionTitleContainer>
        {isTagOverlayVisible ? (
          <StyledArrowUp onClick={() => setIsTagOverlayVisible(false)} />
        ) : (
          <StyledPlus onClick={() => setIsTagOverlayVisible(true)} />
        )}
        <SectionTitle>MY TAGS</SectionTitle>
      </SectionTitleContainer>
      {isTagOverlayVisible && <CreateClassJoinButton />}
      <SectionLineSeparator />

      <RoomList>
        {filteredTags.map((tag, index) => (
          <RoomContainer key={index}>
            <Tag />
            <RoomDescContainer>
              <RoomTitle>CLASS {tag.title}</RoomTitle>
              <RoomDesc>{tag.desc}</RoomDesc>
            </RoomDescContainer>
          </RoomContainer>
        ))}
      </RoomList>
    </SidebarContainer>
  );
};

export default Sidebar;
