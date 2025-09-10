import React, { useState, useEffect, useRef, useMemo } from "react";
import { CiSearch } from "react-icons/ci";
import { MdLock, MdPublic, MdGroup, MdDescription } from "react-icons/md";
import { BiLoaderAlt } from "react-icons/bi";
import styled, { css, keyframes } from "styled-components";
import axios from "axios";
import apiClient from "../loggedOut/apiClient";
import { useNavigate } from "react-router-dom";
import { useJoinRoom, RoomGroup } from "./useJoinRoom";
import Button from "../button";
import LabeledInputWithCount from "../Input";
import ModalHeader from "../Header";
import { useFormik } from "formik";
import * as Yup from "yup";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const OverlayContainer = styled.div`
  position: fixed;
  top: 7vh;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Container = styled.div`
  background: white;
  width: 90%;
  max-width: 900px;
  height: 80vh;
  border-radius: 16px;
  position: absolute;
  top:5px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  padding: 2.5rem;

  @media (max-width: 700px) {
    width: 95%;
    height: 90vh;
    border-radius: 12px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SearchContainer = styled.div`
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const SearchWrapper = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #6c757d;
  z-index: 1;
`;

const RoomListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 2rem 2rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f3f4;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c8cd;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8b2ba;
  }
`;

const RoomList = styled.div<{ $blur: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;

  ${({ $blur }) =>
    $blur &&
    css`
      filter: blur(5px);
      pointer-events: none;
    `}
`;

const RoomCard = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #016532;
  }
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const RoomTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoomType = styled.div<{ $isPrivate: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$isPrivate ? '#fff3cd' : '#d1edff'};
  color: ${props => props.$isPrivate ? '#856404' : '#0c5460'};
