import React, { useState, useEffect, useRef } from "react";
import { FiTag } from "react-icons/fi";
import { AiOutlineMinusCircle } from "react-icons/ai";
import styled from "styled-components";
import { CiSearch } from "react-icons/ci";
import { useLocation, useParams } from "react-router-dom";
import apiClient from "../loggedOut/apiClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import { RoomInfoResponse } from "./CreateRoomComponent";
import PlusButton from "../PlusButton";
import Button from "../button";
import LabeledInputWithCount from "../Input";
import ModalHeader from "../Header";

interface RoomContainerProps {
  $isEditMode: boolean;
}

interface PageButtonProps {
  active?: boolean;
}

interface StyledMinusProps {
  $isSelected: boolean;
}

const Container = styled.div`
  background: white;
  width: 100%;
  // margin-left: 280px; /* 为侧边栏留出空间 */
  padding-top: 0px;
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  position: relative;
  min-height: calc(100vh - 7vh);
  overflow-y: auto;

// const TopContainer = styled.div`
//   display: flex;
//   width: 100%;
//   align-items: center;
//   justify-content: ;
//   position: relative;
//   padding: 1.5rem 2rem;
//   height: 2.5rem;
  
//   @media (max-width: 800px) {
//     padding: 1rem;
//     min-height: 10vh;
//   }
  
//   @media (max-width: 600px) {
//     flex-direction: column;
//     gap: 1rem;
//     min-height: auto;
//     padding: 1rem 0.5rem;
//     justify-content: center;
//   }
// `;
const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2vh 4vw;
  width: 100%;
  height: 12vh;
  box-sizing: border-box;
  // background-color: lightblue;

  @media (max-width: 800px) {
    padding: 2vh 2vw;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    height: auto;
    gap: 1rem;
    padding: 2vh 1rem;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PlusButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  height: 2.5rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 20%;
  justify-content: space-between;
`;

const ButtonContainer = styled.div`

  display: flex;
  align-items: center;
  gap: 0.8rem;
  height: 2.5rem;
  overflow: hidden;
`;
const Title = styled.p`
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #1a202c;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.5px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 2rem;
  
  @media (max-width: 800px) {
    font-size: 2rem;
    font-weight: 600;
    margin-right: 1rem;
  }

  @media (max-width: 600px) {
    font-size: 1.7rem;
    gap: 0.75rem;
    margin-right: 0;
  }
`;

const Tag = styled(FiTag)`
  color: black;
  font-size: 2rem;

  @media (max-width: 500px) {
    font-size: 1.7rem;
  }
`;

// const SearchRoomsContainer = styled.div<RoomContainerProps>`
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   gap: 2rem;
//   padding: 0 2rem;
//   margin-top: 4vh;
//   margin-bottom: 8vh;
//   box-sizing: border-box;
//   position: relative;

//   @media (max-width: 1000px) {
//     gap: 1.5rem;
//   }
//   @media (max-width: 600px) {
//     gap: 1rem;
//     padding: 0 1rem;
//   }
// `;
const SearchRoomsContainer = styled.div<RoomContainerProps>`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 4rem;
  padding: 1rem 4rem;
  box-sizing: border-box;
  margin: 0 auto;
  justify-content: flex-start;
  min-height: 20vh;
  overflow-y: auto;
  width: 100%;
  // background-color: lightblue;

  @media (max-width: 1200px) {
    gap: 2rem 3rem;
    padding: 2rem 3rem;
  }

  @media (max-width: 1000px) {
    gap: 2rem;
  }

  @media (max-width: 800px) {
    padding: 2rem;
  }

  @media (max-width: 600px) {
    gap: 2rem 0.8rem;
    padding: 1.5rem 1rem;
  }
`;
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 5;
`;

const SearchRoomContainer = styled.div<RoomContainerProps>`
  width: 420px;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  box-sizing: border-box;
  align-items: center;
`;

const RoomContainer = styled.div<RoomContainerProps>`
  width: ${(props) => (props.$isEditMode ? "calc(420px - 5.5rem)" : "420px")};
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  height: 70px;
  background-color: white;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #016532;
  }

  @media (max-width: 600px) {
    padding: 0.6rem;
  }
`;

const StyledMinus = styled(AiOutlineMinusCircle)<StyledMinusProps>`
  color: ${(props) => (props.$isSelected ? "#fc5600" : "black")};
  font-size: 1.5rem;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 1.5rem;
