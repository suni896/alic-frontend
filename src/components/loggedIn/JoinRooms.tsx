import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import styled, { css } from "styled-components";
import axios, { AxiosResponse } from "axios";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
`;

const Container = styled.div`
  background: white;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  border-radius: 8px;
  position: relative;
  padding: 1rem;
  overflow-y: auto;
  border: 1px solid #016532;

  @media (max-width: 700px) {
    width: 85%;
  }
  @media (max-width: 500px) {
    width: 75%;
  }
`;

const StyledCross = styled(RxCross2)`
  color: #016532;
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  gap: 2rem;
  align-items: center;
  margin: 3% 4%;
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  font-size: 2.2rem;
  color: #b3b3b3;
  left: 0.5rem;

  @media (max-width: 500px) {
    font-size: 1.6rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 4vh;
  padding: 0.65rem 3.5rem;
  font-size: 1.2rem;
  font-family: Roboto;
  font-weight: 400;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  color: #b3b3b3;
  background: white;
  cursor: pointer;

  @media (max-width: 400px) {
    font-size: 0.9rem;
    padding-left: 2.5rem;
  }
`;

const RoomList = styled.div<{ blur: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 0 4%;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(5px);
      pointer-events: none;
    `}
`;

const RoomCard = styled.div`
  border: 1px solid #016532;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
`;

const RoomHeader = styled.span`
  font-family: Roboto;
  font-weight: 600;
