import { useState } from "react";
import styled from "styled-components";
import LabeledInputWithCount from "./Input";
import { CiSearch } from "react-icons/ci";
import { FiMenu } from "react-icons/fi";
import { useRoomContext } from "./loggedIn/RoomContext";
import { UserProfile, ProfileBackdrop } from "./UserProfile";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 4rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-bottom: 1px solid var(--color-line);
  box-sizing: border-box;
  
  @media (min-width: 48rem) {
    left: 16rem;
    width: calc(100vw - 16rem);
    height: 5rem;
    border-left: 1px solid var(--color-line);
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: var(--space-3);
  margin-left: var(--space-3);
  cursor: pointer;
  color: var(--slate-grey);
  font-size: var(--space-6);
  
  @media (min-width: 48rem) {
    display: none;
  }
  
  &:hover {
    color: var(--emerald-green);
  }
`;

// RightContainer（将其挪到右侧）
const RightContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: var(--space-3);
  margin-left: auto;
  margin-right: var(--space-4);
  
  @media (min-width: 48rem) {
    gap: var(--space-4);
    margin-right: var(--space-8);
  }
`;




const SearchContainer = styled.div`
  width: 12rem;
  height: 2.5rem;
  padding: var(--space-3) var(--space-4);
  background-color: var(--input-bg);
  border-radius: var(--radius-5);
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  
  @media (min-width: 30rem) {
    width: 16rem;
  }
  
  @media (min-width: 48rem) {
    width: 20rem;
    height: 3rem;
    padding: var(--space-5);
  }
  
  @media (min-width: 64rem) {
    width: 24rem;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-4);
  height: 100%;
  flex: 1;
  margin: 0;
  position: relative;
`;

const SearchIcon = styled(CiSearch)`
  position: static;
  transform: none;
  font-size: var(--space-5);
  color: var(--input);          /* slate-400 */
  z-index: 1;
`;

interface NavbarProps {
  onMenuClick?: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { setMainAreaRoomListRequest, mainAreaRoomsPagination } = useRoomContext();

  // 新增：导航栏搜索关键字状态与事件
  const [navSearchKeyword, setNavSearchKeyword] = useState("");
  const handleNavSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setNavSearchKeyword(value);
      setMainAreaRoomListRequest({
        keyword: value,
        groupDemonTypeEnum: "PUBLICROOM",
        pageRequestVO: {
          pageSize: mainAreaRoomsPagination?.pageSize ?? 20,
          pageNum: 1,
        },
      });
    }
  };



  return (
    <Container>
      {profileOpen && (
        <ProfileBackdrop onClick={() => setProfileOpen(false)} />
      )}
      <MenuButton onClick={onMenuClick} aria-label="Open sidebar">
        <FiMenu size={24} />
      </MenuButton>
      <RightContainer>
        <SearchContainer>
          <SearchWrapper>
            <SearchIcon />
            <LabeledInputWithCount
              variant="unstyled"
              value={navSearchKeyword}
              onChange={handleNavSearchChange}
              placeholder="Search..."
              type="text"
              showCount={false}
            />
          </SearchWrapper>
        </SearchContainer>
        <VerticalDivider />
        <UserProfile />
      </RightContainer>
    </Container>
  );
}

export default Navbar;

const VerticalDivider = styled.div`
  width: var(--space-1);
  height: var(--space-6);
  border-left: 1px solid  var(--border-d9d9d970);
`;
