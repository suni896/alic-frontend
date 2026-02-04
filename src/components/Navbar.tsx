// 文件顶部：补充必要的 import
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { IoIosArrowDown } from "react-icons/io";
import { PiSignOutBold } from "react-icons/pi";
import { useUser } from "./loggedIn/UserContext";
import { useNavigate } from "react-router-dom";
import apiClient from "./loggedOut/apiClient";
import { RxCross2 } from "react-icons/rx";
import UserNameEdit from "./loggedIn/UserNameEdit";
import LabeledInputWithCount from "./Input";
import { CiSearch } from "react-icons/ci";
import { useRoomContext } from "./loggedIn/RoomContext";

const Container = styled.div`
  position: fixed;
  top: 0;
  margin-left: 260px;
  width: calc(100vw - 260px);
  height: 80px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-left: 1px solid #F5F5F5; /* 左侧灰色边框 */
  border-bottom: 1px solid #F5F5F5;
`;

// RightContainer（将其挪到右侧）
const RightContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: 12px;
  margin-left: auto;   /* 推到最右 */
  margin-right: 50px;   /* 更靠近右边 */
`;

// 追加用于右上角用户信息的样式
const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0;     /* 移除过大的右边距 */
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ccc;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 90px;
  max-width: 220px;
`;

const UserNameContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative; /* 作为下拉菜单定位的参考 */
`;

const UserName = styled.span<{ $textLength?: number }>`
  font-weight: bold;
  color: black;
  line-height: 1.2;
  margin-right: 6px;
  font-size: ${(props) => {
    const length = props.$textLength || 0;
    if (length <= 10) return "0.95rem";
    if (length <= 15) return "0.9rem";
    if (length <= 20) return "0.85rem";
    if (length <= 25) return "0.8rem";
    return "0.75rem";
  }};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledArrowDown = styled(IoIosArrowDown)`
  color: black;
  margin-left: 0.1rem;
  font-size: 1rem;
  cursor: pointer;
`;

const UserEmail = styled.span<{ $textLength?: number }>`
  color: #e5e7eb;
  line-height: 1.2;
  font-size: ${(props) => {
    const length = props.$textLength || 0;
    if (length <= 20) return "0.8rem";
    if (length <= 30) return "0.75rem";
    if (length <= 40) return "0.7rem";
    if (length <= 50) return "0.65rem";
    return "0.6rem";
  }};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfilePopUpContainer = styled.div`
  position: absolute;
  top: 140%;
  right: 0;
  width: 180px;
  border: 1px solid #016532;
  border-radius: 8px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.75rem;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
  z-index: 1001;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
`;

const StyledProfilePopUpCross = styled(RxCross2)`
  color: #016532;
`;

const StyledMe = styled.p`
  margin: 0;
  font-family: Roboto;
  color: #333;
`;

const StyledSignOutContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid #d9d9d9;
  width: 100%;
  margin: 8px 0;
`;

const StyledSignOutText = styled.p`
  font-family: Roboto;
  color: #333;
  margin: 0;
`;

const StyledSignOutIcon = styled(PiSignOutBold)`
  width: 18px;
  height: 18px;
  cursor: pointer;
  color: #333;
`;
const SearchContainer = styled.div`
  width: 24rem;            /* w-96 */
  height: 3rem;            /* h-12 */
  padding: 1rem;           /* p-4 */
  background-color: #f5f5f5; /* neutral-50 */
  border-radius: 12px;     /* rounded-xl */
  display: inline-flex;    /* inline-flex */
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;               /* gap-3 */
  height: 100%;
  flex: 1;
  margin: 0;
  position: relative;
`;

const SearchIcon = styled(CiSearch)`
  position: static;
  transform: none;
  font-size: 1rem;
  color: #94a3b8;          /* slate-400 */
  z-index: 1;
`;

const RightGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;                /* gap-1 */
`;

const ShortcutBox = styled.div`
  width: 16px;             /* w-4 */
  height: 16px;            /* h-4 */
  position: relative;
  overflow: hidden;
`;

const ShortcutInner = styled.div`
  position: absolute;
  left: 2px;
  top: 2px;
  width: 14px;             /* w-3.5 */
  height: 14px;            /* h-3.5 */
  border: 1.5px solid #374151; /* gray-700 */
  border-radius: 2px;
`;

const ShortcutKey = styled.div`
  color: #374151;          /* gray-700 */
  font-size: 1rem;         /* text-base */
  font-weight: 600;        /* font-semibold */
  font-family: 'Urbanist', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  line-height: 1.5rem;     /* leading-6 */
  letter-spacing: -0.01em; /* tracking-tight-ish */
`;  

// 组件：Navbar（在右上角插入用户信息块）
// 在 Navbar 组件中，用 ProfilePopUp 替换原来的简化下拉（放在 UserNameContainer 内）
function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { userInfo } = useUser();
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

      <RightContainer>
        {/* <LanguageDropdown $show={dropdownOpen}>
          {/* <DropdownOption onClick={closeDropdown}>简体中文</DropdownOption> */}

        <SearchContainer>
          <SearchWrapper>
            <SearchIcon />
            <LabeledInputWithCount
              variant="withIcon"
              value={navSearchKeyword}
              onChange={handleNavSearchChange}
              placeholder="Search..."
              type="text"
              showCount={false}
            />
          </SearchWrapper>
        </SearchContainer>


        {/* 右上角用户信息块 */}
        {userInfo && (
          <ProfileContainer>
            <Avatar
              src={userInfo.userPortrait ? `data:image/png;base64,${userInfo.userPortrait}` : undefined}
              alt="User Avatar"
            />
            <UserInfo>
              <UserNameContainer>
                <UserName $textLength={String(userInfo.userName || "").length}>
                  {userInfo.userName}
                </UserName>
                <StyledArrowDown onClick={() => setProfileOpen(!profileOpen)} />
                {profileOpen && (
                  <ProfilePopUp onClose={() => setProfileOpen(false)} />
                )}
              </UserNameContainer>
              <UserEmail $textLength={String(userInfo.userEmail || "").length}>
                {userInfo.userEmail}
              </UserEmail>
            </UserInfo>
          </ProfileContainer>
        )}

        {/* <GlobeIcon onClick={toggleDropdown} /> */}
      </RightContainer>
    </Container>
  );
}

export default Navbar;

// 新增组件：ProfilePopUp（逻辑同 Sidebar 中的实现）
interface ProfilePopUpProps {
  onClose: () => void;
}

const ProfilePopUp: React.FC<ProfilePopUpProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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