`;

const RoomContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  gap: 0.25rem;
`;

const RoomTitle = styled.h2`
  color: black;
  font-size: 1rem;
  font-family: Roboto;
  font-weight: 700;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
  @media (max-width: 400px) {
    font-size: 0.75rem;
  }
`;

const RoomAdmin = styled.p`
  font-size: 0.8rem;
  font-family: Roboto;
  font-weight: 400;
  color: #757575;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 0.7rem;
  }
`;

const RoomDescription = styled.span`
  color: black;
  font-size: 0.9rem;
  font-family: Roboto;
  font-weight: 400;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 0.7rem;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  height: 4vh;
  width: 100%;
  background-color: white;
  padding: 1.5rem 0;
  margin-top: 1rem;
`;

const Ellipsis = styled.span`
  padding: 0 0.5rem;
`;

const PageButton = styled.button<PageButtonProps>`
  background: ${(props) => (props.active ? "black" : "white")};
  color: ${(props) => (props.active ? "white" : "black")};
  border: ${(props) => (props.active ? "1px solid #d9d9d9" : "none")};
  border-radius: 4px;
  padding: 0.3rem 1rem;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }

  &:disabled {
    color: #d9d9d9;
    cursor: not-allowed;
  }
  @media (max-width: 800px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
  }

  @media (max-width: 500px) {
    font-size: 0.6rem;
    padding: 0.3rem;
  }
`;

interface TagGroupItem {
  groupId: number;
  groupName: string;
  isBinded: boolean;
}

interface TagGroupListResponse {
  code: number;
  message: string;
  data: TagGroupItem[];
}

interface TagInfoGroup {
  groupId: number;
  groupName: string;
  groupAdmin: number;
  groupDescription: string;
}

interface TagGroups {
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
  data: TagInfoGroup[];
}

interface TagInfoData {
  tagId: number;
  tagName: string;
  tagGroups: TagGroups;
}

interface TagInfoResponse {
  code: number;
  message: string;
  data: TagInfoData;
}

interface MyClassProps {
  title?: string;
  desc?: string;
  tagId?: number;
}

interface LocationState {
  title?: string;
  tagId?: number;
}

const Overlay = styled.div`
  position: fixed;
  top: 7vh;
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
  border: none;
  border-radius: 16px;
  padding: 2.5rem;
  width: 440px;
  max-width: 500px;
  min-width: 320px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  height: 450px;
  display: flex;
  flex-direction: column;

  @media (max-width: 1200px) {
    width: 35%;
  }
  @media (max-width: 1000px) {
    width: 45%;
  }
  @media (max-width: 700px) {
    width: 55%;
  }
  @media (max-width: 600px) {
    width: 70%;
    padding: 1.5rem;
  }
  @media (max-width: 400px) {
    width: 85%;
    padding: 1rem;
  }
`;

const ErrorModal = styled(Modal)`
  width: 25%;
  text-align: center;
  padding: 2rem;
`;

const ErrorCloseButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.5rem 2rem;
  background-color: #016532;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #014a24;
  }
`;

const SearchContainer = styled.div`
  padding: 1.5rem 2rem;
  background: #white;
  // border-bottom: 1px solid #e9ecef;
  position: relative;
  height: 40px;
`;
const SearchWrapper = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  height: 40px;
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

const RoomList = styled.ul`
  list-style: none;
  padding: 1rem;
  height: 600px;
  overflow-y: auto;
  margin: 2vh 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 400px;
  max-width: 100%;
  @media (max-width: 1000px) {
    padding: 0.8rem;
  }
  @media (max-width: 700px) {
    padding: 0.5rem;
  }
  @media (max-width: 400px) {
    padding: 0.3rem;
  }
`;

const AddRoomContainer = styled.div`
  display: flex;
  height: 15px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
  }

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const AddRoomTitle = styled.p`
  font-family: Roboto;
  font-size: 1.1rem;
  color: black;
  margin: 0;
`;

const BindedRoomTitle = styled(AddRoomTitle)`
  color: #888;
  // font-style: italic;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 1rem;
  height: 1rem;
  background-color: white;
  appearance: none;
  border: 1px solid black;
  cursor: pointer;

  &:checked {
    background-color: white;
    border-color: #016532;
  }

  &:checked::after {
    content: "✓";
    color: #016532;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    top: -2px;
    left: 0px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin: 0.5rem 0;
  width: 100%;
`;

