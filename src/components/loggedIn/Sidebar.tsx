import React from "react";
import styled from "styled-components";
import { AiOutlinePlus, AiOutlineCaretDown } from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowUp, IoIosStarOutline } from "react-icons/io";
import { FiTag } from "react-icons/fi";
import { BsChevronDoubleLeft } from "react-icons/bs";

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #ffffff; /* White background for the sidebar */
  padding: 2rem 0.1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const LineSeparator = styled.hr`
  width: 80%;
  margin-left: 0;
  margin-bottom: 35px;
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
`;

const UserEmail = styled.span`
  font-size: 1rem;
  color: #666;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 70%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #b7b7b7;
  color: #757575;
  background: white;
  border-radius: 6px;
  cursor: pointer;
`;

const SearchSquare = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.7rem;
  width: 2rem;
  height: 2rem;
  background: #d9d9d9;
  border-radius: 0;
  cursor: pointer;
  padding: 0;
`;

const StyledPlus = styled(AiOutlinePlus)`
  color: #016532;
  font-size: 20px;
  cursor: pointer;
`;

const SectionTitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 45px;
`;

const SectionLineSeparator = styled.hr`
  width: 70%;
  margin-left: 0;
  border: none;
  border-top: 2px solid #d9d9d9;
  margin-bottom: 1rem;
`;

const StyledArrowUp = styled(IoIosArrowUp)`
  color: black;
  font-size: 1.1rem;
  cursor: pointer;
  margin-right: 1rem;
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
  margin: 0;
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
  margin-top: 0.2rem;
  margin-left: 1rem;
  margin-right: 1rem;
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

const StyledArrowLeft = styled(BsChevronDoubleLeft)`
  color: #016532;
  margin: 6vh auto 0 auto;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Sidebar: React.FC = () => {
  const handleClick = () => {
    alert("Plus icon clicked!");
  };

  const rooms = [
    { title: "1", desc: "Description for Room 1." },
    { title: "2", desc: "Description for Room 2." },
    { title: "3", desc: "Description for Room 3." },
    { title: "4", desc: "Description for Room 4." },
    { title: "5", desc: "Description for Room 5." },
  ];

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
        <SearchInput placeholder="Search in MY ROOMS" />
        <SearchSquare onClick={handleClick}>
          <StyledPlus />
        </SearchSquare>
      </SearchContainer>

      <SectionTitleContainer>
        <StyledArrowUp />
        <SectionTitle>MY ROOMS</SectionTitle>
      </SectionTitleContainer>
      <SectionLineSeparator />

      <RoomList>
        {rooms.map((room, index) => (
          <RoomContainer key={index}>
            <Star />
            <RoomDescContainer>
              <RoomTitle>ROOM {room.title}</RoomTitle>
              <RoomDesc>{room.desc}</RoomDesc>
            </RoomDescContainer>
          </RoomContainer>
        ))}
      </RoomList>

      <SectionTitleContainer>
        <StyledArrowUp />
        <SectionTitle>MY TAGS</SectionTitle>
      </SectionTitleContainer>
      <SectionLineSeparator />
      <RoomList>
        {rooms.map((room, index) => (
          <RoomContainer key={index}>
            <Star />
            <RoomDescContainer>
              <RoomTitle>ROOM {room.title}</RoomTitle>
              <RoomDesc>{room.desc}</RoomDesc>
            </RoomDescContainer>
          </RoomContainer>
        ))}
      </RoomList>
      <StyledArrowLeft />
    </SidebarContainer>
  );
};

export default Sidebar;
