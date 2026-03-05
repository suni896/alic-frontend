import { useState, useEffect } from "react";
import { IoEllipsisHorizontal, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineIosShare, MdKeyboardArrowLeft, MdGroup } from "react-icons/md";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import CreateRoomComponent, { RoomInfoResponse } from "./CreateRoomComponent";
import RoomMembersComponent from "./RoomMembersComponent";
import apiClient from "../loggedOut/apiClient";
import { FiTag} from "react-icons/fi";
import { useUserRole } from "../../hooks/queries/useGroup";

interface TagData {
  tagId: number;
  tagName: string;
}

const Container = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  /* ================= Box Model ================= */
  width: 100vw;
  height: 3.5rem;

  /* ================= Visual ================= */
  background-color: var(--white);
  border-bottom: 1px solid var(--color-line);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    left: 14rem;
    width: calc(100vw - 14rem);
    height: 4.5rem;
    border-left: 1px solid var(--color-line);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    left: 16rem;
    width: calc(100vw - 16rem);
    height: 5rem;
    border-left: 1px solid var(--color-line);
  }
`;

const BackArrow = styled(MdKeyboardArrowLeft)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Box Model ================= */
  margin-right: var(--space-3);

  /* ================= Typography ================= */
  font-size: var(--space-7);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Interaction ================= */
  cursor: pointer;

  /* ================= Animation ================= */
  transition: color 0.2s ease;

  &:hover {
    color: var(--emerald-green);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-8);
    margin-right: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-8);
    margin-right: var(--space-5);
  }
`;

const Title = styled.h1`
  /* ================= Layout ================= */
  margin: 0;

  /* ================= Box Model ================= */
  margin-right: var(--space-2);

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-regular);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
    margin-right: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-6);
    margin-right: var(--space-5);
  }
`;

const GroupIcon = styled(MdGroup)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Box Model ================= */
  margin-right: var(--space-1);

  /* ================= Typography ================= */
  font-size: var(--space-5);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-6);
    margin-right: var(--space-2);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-7);
    margin-right: var(--space-3);
  }
`;

const TagButton = styled.button`
  /* ================= Layout ================= */
  display: none;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  /* ================= Box Model ================= */
  height: 80%;
  margin-left: var(--space-1);
  padding: var(--space-1) var(--space-2);
  gap: var(--space-1);

  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-family: var(--font-sans);

  /* ================= Visual ================= */
  background-color: var(--emerald-green);
  color: var(--white);
  border: none;
  outline: none;
  border-radius: var(--radius-3);

  /* ================= Animation ================= */
  transition: all 0.2s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    display: flex;
    margin-left: var(--space-3);
    padding: var(--space-2) var(--space-3);
    gap: var(--space-1);
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    display: flex;
    margin-left: var(--space-4);
    padding: var(--space-3) var(--space-4);
    gap: var(--space-2);
    font-size: var(--space-5);
  }
`;

const TagIcon = styled(FiTag)`
  /* ================= Typography ================= */
  font-size: var(--space-3);

  /* ================= Visual ================= */
  color: var(--white);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--space-1);
  margin-right: var(--space-1);
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

const TitleContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;

  /* ================= Box Model ================= */
  padding-left: var(--space-2);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding-left: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding-left: var(--space-5);
  }
`;

const RightContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;

  /* ================= Box Model ================= */
  gap: var(--space-2);
  margin-right: var(--space-2);

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
    margin-right: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
    margin-right: var(--space-5);
  }
`;

const Settings = styled(IoSettingsOutline)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Typography ================= */
  font-size: 1.2rem;

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Animation ================= */
  transition: color 0.2s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    color: var(--emerald-green);
  }

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 1.4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 1.6rem;
  }
`;

const Share = styled(MdOutlineIosShare)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Typography ================= */
  font-size: 1.2rem;

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Animation ================= */
  transition: color 0.2s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    color: var(--emerald-green);
  }

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 1.4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 1.6rem;
  }
`;

const Menu = styled(IoEllipsisHorizontal)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Typography ================= */
  font-size: 1.2rem;

  /* ================= Visual ================= */
  color: var(--color-text);

  /* ================= Animation ================= */
  transition: color 0.2s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    color: var(--emerald-green);
  }

  /* ================= Responsive ================= */
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 1.4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 1.6rem;
  }
`;

interface RoomNavbarProps {
  groupId?: number;
  onMenuClick?: () => void;
}

const RoomNavbar: React.FC<RoomNavbarProps> = ({ groupId, onMenuClick }) => {
  const [isModifyRoomInfoVisible, setIsModifyRoomInfoVisible] = useState(false);
  const [isRoomMembersVisible, setIsRoomMembersVisible] = useState(false);
  const [tagData, setTagData] = useState<TagData[]>([]);
  const [roomData, setRoomData] = useState<RoomInfoResponse | null>(null);
  const [, setUserRole] = useState<string>("MEMBER");
  const navigate = useNavigate();

  // Use React Query hook (13.6)
  const { data: roleData } = useUserRole(groupId);

  // Sync role data to state
  useEffect(() => {
    if (roleData) {
      setUserRole(roleData);
    }
  }, [roleData]);

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

    const fetchRoomInfo = async (groupId: number) => {
      try {
        const url = `/v1/group/get_group_info?groupId=${groupId}`;
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
    };

    fetchTagData();
    if (groupId) {
      fetchRoomInfo(groupId);
    }
  }, [groupId]);

  return (
    <Container>
      <TitleContainer>
        <MenuButton onClick={onMenuClick} aria-label="Open sidebar">
          <FiMenu size={24} />
        </MenuButton>
        <BackArrow onClick={() => navigate("/search-rooms")} />
        <GroupIcon />
        <Title>{roomData?.data?.groupName}</Title>
        {tagData &&
          tagData.length > 0 &&
          tagData.map((tag) => (
            <TagButton key={tag.tagId}>
              <TagIcon />
              {tag.tagName}
            </TagButton>
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
