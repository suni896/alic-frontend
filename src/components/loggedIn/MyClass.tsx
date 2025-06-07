import React, { useState, useEffect } from "react";
import { FiTag } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineMinusCircle } from "react-icons/ai";
import styled from "styled-components";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { useLocation, useParams } from "react-router-dom";
import apiClient from "../loggedOut/apiClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import { RoomInfoResponse } from "./CreateRoomComponent";

interface RoomContainerProps {
  $isEditMode: boolean;
}

interface EditButtonProps {
  $isEditMode: boolean;
  $isLoading?: boolean;
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
  margin-top: 72px;
`;

const TopContainer = styled.div`
  display: flex;
  width: 100%;
  height: 12vh;
  align-items: center;
  justify-content: center;
`;

// const ButtonContainer = styled.div`
//   position: absolute;
//   right: 3%;
//   display: flex;
//   gap: 1rem;
//   align-items: center;
// `;

const ButtonContainer = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  right: 5rem;
  top: 9.5rem;
  width: auto;
  z-index: 1000;
  gap: 1rem;

  @media (max-width: 1000px) {
    right: 1.5rem;
  }
`;

const Title = styled.p`
  font-family: Roboto;
  font-weight: 600;
  font-size: 2.2rem;
  @media (max-width: 800px) {
    font-size: 2rem;
    font-weight: 500;
  }

  @media (max-width: 500px) {
    font-size: 1.7rem;
  }
`;

const Tag = styled(FiTag)`
  color: black;
  font-size: 2rem;

  @media (max-width: 500px) {
    font-size: 1.7rem;
  }
`;

const StyledPlus = styled(AiOutlinePlus)`
  color: #016532;
  font-size: 2rem;
  cursor: pointer;
  @media (max-width: 500px) {
    font-size: 1.7rem;
  }
`;

const SearchRoomsContainer = styled.div<RoomContainerProps>`
  display: ${(props) => (props.$isEditMode ? "flex" : "grid")};
  grid-template-columns: repeat(2, 1fr); /* 两列布局 */
  gap: 2rem;
  padding: 0 2rem;
  margin-top: 4vh;
  margin-bottom: 8vh;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 1000px) {
    gap: 1.5rem;
  }
  @media (max-width: 600px) {
    gap: 1rem;
    padding: 0 1rem;
  }

  ${(props) =>
    props.$isEditMode &&
    `
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
    `}
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
  width: ${(props) => (props.$isEditMode ? "55%" : "100%")};
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 4rem;
  // padding: 2rem;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  justify-content: flex-start;

  @media (max-width: 1000px) {
    gap: 2rem;
  }
  @media (max-width: 600px) {
    gap: 2rem 0.8rem;
    padding: 2rem 1rem;
  }
`;

const RoomContainer = styled.div<RoomContainerProps>`
  width: ${(props) => (props.$isEditMode ? "80%" : "100%")};
  border-radius: 6px;
  border: solid #d9d9d9;
  padding: 1rem;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.3rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #016532;
  }

  @media (max-width: 600px) {
    padding: 1rem 0.5rem;
  }
`;

const StyledMinus = styled(AiOutlineMinusCircle)<StyledMinusProps>`
  color: ${(props) => (props.$isSelected ? "#fc5600" : "black")};
  font-size: 1.5rem;
  cursor: pointer;
  flex-shrink: 0;
`;

const RoomContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex-grow: 1;
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
  @media (max-width: 400px) {
    font-size: 0.6rem;
  }
`;

const EditButton = styled.button<EditButtonProps>`
  padding: 0.5rem 1rem;
  background-color: ${(props) => (props.$isEditMode ? "#016532" : "#000")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.$isLoading ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$isLoading ? "0.7" : "1")};
  font-size: 0.9rem;
  white-space: nowrap;

  &:hover {
    background-color: ${(props) => (props.$isEditMode ? "#015528" : "#333")};
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  position: fixed;
  bottom: 4vh;
  width: 80%;
  background-color: white;
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

const ErrorModal = styled(Modal)`
  width: 25%;
  text-align: center;
  padding: 2rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 1%;
  border: none;
  background: none;
  cursor: pointer;
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

const StyledCross = styled(RxCross2)`
  color: black;
  font-size: 1rem;
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  gap: 0.5rem;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 95%;
  padding: 0.6rem 0.5rem 0.6rem 3rem;
  font-size: 1rem;
  border: 1px solid #9f9e9e;
  color: black;
  background: white;
  border-radius: 6px;
  cursor: pointer;

  @media (max-width: 500px) {
    font-size: 0.9rem;
    padding: 0.6rem 0.5rem 0.6rem 2.2rem;
  }
`;

const SearchIcon = styled(CiSearch)`
  position: absolute;
  font-size: 2rem;
  left: 0.5rem;

  @media (max-width: 500px) {
    font-size: 1.5rem;
  }
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 26vh;
  overflow-y: auto;
  margin: 2vh 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;

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
  align-items: center;
  gap: 2%;
  padding-left: 1%;
  margin-bottom: 1.5vh;
`;

