import React, { useState, useEffect, useRef } from "react";
import { FiTag } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import styled from "styled-components";
import axios from "axios";
import apiClient from "../loggedOut/apiClient";
import Button from "../button";
import LabeledInputWithCount from "../Input";
import ModalHeader from "../Header";

// 接口定义
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

export interface AddRoomToTagProps {
  onClose: () => void;
  onAddRooms: (selectedRoomIds: number[]) => void;
  isProcessing: boolean;
  tagId: number;
}

// 样式组件
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

const SearchContainer = styled.div`
  padding: 1.5rem 2rem;
  background: #white;
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

// 主组件
const AddRoomToTag: React.FC<AddRoomToTagProps> = ({
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
              showCount={false}
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

export default AddRoomToTag;