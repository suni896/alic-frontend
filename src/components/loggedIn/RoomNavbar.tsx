import { useState, useEffect } from "react";
import { IoEllipsisHorizontal, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineArrowBack, MdOutlineIosShare } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import CreateRoomComponent from "./CreateRoomComponent";
import RoomMembersComponent from "./RoomMembersComponent";
import apiClient from "../loggedOut/apiClient";

interface TagData {
  tagId: number;
  tagName: string;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 72px;
  background-color: #016532;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
`;

const BackArrow = styled(MdOutlineArrowBack)`
  color: white;
  font-size: 2rem;
  margin-right: 1rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  margin: 0;
  margin-right: 1rem;

  @media (max-width: 740px) {
    font-size: 0.9rem;
  }
`;

const TagButton = styled.button`
  background-color: #bcee90;
  color: #333333;
  border: 0.5px solid black;
  border-radius: 10px;
  height: 90%;
  margin-left: 12px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  @media (max-width: 740px) {
    font-size: 0.9rem;
    margin-left: 8px;
  }

  @media (max-width: 500px) {
    padding: 0.5rem;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 2%;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 2%;
  gap: 1rem;

  @media (max-width: 500px){
  gap: 0.4rem;}
`;

const Settings = styled(IoSettingsOutline)`
  color: white;
  font-size: 1.8rem;
  cursor: pointer;

  @media (max-width: 500px) {
  font-size: 1.4rem;
  margin-left: 5px;}
`;

const Share = styled(MdOutlineIosShare)`
  color: white;
  font-size: 1.8rem;
  cursor: pointer;

  @media (max-width: 500px) {
  font-size: 1.5rem;}
`;

const Menu = styled(IoEllipsisHorizontal)`
  color: white;
  font-size: 1.8rem;
  cursor: pointer;

  @media (max-width: 500px) {
  font-size: 1.5rem;}
`;

interface RoomNavbarProps {
  groupId?: number;
}

const RoomNavbar: React.FC<RoomNavbarProps> = ({ groupId }) => {
  const [isModifyRoomInfoVisible, setIsModifyRoomInfoVisible] = useState(false);
  const [isRoomMembersVisible, setIsRoomMembersVisible] = useState(false);
  const [tagData, setTagData] = useState<TagData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTagData = async () => {
      if (groupId) {
        try {
          console.log("Fetching tags for groupId:", groupId);
          const response = await apiClient.get(
            `/v1/tag/get_tag_binded_group_list?groupId=${groupId}`
          );
          console.log("API Response:", response.data);
          if (response.data.code === 200) {
            console.log("Tags data:", response.data.data);
            setTagData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching tag data:", error);
        }
      } else {
        console.log("No groupId provided");
      }
    };

    fetchTagData();
  }, [groupId]);

  // Add this to debug render
  useEffect(() => {
    console.log("Current tagData state:", tagData);
  }, [tagData]);

  return (
    <Container>
      <TitleContainer>
        <BackArrow onClick={() => navigate("/search-rooms")} />
        <Title>Explore Generative AI</Title>
        {tagData &&
          tagData.length > 0 &&
          tagData.map((tag) => (
            <TagButton key={tag.tagId}>{tag.tagName}</TagButton>
          ))}
      </TitleContainer>
      <RightContainer>
        <Settings onClick={() => setIsModifyRoomInfoVisible(true)} />
        {isModifyRoomInfoVisible && (
          <CreateRoomComponent
            onClose={() => setIsModifyRoomInfoVisible(false)}
            isModify={true}
          />
        )}
        <Share />
        <Menu onClick={() => setIsRoomMembersVisible(true)} />
        {isRoomMembersVisible && (
          <RoomMembersComponent
            onClose={() => setIsRoomMembersVisible(false)}
          />
        )}
      </RightContainer>
    </Container>
  );
};

export default RoomNavbar;