const AddRoomTitle = styled.p`
  font-family: Roboto;
  font-size: 1.1rem;
  color: black;
  margin: 0;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 20px;
  height: 20px;
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

const AddButton = styled.button`
  border: none;
  padding: 0.5rem 2rem;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #016532;
  color: white;

  &:hover {
    background-color: #014a24;
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

  const handleCheckboxChange = (groupId: number) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleAddRooms = () => {
    const selectedRoomIds = Object.keys(selectedRooms)
      .filter((key) => selectedRooms[parseInt(key)])
      .map((key) => parseInt(key));

    onAddRooms(selectedRoomIds);
  };

  // Filter groups that are NOT yet bound to the tag (isBinded = false)
  const unboundGroups = tagGroups.filter((group) => !group.isBinded);

  return (
    <Overlay>
      <Modal>
        <CloseButton onClick={onClose} disabled={isProcessing}>
          <StyledCross />
        </CloseButton>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            placeholder="Search in MY ROOMS"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            disabled={isProcessing}
          />
        </SearchContainer>
        <RoomList>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            unboundGroups.map((room) => (
              <AddRoomContainer key={room.groupId}>
                <Checkbox
                  type="checkbox"
                  checked={selectedRooms[room.groupId] || false}
                  onChange={() => handleCheckboxChange(room.groupId)}
                  disabled={isProcessing}
                />
                <AddRoomTitle>{room.groupName}</AddRoomTitle>
              </AddRoomContainer>
            ))
          )}
          {isProcessing && (
            <ErrorMessage>Processing your request...</ErrorMessage>
          )}
        </RoomList>
        <AddButton onClick={handleAddRooms} disabled={isProcessing}>
          {isProcessing ? "ADDING..." : "ADD"}
        </AddButton>
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

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let pages = [];

  pages.push(1);

  if (currentPage <= 3) {
    pages.push(2, 3, 4);
    pages.push("...");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push("...");
    pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push("...");
    pages.push(currentPage - 1, currentPage, currentPage + 1);
    pages.push("...");
    pages.push(totalPages);
  }

  return pages;
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
  const [tagGroups, setTagGroups] = useState<TagGroupItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingRooms, setIsAddingRooms] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [selectedRoomsToRemove, setSelectedRoomsToRemove] = useState<{
    [key: number]: boolean;
  }>({});
  const [pagination, setPagination] = useState({
    pageSize: 8,
    pageNum: 1,
    total: 0,
    pages: 0,
  });
  const navigate = useNavigate();
  const { handleJoinClick, redirectPath, setRedirectPath } = useJoinRoom();

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
        keyword: undefined,
      };

      console.log("Fetching tag groups with params:", requestData);

      const response = await apiClient.post<TagGroupListResponse>(
        "/v1/tag/get_group_list_for_tag",
        requestData
      );

      console.log("Tag groups API response:", response.data);

      if (response.data.code === 200) {
        setTagGroups(response.data.data);

        // Update pagination based on bound groups
        const boundGroups = response.data.data.filter(
          (group) => group.isBinded
        );
        const roomsPerPage = isEditMode ? 4 : 8;

        setPagination({
          pageSize: roomsPerPage,
          pageNum: currentPage,
          total: boundGroups.length,
          pages: Math.ceil(boundGroups.length / roomsPerPage),
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

  const roomsPerPage = isEditMode ? 4 : 8;

  // Filter for groups that are bound to the tag (isBinded = true)
  const boundGroups = tagGroups.filter((group) => group.isBinded);

  // const totalPages = Math.ceil(boundGroups.length / roomsPerPage);
  // setTotalPages(Math.ceil(boundGroups.length / roomsPerPage));

  const currentRooms = boundGroups.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

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
        <Tag />
        <Title>CLASS {title}</Title>

        {/* 将按钮移到顶部 */}
        <ButtonContainer>
          <StyledPlus onClick={() => setIsAddRoomVisible(true)} />
          <EditButton
            onClick={toggleEditMode}
            $isEditMode={isEditMode}
            $isLoading={isLoading}
            disabled={isLoading}
          >
            {isEditMode ? "SUBMIT" : "EDIT"}
          </EditButton>
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

        {currentRooms.length > 0 ? (
          currentRooms.map((room) => (
            <SearchRoomContainer key={room.groupId} $isEditMode={isEditMode}>
              <RoomContainer
                $isEditMode={isEditMode}
                onClick={() => handleRoomClick(room.groupId)}
              >
                <RoomContent>
                  <RoomTitle>{room.groupName}</RoomTitle>
                  <RoomAdmin>Admin: Admin</RoomAdmin>
                  <RoomDescription>Room from tag</RoomDescription>
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