`;

const RoomInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RoomDescription = styled.p`
  margin: 0 0 1rem 0;
  color: #495057;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const JoinButton = styled.button<{ $isJoined?: boolean }>`
  padding: 0.75rem 2rem;
  background: ${props => props.$isJoined ? '#28a745' : '#016532'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 100px;

  &:hover {
    background: ${props => props.$isJoined ? '#218838' : '#014d26'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 500px) {
    padding: 0.6rem 1.5rem;
    font-size: 0.85rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  gap: 1rem;
`;

const LoadingSpinner = styled(BiLoaderAlt)`
  font-size: 2rem;
  color: #016532;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #6c757d;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
`;

const EmptyStateIcon = styled(CiSearch)`
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
`;

const ErrorContainer = styled.div`
  background: #f8d7da;
  color: #721c24;
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
`;

// Modal styles remain similar but with improved design
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 4000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  position: absolute;
  top: 70px;
  background: white;
  border: none;
  border-radius: 16px;
  padding: 2.5rem;
  width: 28%;
  max-width: 480px;
  min-width: 320px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 1200px) {
    width: 35%;
  }
  @media (max-width: 1000px) {
    width: 45%;
  }
  @media (max-width: 700px) {
    width: 55%;
    padding: 2rem;
  }
  @media (max-width: 500px) {
    width: 70%;
    padding: 1.5rem;
  }
  @media (max-width: 400px) {
    width: 85%;
    padding: 1.25rem;
  }
`;

const PasswordInput = styled.input`
  width: 90%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  margin: 0 auto 1.5rem auto; /* 添加水平居中的 margin */
  display: block; /* 确保作为块级元素显示 */
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #016532;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  justify-content: center;
  height: 40px;
  
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ErrorMessage = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ErrorModalButton = styled.button<{ $success?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$success ? '#28a745' : '#dc3545'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  margin: 0 auto;

  &:hover {
    background: ${props => props.$success ? '#218838' : '#c82333'};
  }
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #fc5600;
  margin-top: 0;
  margin-bottom: 3px;
  min-height: 1.5em; /* 预留固定高度 */
  // line-height: 1.2;

  @media (max-width: 740px) {
    font-size: 0.7rem;
    min-height: 1.1em;
  }

  @media (max-height: 720px) {
    margin: 0;
    min-height: 1em;
  }
`;

interface GroupListResponse {
  code: number;
  message: string;
  data: {
    pageNum: number;
    pageSize: number;
    total: number;
    pages: number;
    data: RoomGroup[];
  };
}

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

const roomsCache = new Map<string, RoomGroup[]>();

const JoinRooms: React.FC<CreateRoomComponentProps> = ({ onClose }) => {
  const [rooms, setRooms] = useState<RoomGroup[]>([]);
  const [roomSearch, setRoomSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Add useRef to reference the container
  const containerRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const {
    handleJoinClick,
    showPasswordModal,
    setShowPasswordModal,
    showErrorModal,
    setShowErrorModal,
    password,
    setPassword,
    errorMessage,
    joinSuccess,
    redirectPath,
    setRedirectPath,
    handlePasswordSubmit,
    isPasswordEmpty,
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

  const fetchAllRooms = async () => {
    setIsLoading(true);
    setError(null);

    if (roomsCache.has(roomSearch)) {
      setRooms(roomsCache.get(roomSearch)!);
      setIsLoading(false);
      return;
    }

    try {
      const allRooms: RoomGroup[] = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const requestData = {
          keyword: roomSearch || undefined,
          groupDemonTypeEnum: "ALLROOM",
          pageRequestVO: {
            pageSize: 10,
            pageNum: currentPage,
          },
        };

        const response = await apiClient.post<GroupListResponse>(
          "/v1/group/get_group_list",
          requestData
        );

        if (response.data.code === 200) {
          const { data } = response.data.data;

          if (data && data.length > 0) {
            allRooms.push(...data);
          }

          totalPages = response.data.data.pages;
          currentPage++;
        } else {
          throw new Error(
            `API error: ${response.data.message || "Unknown error"}`
          );
        }
      }

      setRooms(allRooms);
      roomsCache.set(roomSearch, allRooms);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Failed to fetch rooms. Please try again."
        );
      } else {
        setError(
          "An unexpected error occurred while fetching rooms. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRoomSearch(e.target.value);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (roomSearch.trim() !== "") {
        fetchAllRooms();
      } else {
        setRooms([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [roomSearch]);

  // Memoized filtered rooms for better performance
  const displayRooms = useMemo(() => {
    return rooms.filter(room => 
      room.groupName.toLowerCase().includes(roomSearch.toLowerCase()) ||
      room.groupDescription.toLowerCase().includes(roomSearch.toLowerCase())
    );
  }, [rooms, roomSearch]);

  return (
    <OverlayContainer>
      <Container ref={containerRef}>
        <ModalHeader icon={MdGroup} title="Join Rooms" onClose={onClose} />

        <ContentArea>
        <SearchContainer>
          <SearchWrapper>
            <SearchIcon />
            <LabeledInputWithCount
              variant="withIcon"
              value={roomSearch}
              onChange={handleSearch}
              placeholder="Search rooms by name or description..."
              type="text"
              showCount={false} // 搜索框通常不需要字数统计
            />
          </SearchWrapper>
        </SearchContainer>

          <RoomListContainer>
            {error && <ErrorContainer>{error}</ErrorContainer>}

            {isLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Searching for rooms...</LoadingText>
              </LoadingContainer>
            ) : (
              <RoomList $blur={showPasswordModal || showErrorModal}>
                {displayRooms.length > 0 ? (
                  displayRooms.map((room) => (
                    <RoomCard key={room.groupId}>
                      <RoomHeader>
                        <RoomTitle>
                          {room.groupName}
                        </RoomTitle>
                        <RoomType $isPrivate={room.groupType === 0}>
                          {room.groupType === 0 ? <MdLock /> : <MdPublic />}
                          {room.groupType === 0 ? 'Private' : 'Public'}
                        </RoomType>
                      </RoomHeader>
                      
                      <RoomInfo>
                        <InfoItem>
                          <MdGroup />
                          {room.memberCount} members
                        </InfoItem>
                        <InfoItem>
                          Admin: {room.adminName}
                        </InfoItem>
                      </RoomInfo>

                      {room.groupDescription && (
                        <RoomDescription>
                          <MdDescription style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          {room.groupDescription}
                        </RoomDescription>
                      )}

                      <JoinButton
                        $isJoined={room.isJoined}
                        onClick={() =>
                          handleJoinClick(room.groupId, room.groupType, room.isJoined)
                        }
                      >
                        {room.isJoined ? 'JOINED' : 'JOIN'}
                      </JoinButton>
                    </RoomCard>
                  ))
                ) : roomSearch.trim() !== "" ? (
                  <EmptyState>
                    <EmptyStateIcon />
                    <h3>No rooms found</h3>
                    <p>Try adjusting your search terms or browse all available rooms.</p>
                  </EmptyState>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon />
                    <h3>Start searching</h3>
                    <p>Enter a room name or description to find groups to join.</p>
                  </EmptyState>
                )}
              </RoomList>
            )}
          </RoomListContainer>
        </ContentArea>

        {(showPasswordModal || showErrorModal) && (
          <Overlay>
            {showPasswordModal && (
              <Modal>
                <ModalHeader icon={MdLock} title="Enter Room Password" onClose={() => setShowPasswordModal(false)} />
                {/* <CloseButton onClick={() => setShowPasswordModal(false)}>
                </CloseButton> */}
                {/* <PasswordTitle>Enter Room Password</PasswordTitle> */}
                <PasswordInput
                  type="password"
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
                />
                <ErrorText>{passwordFormik.touched.password && passwordFormik.errors.password }</ErrorText>
                
                <ButtonContainer>
                  <Button variant="cancel" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </Button>

                  <Button 
                    variant="primary" 
                    onClick={() => passwordFormik.handleSubmit()} 
                    disabled={!passwordFormik.isValid || !passwordFormik.values.password}
                  >
                    Join Room
                  </Button>
                </ButtonContainer>
              </Modal>
            )}
            {showErrorModal && (
              <Modal>
                <ErrorMessage style={{ color: joinSuccess ? "#28a745" : "#dc3545" }}>
                  {errorMessage}
                </ErrorMessage>
                <ErrorModalButton
                  $success={joinSuccess}
                  onClick={() => {
                    setShowErrorModal(false);
                    if (joinSuccess) {
                      onClose();
                    }
                  }}
                >
                  OK
                </ErrorModalButton>
              </Modal>
            )}
          </Overlay>
        )}
      </Container>
    </OverlayContainer>
  );
};

export default JoinRooms;
