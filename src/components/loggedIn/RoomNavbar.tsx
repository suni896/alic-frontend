import { useState, useEffect } from "react";
import { IoEllipsisHorizontal, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineIosShare, MdKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import CreateRoomComponent, { RoomInfoResponse } from "./CreateRoomComponent";
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
  height: 7vh;
  background-color: #016532;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  
`;

const BackArrow = styled(MdKeyboardArrowLeft)`
  color: white;
  font-size: 2rem;
  margin-right: 1rem;
  cursor: pointer;
`;

const Title = styled.h1`
  color: white;
  font-size: 1.3rem;
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

  @media (max-width: 500px) {
    gap: 0.4rem;
  }
`;

const Settings = styled(IoSettingsOutline)`
  color: white;
  font-size: 1.6rem;
  cursor: pointer;

  @media (max-width: 500px) {
    font-size: 1.4rem;
    margin-left: 5px;
  }
`;

const Share = styled(MdOutlineIosShare)`
  color: white;
  font-size: 1.6rem;
  cursor: pointer;

  @media (max-width: 500px) {
    font-size: 1.5rem;
  }
`;

const Menu = styled(IoEllipsisHorizontal)`
  color: white;
  font-size: 1.6rem;
  cursor: pointer;

  @media (max-width: 500px) {
    font-size: 1.5rem;
  }
`;

interface RoomNavbarProps {
  groupId?: number;
}

const RoomNavbar: React.FC<RoomNavbarProps> = ({ groupId }) => {
  const [isModifyRoomInfoVisible, setIsModifyRoomInfoVisible] = useState(false);
  const [isRoomMembersVisible, setIsRoomMembersVisible] = useState(false);
  const [tagData, setTagData] = useState<TagData[]>([]);
  const [roomData, setRoomData] = useState<RoomInfoResponse | null>(null);
  const [, setUserRole] = useState<string>("MEMBER");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTagData = async () => {
      if (groupId) {
        try {
          const response = await apiClient.get(
            `/v1/tag/get_tag_binded_group_list?groupId=${groupId}`
          );
          if (response.data.code === 200) {
            setTagData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching tag data:", error);
        }
      } else {
        console.log("No groupId provided");
      }
    };

    const fetchUserRole = async (groupId: number) => {
      try {
        const response = await apiClient.get(
          `/v1/group/get_role_in_group?groupId=${groupId}`
        );
        if (response.data.code === 200) {
          return response.data.data; // "ADMIN" or "MEMBER"
        }
        return null;
      } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
    };

    const fetchRoomInfo = async (groupId: number) => {
      try {
        const roleResponse = await fetchUserRole(groupId);
        setUserRole(roleResponse); // Store the role
        const url = `/v1/group/get_group_info?groupId=${groupId}`;

        try {
          const response = await apiClient.get<RoomInfoResponse>(url);

          if (
            response.status === 200 &&
            response.data.code === 200 &&
            response.data.data
          ) {
            setRoomData(response.data);
          } else {
            console.error(
              "API returned successfully but with unexpected format or error code"
            );
          }
        } catch (apiError) {
          console.error("API request failed:", apiError);
        }
      } catch (error: any) {
        console.error("Error message:", error.message);
      }
    };

    fetchTagData();
    if (groupId) {
      fetchRoomInfo(groupId);
    }
  }, [groupId]);

  return (
    <Container>
      <TitleContainer>
        <BackArrow onClick={() => navigate("/search-rooms")} />
        <Title>{roomData?.data?.groupName}</Title>
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