const NoRoomsMessage = styled.p`
  text-align: center;
  width: 100%;
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #666;

  @media (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const OverlayButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: center;
  height: 40px;
  
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const TagIcon = styled(FiTag)`
  color: #white;
  font-size: 1.5rem;
`;

interface AddRoomProps {
  onClose: () => void;
  onAddRooms: (selectedRoomIds: number[]) => void;
  isProcessing: boolean;
  tagId: number;
}

const AddRoomOverlay: React.FC<AddRoomProps> = ({
  onClose,
  onAddRooms,
  isProcessing,
  tagId,
}) => {
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<{
    [key: number]: boolean;
  }>({});
  const [tagGroups, setTagGroups] = useState<TagGroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add useRef to reference the modal container
  const modalRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    fetchTagGroups();
  }, [roomSearch, tagId]);

  const fetchTagGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        tagId: tagId,
        keyword: roomSearch || undefined,
      };

      console.log("Fetching tag groups with params:", requestData);

      const response = await apiClient.post<TagGroupListResponse>(
        "/v1/tag/get_group_list_for_tag",
        requestData
      );

      console.log("Tag groups API response:", response.data);

      if (response.data.code === 200) {
        // Store all groups
        setTagGroups(response.data.data);
      } else {
        setError(
          `API returned error code: ${response.data.code}, message: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in fetchTagGroups:",
          error.response?.data || error.message
        );
        setError(
          error.response?.data?.message ||
            "Failed to fetch groups. Please try again."
        );
      } else {
        console.error("Unexpected error in fetchTagGroups:", error);
        setError(
          "An unexpected error occurred while fetching groups. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (groupId: number, isBinded: boolean) => {
    if (!isBinded) {
      setSelectedRooms((prev) => ({
        ...prev,
        [groupId]: !prev[groupId],
      }));
    }
  };

  const handleAddRooms = () => {
    const selectedRoomIds = Object.keys(selectedRooms)
      .filter((key) => selectedRooms[parseInt(key)])
      .map((key) => parseInt(key));

    onAddRooms(selectedRoomIds);
  };

  return (
    <Overlay>
      <Modal ref={modalRef}>
      <ModalHeader icon={TagIcon} title="Add Room to Tag" onClose={onClose} />
        <SearchContainer>
          <SearchWrapper>
          <SearchIcon />
            <LabeledInputWithCount
                  variant="withIcon"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Search in MY ROOMS"
                  type="text"
                  showCount={false} // 搜索框通常不需要字数统计

            />
            </SearchWrapper>
        </SearchContainer>
        <RoomList>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : tagGroups.length === 0 ? (
            <NoRoomsMessage>No rooms found</NoRoomsMessage>
          ) : (
            tagGroups.map((room) => (
              <AddRoomContainer key={room.groupId}>
                <Checkbox
                  type="checkbox"
                  checked={
                    room.isBinded || selectedRooms[room.groupId] || false
                  }
                  title={room.isBinded ? "This room is already bound" : ""}
                  onChange={() =>
                    handleCheckboxChange(room.groupId, room.isBinded)
                  }
                  disabled={room.isBinded || isProcessing}
                />
                {room.isBinded ? (
                  <BindedRoomTitle>
                    {room.groupName} (Already bound)
                  </BindedRoomTitle>
                ) : (
                  <AddRoomTitle>{room.groupName}</AddRoomTitle>
                )}
              </AddRoomContainer>
            ))
          )}
          {isProcessing && (
            <ErrorMessage>Processing your request...</ErrorMessage>
          )}
        </RoomList>
        <OverlayButtonContainer>
          <Button onClick={handleAddRooms} disabled={isProcessing}>
            {isProcessing ? "Adding..." : "Add"}
          </Button>
        </OverlayButtonContainer>
        
      </Modal>
    </Overlay>
  );
};

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <Overlay>
      <ErrorModal>
        <ErrorMessage>{message}</ErrorMessage>
        <ErrorCloseButton onClick={onClose}>Close</ErrorCloseButton>
      </ErrorModal>
    </Overlay>
  );
};

