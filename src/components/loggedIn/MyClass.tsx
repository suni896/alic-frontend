import React, { useState, useEffect, useRef } from "react";
import { FiTag } from "react-icons/fi";
import { AiOutlineMinusCircle } from "react-icons/ai";
import styled from "styled-components";
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { useLocation, useParams } from "react-router-dom";
import apiClient from "../loggedOut/apiClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import { RoomInfoResponse } from "./CreateRoomComponent";
import { TiPlus } from "react-icons/ti";

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

const ButtonContainer2 = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
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


const StyledPlusContainer = styled.div`
  background-color: #d9d9d9;
  width: 3rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
  cursor: pointer;

  &:hover {
    background-color: #c9c9c9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 600px) {
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const StyledPlus = styled(TiPlus)`
  color: #016532;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #014a24;
    transform: scale(1.1);
  }

  @media (max-width: 600px) {
    font-size: 1.4rem;
  }
`;

const SearchRoomsContainer = styled.div<RoomContainerProps>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  box-sizing: border-box;
  align-items: center;
`;

const RoomContainer = styled.div<RoomContainerProps>`
  width: ${(props) => (props.$isEditMode ? "calc(100% - 2.5rem)" : "100%")};
  border-radius: 6px;
  border: solid #d9d9d9;
  padding: 1rem;
  box-sizing: border-box;
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
  min-width: 1.5rem;
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

const CancelButton = styled.button<{ $isLoading?: boolean }>`
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.$isLoading ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$isLoading ? "0.7" : "1")};
  font-size: 0.9rem;
  white-space: nowrap;

  &:hover {
    background-color: #5a6268;
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
  border: none;
  border-radius: 16px;
  padding: 2rem;
  width: 28%;
  max-width: 500px;
  min-width: 320px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 80vh;
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

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  outline: none;

  &:hover {
    opacity: 0.7;
  }
  &:focus {
    outline: none;
  }
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
  color: #888;
  font-size: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  background-color: white;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 400px;
  max-width: 100%;
  flex-shrink: 0;

  &:focus-within {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: #016532;
    transform: translateY(-1px);
  }

  @media (max-width: 1000px) {
    width: 240px;
  }

  @media (max-width: 800px) {
    width: 200px;
  }

  @media (max-width: 600px) {
    width: 100%;
    max-width: 300px;
    padding: 0.7rem 0.8rem;
  }
`;

const SearchIcon = styled(CiSearch)`
  font-size: 1.4rem;
  color: #6b7280;
  margin-right: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 600px) {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 1rem;
  color: #374151;
  background: transparent;
  width: 100%;
  flex: 1;
  min-width: 0;

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const RoomList = styled.ul`
  list-style: none;
  padding: 1rem;
  max-height: 26vh;
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
        <CloseButton onClick={onClose} disabled={isProcessing}>
          <StyledCross size={20} />
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
        <AddButton onClick={handleAddRooms} disabled={isProcessing}>
          {isProcessing ? "Adding..." : "Add"}
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
    pageSize: 8,
    pageNum: 1,
    total: 0,
    pages: 0,
  });
  const navigate = useNavigate();
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
        <Tag />
        <Title>{title}</Title>

        {/* 将按钮移到顶部 */}
        <ButtonContainer>
          <StyledPlusContainer onClick={() => setIsAddRoomVisible(true)}>
            <StyledPlus/>
          </StyledPlusContainer>
          {isEditMode ? (
            // 编辑模式下显示提交和取消按钮
            <>
              <CancelButton
                onClick={() => {
                  // 退出编辑模式，清除选择
                  setSelectedRoomsToRemove({});
                  setIsEditMode(false);
                }}
                $isLoading={isLoading}
                disabled={isLoading}
              >
                CANCEL
              </CancelButton>
              <EditButton
                onClick={toggleEditMode}
                $isEditMode={isEditMode}
                $isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "PROCESSING..." : "SUBMIT"}
              </EditButton>
            </>
          ) : (
            // 非编辑模式下只显示编辑按钮
            <EditButton
              onClick={toggleEditMode}
              $isEditMode={isEditMode}
              $isLoading={isLoading}
              disabled={isLoading}
            >
              EDIT
            </EditButton>
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
                <ButtonContainer2>
                  <SubmitButton onClick={handlePasswordSubmit}>
                    Submit
                  </SubmitButton>
                </ButtonContainer2>
              </Modal>
            )}
            {showErrorModal && !joinSuccess && (
              <Modal>
                <ErrorMessage style={{ color: joinSuccess ? "green" : "red" }}>
                  {errorMessage}
                </ErrorMessage>
                <ErrorModalButton
                  onClick={() => {
                    setShowErrorModal(false);
                    if (joinSuccess) {
                      // onClose();
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
