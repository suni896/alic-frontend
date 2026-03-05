import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { PiSignOutBold, PiPersonBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useUser } from "./loggedIn/UserContext";
import apiClient from "./loggedOut/apiClient";
import UserNameEdit from "./loggedIn/UserNameEdit";
import { ModalCloseButton, HorizontalLine } from "./SharedComponents";

// ============ Styled Components ============

const ProfileContainer = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-4);
  cursor: pointer;
  width: 14rem;
`;

const Avatar = styled.img`
  width: var(--space-12);
  height: var(--space-12);
  position: relative;
  border-radius: var(--radius-12);
  object-fit: cover;
`;

const ProfileContent = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-5);
`;

const UserTextStack = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--space-2);
`;

const UserName = styled.span`
  color: var(--text-1f2937);
  font-size: var(--space-5);
  font-weight: var(--weight-semibold);
  font-family: var(--font-urbanist);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.span`
  color: var(--muted-6b7280);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
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

const StyledPersonIcon = styled(PiPersonBold)`
  width: var(--space-5);
  height: var(--space-5);
  color: var(--slate-grey);
  flex-shrink: 0;
`;

export const ProfileBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.35);
  z-index: 1000;
`;

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

  /* mobile - 基础样式 */
  font-size: 0.75rem;

  font-weight: 500;
  color: black;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 0.875rem;
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

  /* mobile - 基础样式 */
  font-size: 0.75rem;

  font-weight: 500;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 0.875rem;
  }
`;

const LoadingSpinner = () => (
  <SpinnerWrapper>
    <Spinner />
  </SpinnerWrapper>
);

// ============ ProfilePopUp Component ============

interface ProfilePopUpProps {
  onClose: () => void;
}

export const ProfilePopUp: React.FC<ProfilePopUpProps> = ({ onClose }) => {
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
      onClick={(e) => e.stopPropagation()}
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

// ============ UserInfoDisplay Component ============

interface UserInfoDisplayProps {
  onClick?: () => void;
}

export const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ onClick }) => {
  const { userInfo } = useUser();

  if (!userInfo) return null;

  return (
    <ProfileContainer onClick={onClick}>
      <Avatar
        src={userInfo.userPortrait ? `data:image/png;base64,${userInfo.userPortrait}` : undefined}
        alt="User Avatar"
      />
      <ProfileContent>
        <UserTextStack>
          <UserName>{userInfo.userName}</UserName>
          <UserEmail>{userInfo.userEmail}</UserEmail>
        </UserTextStack>
      </ProfileContent>
    </ProfileContainer>
  );
};

// ============ UserProfile Component ============

interface UserProfileProps {
  showBackdrop?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ showBackdrop = true }) => {
  const { userInfo, isUserInfoLoading, userInfoError } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);

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

  const renderProfileContent = () => {
    if (isUserInfoLoading) return renderLoadingState();
    if (userInfoError) return renderErrorState();
    if (userInfo) return renderUserInfo();
    return renderEmptyState();
  };

  return (
    <>
      {showBackdrop && profileOpen && (
        <ProfileBackdrop onClick={() => setProfileOpen(false)} />
      )}
      {renderProfileContent()}
    </>
  );
};

export default UserProfile;