`;

const JoinButton = styled.button`
  padding: 0.5rem 1.5rem;
  background-color: #eaeaea;
  color: #016532;
  border: 1px solid #016532;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #43a047;
  }

  @media (max-width: 500px) {
    padding: 0.5rem 1rem;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: Roboto;

  @media (max-width: 500px) {
    font-size: 0.8rem;
    gap: 0.5rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border: 1px solid #016532;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  width: 20%;
  position: relative;

  @media (max-width: 1000px) {
    width: 30%;
  }
  @media (max-width: 700px) {
    width: 40%;
  }
  @media (max-width: 600px) {
    width: 50%;
  }
  @media (max-width: 400px) {
    width: 60%;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 0.5vh;
  right: 1%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 500px) {
    right: -1%;
    font-size: 0.6rem;
  }
`;

const PasswordTitle = styled.label`
  font-family: Roboto;
  font-weight: 400;
`;

const PasswordInput = styled.input`
  margin-top: 1vh;
  margin-bottom: 3vh;
  width: 85%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #016532;
  border-radius: 8px;
  color: #b3b3b3;
  background-color: white;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SubmitButton = styled.button`
  padding: 0.5rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #016532;
  }
`;

const ErrorMessage = styled.div`
  font-size: 1rem;
  color: black;
  font-weight: 600;
  margin-bottom: 2.5vh;

  @media (max-width: 700px) {
    font-size: 0.9rem;
  }

  @media (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const ErrorModalButton = styled.button`
  padding: 5px 10px;
  background-color: black;
  margin-left: 44%;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;

  &:after {
    content: " ";
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 6px solid #016532;
    border-color: #016532 transparent #016532 transparent;
    animation: spin 1.2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  color: red;
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid red;
  border-radius: 8px;
`;

interface JoinGroupResponse {
  code: number;
  message: string;
}

// Define interface for API response
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

interface RoomGroup {
  groupId: number;
  groupName: string;
  groupDescription: string;
  groupType: number;
  adminId: number;
  adminName: string;
  memberCount: number;
}

interface CreateRoomComponentProps {
  onClose: () => void;
}

const roomsCache = new Map<string, RoomGroup[]>();

const JoinRooms: React.FC<CreateRoomComponentProps> = ({ onClose }) => {
  const { userInfo } = useUser();
  const [rooms, setRooms] = useState<RoomGroup[]>([]);
  const [roomSearch, setRoomSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [password, setPassword] = useState<string>("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Chat Room Password Error");
  const navigate = useNavigate();

  const handleJoinClick = async (roomId: number, groupType: number) => {
    setSelectedRoomId(roomId);

    if (groupType === 1) {
      try {
        await joinGroup(roomId);
      } catch (error) {
        setErrorMessage("Failed to join group");
        setShowErrorModal(true);
      }
    } else {
      setShowPasswordModal(true);
    }
  };

  const joinGroup = async (
    groupId: number,
    password?: string
  ): Promise<void> => {
    try {
      const requestData = {
        groupId: groupId,
        joinMemberID: userInfo?.userId,
        password: password || undefined,
      };

      const response: AxiosResponse<JoinGroupResponse> = await apiClient.post(
        "/v1/group/add_group_member",
        requestData
      );

      if (response.data.code === 200 || response.data.code === 1009) {
        setJoinSuccess(true);
        setErrorMessage("Successfully joined group");
        setShowErrorModal(true);
        fetchAllRooms(); // Refetch all rooms after successful join
        navigate(`/my-room/${groupId.toString()}`, {
          // state: {
          //   title: room.groupName,
          //   desc: room.groupDescription,
          //   groupId: room.groupId,
          //   adminId: room.adminId,
          //   adminName: room.adminName,
          //   memberCount: room.memberCount,
          //   groupType: room.groupType,
          // },
        });
      } else {
        setJoinSuccess(false);
        setErrorMessage(response.data.message || "Failed to join group");
        setShowErrorModal(true);
      }
    } catch (error) {
      setJoinSuccess(false);
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to join group"
        );
      } else {
        setErrorMessage("An unexpected error occurred");
      }
      setShowErrorModal(true);
    }
  };

  const handlePasswordSubmit = async (): Promise<void> => {
    if (!selectedRoomId) return;
    setShowPasswordModal(false);

    try {
      await joinGroup(selectedRoomId, password);
    } catch (error) {
      setErrorMessage("Failed to join group");
      setShowErrorModal(true);
    }

    setPassword("");
  };

  const fetchAllRooms = async () => {
    setIsLoading(true);
    setError(null);

    if (roomsCache.has(roomSearch)) {
      setRooms(roomsCache.get(roomSearch)!); // Use cached data
      setIsLoading(false);
      return;
    }

    try {
      const allRooms: RoomGroup[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // Fetch all pages of rooms
      while (currentPage <= totalPages) {
        const requestData = {
          keyword: roomSearch || undefined,
          groupDemonTypeEnum: "ALLROOM",
          pageRequestVO: {
            pageSize: 10, // Keep the page size fixed
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

          totalPages = response.data.data.pages; // Update total pages
          currentPage++; // Move to the next page
        } else {
          throw new Error(
            `API error: ${response.data.message || "Unknown error"}`
          );
        }
      }

      setRooms(allRooms); // Set all fetched rooms to state
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setRoomSearch(query);
  };

  useEffect(() => {
    fetchAllRooms();
  }, [roomSearch]);

  return (
    <OverlayContainer>
      <Container>
        <ModalCloseButton onClick={onClose}>
          <StyledCross size={24} />
        </ModalCloseButton>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            placeholder="Search in Platform"
            value={roomSearch}
            onChange={handleSearch}
          />
        </SearchContainer>

        {error && <ErrorContainer>{error}</ErrorContainer>}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <RoomList blur={showPasswordModal || showErrorModal}>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard key={room.groupId}>
                  <RoomHeader>{room.groupName}</RoomHeader>
                  <RoomInfo>
                    <JoinButton
                      onClick={() =>
                        handleJoinClick(room.groupId, room.groupType)
                      }
                    >
                      JOIN
                    </JoinButton>
                    • {room.memberCount} members • {room.groupDescription}
                    {room.groupType == 0 && " • Requires Password"}
                  </RoomInfo>
                </RoomCard>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                No rooms found.
              </div>
            )}
          </RoomList>
        )}

        {(showPasswordModal || showErrorModal) && (
          <Overlay>
            {showPasswordModal && (
              <Modal>
                <ModalCloseButton onClick={() => setShowPasswordModal(false)}>
                  <StyledCross size={24} />
                </ModalCloseButton>
                <PasswordTitle>PASSWORD</PasswordTitle>
                <PasswordInput
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit();
                    }
                  }}
                />
                <ButtonContainer>
                  <SubmitButton onClick={handlePasswordSubmit}>
                    Submit
                  </SubmitButton>
                </ButtonContainer>
              </Modal>
            )}
            {showErrorModal && (
              <Modal>
                <ErrorMessage style={{ color: joinSuccess ? "green" : "red" }}>
                  {errorMessage}
                </ErrorMessage>
                <ErrorModalButton
                  onClick={() => {
                    setShowErrorModal(false);
                    if (joinSuccess) {
                      onClose();
                    }
                  }}
                  style={{
                    backgroundColor: joinSuccess ? "#4CAF50" : "#ff4444",
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
