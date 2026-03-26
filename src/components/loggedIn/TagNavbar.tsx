
import { MdKeyboardArrowLeft } from "react-icons/md";
import { FiMenu, FiTag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { UserProfile } from "../loggedIn/UserProfile";
import { useTagGroups } from "../../hooks/queries/useTag";



const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 3.5rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-bottom: 1px solid var(--color-line);
  box-sizing: border-box;

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
  margin-right: var(--space-2);

  /* ================= Typography ================= */
  font-size: var(--space-5);

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
    font-size: var(--space-7);
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
  font-size: var(--space-3);
  font-weight: var(--weight-regular);

  /* ================= Visual ================= */
  color: var(--color-text);

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

const TagIcon = styled(FiTag)`
  /* ================= Layout ================= */
  display: block;

  /* ================= Box Model ================= */
  margin-right: var(--space-1);

  /* ================= Typography ================= */
  font-size: var(--space-3);

  /* ================= Visual ================= */
  color: var(--color-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
    margin-right: var(--space-2);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-6);
    margin-right: var(--space-3);
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
  display: flex;
  align-items: center;
  padding-left: var(--space-2);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding-left: 1.5%;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding-left: 2%;
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: var(--space-2);
  gap: var(--space-2);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-right: 1.5%;
    gap: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    margin-right: 2%;
    gap: 1rem;
  }
`;

const VerticalDivider = styled.div`
  width: var(--space-1);
  height: var(--space-5);
  border-left: 1px solid var(--border-d9d9d970);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: var(--space-6);
  }
`;

interface TagNavbarProps {
  tagId?: number;
  onMenuClick?: () => void;
}

const TagNavbar: React.FC<TagNavbarProps> = ({ tagId, onMenuClick }) => {

  const navigate = useNavigate();

  // Use React Query to fetch tag data
  const { data: tagData } = useTagGroups(
    tagId || undefined,
    { pageNum: 1, pageSize: 1 }
  );

  return (
    <Container>
      <TitleContainer>
        <MenuButton onClick={onMenuClick} aria-label="Open sidebar">
          <FiMenu size={24} />
        </MenuButton>
        <BackArrow onClick={() => navigate("/search-rooms")} />
        <TagIcon />
        <Title>{tagData?.tagName || ''}</Title>
      </TitleContainer>
      <RightContainer>
        <VerticalDivider />
        <UserProfile />
      </RightContainer>
    </Container>
  );
};

export default TagNavbar;
