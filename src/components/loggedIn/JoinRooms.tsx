import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { MdLock, MdPublic, MdGroup } from "react-icons/md";
import { BiLoaderAlt } from "react-icons/bi";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import Button from "../ui/Button";
import LabeledInputWithCount from "../ui/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiX } from "react-icons/fi";
import { useGroupList } from "../../hooks/queries/useGroup";

import {
  ModalBackdrop,
  ModalContainer,
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  InputLabel,
  ButtonContainer,
  FixedButtonContainer,
  PasswordInput,
  IntegrationCard,
  CardTop,
  CardHeader,
  HeaderLeft,
  Avatar,
  AvatarImg,
  NameBlock,
  NameText,
  StatusRow,
  StatusDot,
  StatusText,
  RoomInfo,
  InfoItem,
  InfoItemText,
  CardDescription,
  ActionButton,
  ErrorText,
  EmptyState,
} from "../ui/SharedComponents";

// Animations

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;


const Container = styled.div`
  background: var(--white);
  width: 95%;
  max-width: 35rem;
  height: 90vh;
  max-height: 90vh;
  border-radius: var(--radius-12);
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px var(--shadow-25);
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  cursor: default;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 35rem;
    height: 80vh;
    max-height: 38rem;
    padding: var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 35rem;
    height: 38rem;
    padding: var(--space-7);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SearchContainer = styled.div`
  padding: var(--space-3);
  background: var(--input-bg);
  border-bottom: 1px solid var(--border-d9d9d970);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-4) var(--space-6);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-5) var(--space-7);
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--space-3);
  height: 100%;
  flex: 1;
  margin: 0;
  position: relative;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-4);
  }
`;

const SearchIcon = styled(CiSearch)`
  position: static;
  transform: none;
  font-size: var(--space-4);
  color: var(--input);
  z-index: 1;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const RoomListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-4);
  }
  
  @media (min-width: 48rem) {
    padding: var(--space-4) var(--space-7) var(--space-7);
  }
`;

const RoomList = styled.div<{ $blur: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 50rem;
  margin: 0 auto;
  width: 100%;
  
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 12.5rem;
  gap: 1rem;
`;

const LoadingSpinner = styled(BiLoaderAlt)`
  font-size: 2rem;
  color: var(--emerald-green);
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: var(--muted-6b7280);
  margin: 0;
  font-family: var(--font-sans);
`;

const ErrorContainer = styled.div`
  background: var(--error-red-light);
  color: var(--error-red-dark);
  text-align: center;
  padding: var(--space-4);
  margin: var(--space-4) 0;
  border: 1px solid var(--error-red);
  border-radius: var(--radius-5);
  font-family: var(--font-sans);
`;

// 密码弹窗样式
const PasswordModalContainer = styled(ModalContainer)`
  position: relative;
  background: var(--white);
  border: none;
  border-radius: var(--radius-12);
  padding: var(--space-7);
  width: 25rem;
  height: 18rem;
  box-shadow: 0 25px 50px -12px var(--shadow-25);
  display: flex;
  flex-direction: column;
  cursor: default;
`;

const PasswordInputWrapper = styled.div`
  margin: var(--space-6) 0;
`;

const ErrorMessage = styled.div`
  font-size: var(--space-5);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-6);
  text-align: center;
  font-family: var(--font-sans);
`;

const ErrorModalButton = styled.button<{ $success?: boolean }>`
  padding: var(--space-3) var(--space-6);
  background: ${props => props.$success ? 'var(--emerald-green)' : 'var(--error-red)'};
  color: white;
  border: none;
  border-radius: var(--radius-5);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  margin: 0 auto;
  font-family: var(--font-sans);

  &:hover {
    filter: brightness(0.95);
  }
`;



interface CreateRoomComponentProps {
  onClose: () => void;
}

interface PasswordFormValues {
  password: string;
}

const passwordValidationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be between 6 and 20 characters")
    .max(20, "Password must be between 6 and 20 characters")
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+=\[\]{}|;:'",.<>?/`~\\-]*$/,
      "Password can only include letters, numbers, and special characters"
    )
    .required("Password is required"),
});



const JoinRooms: React.FC<CreateRoomComponentProps> = ({ onClose }) => {
  const [roomSearch, setRoomSearch] = useState<string>("");
  const navigate = useNavigate();

  // Only fetch when user has entered a search keyword
  const hasSearched = roomSearch.trim() !== "";

  // Use React Query instead of manual fetching with cache
  const { data: groupListData, isLoading, error } = useGroupList({
    keyword: roomSearch || undefined,
    groupDemonTypeEnum: "ALLROOM",
    pageRequestVO: {
      pageSize: 100, // Fetch more rooms at once
      pageNum: 1,
    },
  }, hasSearched);

  // 处理 Overlay 点击关闭
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const {
    handleJoinClick,
    showPasswordModal,
    setShowPasswordModal,
    password,
    setPassword,
    redirectPath,
    setRedirectPath,
    handlePasswordSubmit,
  } = useJoinRoom();

  const passwordFormik = useFormik<PasswordFormValues>({
    initialValues: {
      password: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: (values) => {
      setPassword(values.password);
      handlePasswordSubmit();
    },
  });

  // Sync formik password with useJoinRoom password
  useEffect(() => {
    passwordFormik.setFieldValue("password", password);
  }, [password]);

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
      onClose();
    }
  }, [redirectPath, navigate, setRedirectPath, onClose]);

