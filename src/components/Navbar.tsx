// 文件顶部：补充必要的 import
import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { PiSignOutBold, PiPersonBold } from "react-icons/pi";
import { useUser } from "./loggedIn/UserContext";
import { useNavigate } from "react-router-dom";
import apiClient from "./loggedOut/apiClient";
import { RxCross2 } from "react-icons/rx";
import UserNameEdit from "./loggedIn/UserNameEdit";
import LabeledInputWithCount from "./Input";
import { CiSearch } from "react-icons/ci";
import { useRoomContext } from "./loggedIn/RoomContext";
import { HorizontalLine } from "./common/HorizontalLine";

const Container = styled.div`
  position: fixed;
  top: 0;
  margin-left: 16rem;
  width: calc(100vw - 16rem);
  height: 5rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-left: 1px solid var(--color-line); /* 左侧灰色边框 */
  border-bottom: 1px solid var(--color-line);
  box-sizing: border-box;
`;

// RightContainer（将其挪到右侧）
const RightContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  gap: var(--space-4);
  margin-left: auto;   /* 推到最右 */
  margin-right: var(--space-8);   
`;

// 追加用于右上角用户信息的样式
const ProfileContainer = styled.div`
  display: inline-flex;           /* inline-flex */
  justify-content: flex-start;    /* justify-start */
  align-items: center;            /* items-center */
  gap: var(--space-4);                      /* gap-3 */
  cursor: pointer;
  width: 14rem;
`;

const Avatar = styled.img`
  width: var(--space-12);                 
  height: var(--space-12);                    
  position: relative;             /* relative */
  border-radius: var(--radius-12);
  object-fit: cover;
`;

const ProfileContent = styled.div`
  display: flex;                  /* flex */
  justify-content: flex-start;    /* justify-start */
  align-items: center;            /* items-center */
  gap: var(--space-5);                      /* gap-4 */

`;

const UserTextStack = styled.div`
  display: inline-flex;           /* inline-flex */
  flex-direction: column;         /* flex-col */
  justify-content: flex-start;    /* justify-start */
  align-items: flex-start;        /* items-start */
  gap: var(--space-2);                      
`;


const UserName = styled.span`
  color: var(--text-1f2937);                 /* text-zinc-900 */
  font-size: var(--space-5);                /* text-base */
  font-weight: var(--weight-semibold);               /* font-semibold */
  font-family: var(--font-urbanist);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.span`
  color: var(--muted-6b7280);                 /* text-neutral-500 */
  font-size: var(--space-4);             /* text-xs */
  font-weight: var(--weight-medium);               /* font-medium */
  font-family: var(--font-urbanist);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfilePopUpContainer = styled.div`
  position: absolute;
  top: 4rem;
  right: 0;
  width: 10rem;
  border: 1px solid var(--white);
  border-radius: var(--radius-5);
  background-color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.75rem;
  box-shadow: 10px 15px 50px 0px rgba(113,128,150,0.08);
  z-index: 1001;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: -0.25rem;
  right: -0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
`;

const StyledProfilePopUpCross = styled(RxCross2)`
  color: var(--slate-grey);
`;
const StyledSignOutContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  border-radius: var(--radius-5);
  width: 80%;
  height: var(--space-7);
  gap: var(--space-2);
  &:hover {
    background-color: var(--color-line);
  }
 
   &:hover svg {
    color: var(--emerald-green);
  }

  &:hover span {
    color: var(--emerald-green);
  }
`;

const StyledSignOutText = styled.span`
  font-family: var(--font-urbanist);
  font-weight: var(--weight-medium);
  font-size: var(--space-10);
  color: var(--slate-grey);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0;
`;

const StyledSignOutIcon = styled(PiSignOutBold)`
  width: var(--space-5);
  height: var(--space-5);
  color: var(--slate-grey);
  flex-shrink: 0;
`;