const MyClass: React.FC<MyClassProps> = ({
  title: propTitle,
  tagId: propTagId,
}) => {
  const location = useLocation();
  const { tagId: urlTagId } = useParams<{ tagId: string }>();
  const state = location.state as LocationState | undefined;

  const tagId = state?.tagId || propTagId || parseInt(urlTagId || "0");
  const title = state?.title || propTitle || "Default Title";

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
  const [tagGroups, setTagGroups] = useState<TagInfoGroup[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingRooms, setIsAddingRooms] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [selectedRoomsToRemove, setSelectedRoomsToRemove] = useState<{
    [key: number]: boolean;
  }>({});
  const [pagination, setPagination] = useState({
    pageSize: 20,
    pageNum: 1,
    total: 0,
    pages: 0,
  });
  const navigate = useNavigate();
  const {
    handleJoinClick,
    redirectPath,
    setRedirectPath,
  } = useJoinRoom();

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
    }
  }, [redirectPath, navigate, setRedirectPath]);

  useEffect(() => {
    fetchTagGroups();
  }, [tagId, currentPage, isEditMode]);

  const fetchRoomInfo = async (groupId: number) => {
    try {
      const url = `/v1/group/get_group_info?groupId=${groupId}`;

      try {
        const response = await apiClient.get<RoomInfoResponse>(url);

        if (
          response.status === 200 &&
          response.data.code === 200 &&
          response.data.data
        ) {
          return response.data.data;
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

  const handleRoomClick = async (groupId: number) => {
    if (isEditMode) return;

    const roomDetails = await fetchRoomInfo(groupId);
    if (roomDetails) {
      handleJoinClick(groupId, roomDetails.groupType);
    }
  };

  const fetchTagGroups = async () => {
    if (!tagId) return;

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        tagId: tagId,
        pageRequestVO: {
          pageNum: currentPage,
          pageSize: pagination.pageSize,
        },
      };

      console.log("Fetching tag groups with params:", requestData);

      const response = await apiClient.post<TagInfoResponse>(
        "/v1/tag/get_tag_info",
        requestData
      );

      console.log("Tag groups API response:", response.data);

      if (response.data.code === 200) {
        setTagGroups(response.data.data.tagGroups.data);
        setPagination({
          pageSize: response.data.data.tagGroups.pageSize,
          pageNum: response.data.data.tagGroups.pageNum,
          total: response.data.data.tagGroups.total,
          pages: response.data.data.tagGroups.pages,
        });
      } else {
        setError(
          `API returned error code: ${response.data.code}, message: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in fetchTagGroups:",
          error.response?.data || error.message
        );
        setError(
          error.response?.data?.message ||
            "Failed to fetch groups. Please try again."
        );
      } else {
        console.error("Unexpected error in fetchTagGroups:", error);
        setError(
          "An unexpected error occurred while fetching groups. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number): void => {
    if (page > 0 && page <= pagination.pages) {
      setCurrentPage(page);
    }
  };

  const handleRemoveRoom = (roomId: number): void => {
    // Toggle selection in edit mode
    setSelectedRoomsToRemove((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const toggleEditMode = async (): Promise<void> => {
    if (isLoading) return; // Prevent toggle while loading

    // If exiting edit mode (submit), process the remove operations
    if (isEditMode) {
      const roomIdsToRemove = Object.keys(selectedRoomsToRemove)
        .filter((key) => selectedRoomsToRemove[parseInt(key)])
        .map((key) => parseInt(key));

      if (roomIdsToRemove.length > 0) {
        await removeRoomsFromTag(roomIdsToRemove);
      }
    }

    // Clear selections when toggling modes
    setSelectedRoomsToRemove({});
    setIsEditMode(!isEditMode);
    setCurrentPage(1);
  };

  const removeRoomsFromTag = async (groupIds: number[]): Promise<void> => {
    if (!tagId || groupIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        groupIdList: groupIds,
        tagId: tagId,
      };

      console.log("Removing rooms from tag with params:", requestData);

      const response = await apiClient.post(
        "/v1/tag/remove_group",
        requestData
      );

      console.log("Remove group API response:", response.data);

      if (response.data.code === 200) {
        // Refresh the group list after successful removal
        fetchTagGroups();
      } else {
        setError(
          `API returned error code: ${response.data.code}, message: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in removeRoomsFromTag:",
          error.response?.data || error.message
        );
        setError(
          error.response?.data?.message ||
            "Failed to remove rooms. Please try again."
        );
      } else {
        console.error("Unexpected error in removeRoomsFromTag:", error);
        setError(
          "An unexpected error occurred while removing rooms. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRooms = async (selectedRoomIds: number[]): Promise<void> => {
    if (!tagId || selectedRoomIds.length === 0) {
      console.error("Tag ID or selected room IDs are missing");
      return;
    }

    setIsAddingRooms(true);
    setError(null);

    try {
      const requestData = {
        groupIdList: selectedRoomIds,
        tagId: tagId,
        tagName: title,
      };

      console.log("Adding rooms to tag with params:", requestData);

      const response = await apiClient.post("/v1/tag/add_group", requestData);

      console.log("Add group API response:", response.data);

      if (response.data.code === 200) {
        // Refresh the tag groups after adding
        fetchTagGroups();
        // Close the modal only after successful API call
        setIsAddRoomVisible(false);
      } else if (response.data.code === 1001) {
        // Parameter validation error
        setErrorPopup(
          "Parameters are invalid for tag binding group. Please check your inputs and try again."
        );
      } else {
        setError(
          `API returned error code: ${response.data.code}, message: ${response.data.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error in addRooms:",
          error.response?.data || error.message
        );

        // Check for parameter validation error in the caught error
        if (error.response?.data?.code === 1001) {
          setErrorPopup(
            "Parameters are invalid for tag binding group. Please check your inputs and try again."
          );
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to add rooms. Please try again."
          );
        }
      } else {
        console.error("Unexpected error in addRooms:", error);
        setError(
          "An unexpected error occurred while adding rooms. Please try again."
        );
      }
    } finally {
      setIsAddingRooms(false);
    }
  };

  return (
    <Container>
      <TopContainer>
        <HeaderContainer>
          <TitleContainer>
            <Tag />
            <Title>{title}</Title>
          </TitleContainer>
          <PlusButtonContainer>
            <PlusButton onClick={() => setIsAddRoomVisible(true)}>
            </PlusButton>
          </PlusButtonContainer>
        </HeaderContainer>
        {/* 将按钮移到顶部 */}
        <ButtonContainer>

        {isEditMode ? (
          <>
            <Button
              variant="cancel"
              onClick={() => {
                setSelectedRoomsToRemove({});
                setIsEditMode(false);
              }}
              $isLoading={isLoading}
            >
              Cancel
            </Button>

            <Button
              onClick={toggleEditMode}
              $isEditMode={isEditMode}
              $isLoading={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </>
        ) : (
          <Button
            onClick={toggleEditMode}
            $isEditMode={isEditMode}
            $isLoading={isLoading}
          >
            Edit
          </Button>
        )}
        </ButtonContainer>

        {isAddRoomVisible && (
          <AddRoomOverlay
            onAddRooms={handleAddRooms}
            onClose={() => setIsAddRoomVisible(false)}
            isProcessing={isAddingRooms}
            tagId={tagId}
          />
        )}
        {errorPopup && (
          <ErrorPopup
            message={errorPopup}
            onClose={() => setErrorPopup(null)}
          />
        )}
      </TopContainer>

      <SearchRoomsContainer $isEditMode={isEditMode}>
        {isLoading && (
          <LoadingOverlay>
            <p>Loading...</p>
          </LoadingOverlay>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {tagGroups.length > 0 ? (
          tagGroups.map((room) => (
            <SearchRoomContainer key={room.groupId} $isEditMode={isEditMode}>
              <RoomContainer
                $isEditMode={isEditMode}
                onClick={() => handleRoomClick(room.groupId)}
              >
                <RoomContent>
                  <RoomTitle>{room.groupName}</RoomTitle>
                  <RoomAdmin>Admin: {room.groupAdmin}</RoomAdmin>
                  {room.groupDescription && (
                    <RoomDescription>{room.groupDescription}</RoomDescription>
                  )}
                </RoomContent>
              </RoomContainer>
              {isEditMode && (
                <StyledMinus
                  onClick={() => handleRemoveRoom(room.groupId)}
                  $isSelected={selectedRoomsToRemove[room.groupId] || false}
                />
              )}
            </SearchRoomContainer>
          ))
        ) : !isLoading ? (
          <NoRoomsMessage>
            No rooms are bound to this tag yet. Click the '+' button to add
            rooms.
          </NoRoomsMessage>
        ) : null}

      </SearchRoomsContainer>
      <Footer>
        <PageButton
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </PageButton>
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </PageButton>
        <Ellipsis>
          Page {currentPage} of {pagination.pages}
        </Ellipsis>
        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.pages}
        >
          Next
        </PageButton>
        <PageButton
          onClick={() => handlePageChange(pagination.pages)}
          disabled={currentPage === pagination.pages}
        >
          Last
        </PageButton>
      </Footer>
    </Container>
  );
};

export default MyClass;