const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRoomSearch(e.target.value);
  };

  // Extract rooms from query data
  const rooms = groupListData?.data?.data ?? [];

  return (
    <ModalBackdrop onClick={handleOverlayClick}  className="modal-backdrop-right">
      <Container onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX size={24} />
        </ModalCloseButton>
        {/* 顶部标题 */}
        <HeaderSection>
          <HeaderTitle>Join Rooms</HeaderTitle>
          <HeaderSubTitle>Search and join rooms to start chatting.</HeaderSubTitle>
        </HeaderSection>

        <ContentArea>
        <SearchContainer>
          <SearchWrapper>
            <SearchIcon />
            <LabeledInputWithCount
              variant="unstyled"
              value={roomSearch}
              onChange={handleSearch}
              placeholder="Search rooms by name or description..."
              type="text"
              showCount={false}
            />
          </SearchWrapper>
        </SearchContainer>

          <RoomListContainer>
            {error && <ErrorContainer>{error.message || "Failed to fetch rooms"}</ErrorContainer>}

            {isLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Searching for rooms...</LoadingText>
              </LoadingContainer>
            ) : (
              <RoomList $blur={showPasswordModal}>
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <IntegrationCard key={room.groupId}>
                      <CardTop>
                        <CardHeader>
                          <HeaderLeft>
                            <Avatar>
                              <AvatarImg src="https://placehold.co/32x32" alt="" />
                            </Avatar>
                            <NameBlock>
                              <NameText>{room.groupName}</NameText>
                              <StatusRow>
                                <StatusDot $joined={room.isJoined} />
                                <StatusText>{room.isJoined ? "Joined" : "Not Joined"}</StatusText>
                              </StatusRow>
                            </NameBlock>
                          </HeaderLeft>
                          {/* Public/Private 状态展示在右上角 */}
                          <StatusRow style={{ marginLeft: 'auto' }}>
                            {room.groupType === 0 ? (
                              <><MdLock size={14} color="var(--emerald-green)" /> <StatusText style={{ color: 'var(--emerald-green)' }}>Private</StatusText></>
                            ) : (
                              <><MdPublic size={14} color="var(--slate-500)" /> <StatusText>Public</StatusText></>
                            )}
                          </StatusRow>
                        </CardHeader>

                        <RoomInfo>
                          <InfoItem>
                            <MdGroup />
                            <InfoItemText>{room.memberCount} members</InfoItemText>
                          </InfoItem>
                          <InfoItem>
                            <InfoItemText>Admin: {room.adminName}</InfoItemText>
                          </InfoItem>
                        </RoomInfo>

                        <CardDescription>
                          {room.groupDescription || "Join this room to start chatting."}
                        </CardDescription>
                      </CardTop>

                      <ActionButton
                        onClick={() =>
                          handleJoinClick(room.groupId, room.groupType, room.isJoined)
                        }
                      >
                        {room.isJoined ? "Enter" : "Join"}
                      </ActionButton>
                    </IntegrationCard>
                  ))
                ) : roomSearch.trim() !== "" ? (
                  <EmptyState
                    title="No rooms found"
                    description="Try adjusting your search terms or browse all available rooms."
                  />
                ) : (
                  <EmptyState
                    title="Start searching"
                    description="Enter a room name or description to find groups to join."
                  />
                )}
              </RoomList>
            )}
          </RoomListContainer>
        </ContentArea>

        {showPasswordModal && (
          <ModalBackdrop onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordModal(false);
            }
          }}>
            {showPasswordModal && (
              <PasswordModalContainer onClick={(e) => e.stopPropagation()}>
                {/* 右上角关闭按钮 */}
                <ModalCloseButton onClick={() => setShowPasswordModal(false)} aria-label="Close">
                  <FiX size={24} />
                </ModalCloseButton>

                {/* 顶部标题 */}
                <HeaderSection>
                  <HeaderTitle>Enter Room Password</HeaderTitle>
                  <HeaderSubTitle>This room requires a password to join.</HeaderSubTitle>
                </HeaderSection>

                <PasswordInputWrapper>
                  <InputLabel>Password</InputLabel>
                  <PasswordInput
                    placeholder="Enter password"
                    value={passwordFormik.values.password}
                    onChange={(e) => {
                      passwordFormik.handleChange(e);
                      setPassword(e.target.value);
                    }}
                    onBlur={passwordFormik.handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        passwordFormik.handleSubmit();
                      }
                    }}
                    name="password"
                    $hasError={passwordFormik.touched.password && !!passwordFormik.errors.password}
                  />
                  <ErrorText $visible={!!(passwordFormik.touched.password && passwordFormik.errors.password)}>
                    {(passwordFormik.touched.password && passwordFormik.errors.password) ? passwordFormik.errors.password :  " "}
                  </ErrorText>
                </PasswordInputWrapper>
                
                <ButtonContainer>
                  <FixedButtonContainer>
                    <Button variant="cancel" onClick={() => setShowPasswordModal(false)}>
                      Cancel
                    </Button>
                  </FixedButtonContainer>
                  <FixedButtonContainer>
                    <Button 
                      onClick={() => passwordFormik.handleSubmit()} 
                      disabled={!passwordFormik.isValid || !passwordFormik.values.password}
                    >
                      Join Room
                    </Button>
                  </FixedButtonContainer>
                </ButtonContainer>
              </PasswordModalContainer>
            )}
          </ModalBackdrop>
        )}
      </Container>
    </ModalBackdrop>
  );
};

export default JoinRooms;