// 新增：个人弹窗的全屏背景蒙版
const ProfileBackdrop = styled.div`
  position: fixed;
  inset: 0; /* 顶部、底部、左、右全覆盖 */
  background: rgba(17, 24, 39, 0.35); /* slate-900 35% 近似 */
  z-index: 1000; /* 低于 ProfilePopUpContainer(1001)，高于页面内容 */
`;
const StyledPersonIcon = styled(PiPersonBold)`
  width: var(--space-5);
  height: var(--space-5);
  color: var(--slate-grey);
  flex-shrink: 0;
`;


const SearchContainer = styled.div`
  width: 24rem;
  height: 3rem;
  padding: var(--space-5);
  background-color: var(--input-bg);
  border-radius: var(--radius-5);    /* rounded-xl */
  display: inline-flex;    /* inline-flex */
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
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

// 组件：Navbar（在右上角插入用户信息块）
// 在 Navbar 组件中，用 ProfilePopUp 替换原来的简化下拉（放在 UserNameContainer 内）
function Navbar() {
  const { userInfo, isUserInfoLoading, userInfoError } = useUser();
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

  // 统一渲染用户信息的四种状态
  const renderProfileContent = () => { 
    if (isUserInfoLoading) return renderLoadingState(); 
    if (userInfoError) return renderErrorState(); 
    if (userInfo) return renderUserInfo(); 
    return renderEmptyState(); 
  }; 
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
  const renderEmptyState = () => ( 
    <EmptyStateContainer> 
      <EmptyStateMessage>No user information available</EmptyStateMessage> 
    </EmptyStateContainer> 
  ); 

  const renderLoadingState = () => ( 
    <LoadingContainer> 
      <LoadingSpinner /> 
    </LoadingContainer> 
  ); 
const LoadingSpinner = () => (
  <SpinnerWrapper>
    <Spinner />
  </SpinnerWrapper>
);
  const renderErrorState = () => ( 
    <ErrorContainer> 
      <ErrorMessage>{userInfoError}</ErrorMessage> 
    </ErrorContainer> 
  ); 

  const renderUserInfo = () => { 
    if (!userInfo) return null; 
    return (
      <ProfileContainer onClick={() => setProfileOpen(!profileOpen)}> 
        <Avatar 
          src={userInfo.userPortrait ? `data:image/png;base64,${userInfo.userPortrait}` : undefined} 
          alt="User Avatar" 
        /> 
        <ProfileContent>
          <UserTextStack> 
            <UserName>{userInfo.userName}</UserName> 
            <UserEmail>{userInfo.userEmail}</UserEmail> 
          </UserTextStack> 
          {profileOpen && ( 
            <ProfilePopUp onClose={() => setProfileOpen(false)} /> 
          )} 
        </ProfileContent>
      </ProfileContainer>
    ); 
  };

  return (
    <Container>
      {profileOpen && (
        <ProfileBackdrop onClick={() => setProfileOpen(false)} />
      )}
      <RightContainer>
        {/* <LanguageDropdown $show={dropdownOpen}>
          {/* <DropdownOption onClick={closeDropdown}>简体中文</DropdownOption> */}

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
        {renderProfileContent()}
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
    <ProfilePopUpContainer
      ref={popupRef}
      onClick={(e) => e.stopPropagation()}   // 阻止冒泡到 ProfileContainer
    >
      <ModalCloseButton onClick={onClose}>
        <StyledProfilePopUpCross />
      </ModalCloseButton>
      <StyledSignOutContainer onClick={handleEditUsername}>
        <StyledPersonIcon />
        <StyledSignOutText>Me</StyledSignOutText>
      </StyledSignOutContainer>
      <HorizontalLine />
      <StyledSignOutContainer onClick={handleLogout}>
        <StyledSignOutIcon />
        <StyledSignOutText>Sign Out</StyledSignOutText>
        
      </StyledSignOutContainer>
    </ProfilePopUpContainer>
  );
};

const VerticalDivider = styled.div`
  width: var(--space-1);
  height: var(--space-6);
  border-left: 1px solid  var(--border-d9d9d970);
`;
