import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import styled from "styled-components";
import { CiSearch } from "react-icons/ci";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useJoinRoom } from "./useJoinRoom";
import Button from "../ui/Button";
import LabeledInputWithCount from "../ui/Input";
import { generateGroupAvatar } from "../../utils/avatar";

import { 
  useTagGroups, 
  useAvailableGroups, 
  useRemoveRoomsFromTag, 
  useAddRoomsToTag,
  usePrefetchGroupInfo,
} from '../../hooks/queries/useTag';
import type { AvailableGroup, TagInfoGroup } from '../../api/tag.api';
import {
  PageButton as PagerButton,
  PaginationCenter,
  PageNumber,
  EllipsisBlock,
  SearchRoomsContainer as SharedSearchRoomsContainer,
  LoadingContainer,
  EmptyState,
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
  ModalBackdrop,
  ModalContainer,
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  ButtonContainer,
  FixedButtonContainer,
} from "../ui/SharedComponents";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdGroup,
  MdCheckCircle,
  MdRadioButtonUnchecked,
} from "react-icons/md";


const Container = styled.div`
  background: var(--color-line);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  height: calc(100vh - 3.5rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: calc(100vh - 4.5rem);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: calc(100vh - 5rem);
  }
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  width: 100%;
  height: auto;
  min-height: 3rem;
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-3) var(--space-4);
    min-height: 4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: 2vh 4vw;
    height: 12vh;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-1);
  position: relative;
  height: auto;
  width: 100%;
  background-color: white;
  padding: var(--space-3) 0;
  margin-top: var(--space-2);
  flex-shrink: 0;
  font-family: var(--font-sans);
  font-weight: var(--weight-regular);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-5) 0;
    margin-top: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-6) 0;
    margin-top: var(--space-5);
  }
`;

const PaginationCenterFixed = styled(PaginationCenter)`
  flex: 0;
  gap: var(--space-1);
  min-width: calc(4 * (var(--space-8) + var(--space-2)) + 3 * var(--space-1));

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-2);
    min-width: calc(5 * (var(--space-9) + var(--space-3)) + 4 * var(--space-2));
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-2);
    min-width: calc(6 * (var(--space-9) + var(--space-3)) + 5 * var(--space-2));
  }
`;

// MyClass 专用的房间容器，减去 TopContainer 占用的空间
const MyClassRoomsContainer = styled(SharedSearchRoomsContainer)`
  max-height: calc(100% - 14vh);
  height: 100%;  /* 填满父容器剩余空间 */
`;

const SelectableCard = styled(IntegrationCard)<{ $selected?: boolean }>`
  position: relative;
  border: 1px solid ${props => (props.$selected ? "var(--emerald-green)" : "transparent")};
  box-shadow: ${props =>
    props.$selected
      ? "0 0 0 2px rgba(1, 101, 50, 0.15)"
      : "0 1px 2px rgba(16, 24, 40, 0.04)"};

  /* tablet >= 768px: only apply overflow hidden on larger screens */
  @media (min-width: 48rem) {
    overflow: hidden;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(148, 163, 184, 0.18);
    border-radius: inherit;
    opacity: ${props => (props.$selected ? 1 : 0)};
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.15s ease;
  }
`;

const EditSelectBadge = styled.button<{ $selected?: boolean }>`
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  outline: none;
  border: 1px solid ${props => (props.$selected ? "var(--emerald-green)" : "var(--gray-300)")};
  background: ${props => (props.$selected ? "var(--emerald-green)" : "var(--white)")};
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${props => (props.$selected ? "var(--white)" : "transparent")};
  z-index: 2;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    outline: none;
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
    fill: currentColor;
  }
`;


interface MyClassProps {
  title?: string;
  desc?: string;
  tagId?: number;
}

interface LocationState {
  title?: string;
  tagId?: number;
}


const StyledModalContainer = styled(ModalContainer)`
  background: var(--white);
  width: 90%;
  max-width: 28rem;
  height: 80vh;
  max-height: 38rem;
  border-radius: var(--radius-12);
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px var(--shadow-25);
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  cursor: default;
  
  @media (min-width: 48rem) {
    width: 28rem;
    height: 38rem;
    padding: var(--space-7);
  }
`;

const ErrorModalContainer = styled(StyledModalContainer)`
  width: 90%;
  max-width: 25rem;
  min-width: auto;
  height: auto;
  min-height: 12rem;
  text-align: center;
`;

const ErrorCloseButton = styled.button`
  margin-top: 1.5rem;
  padding: var(--space-3) var(--space-6);
  background-color: var(--emerald-green);
  color: white;
  border: none;
  border-radius: var(--radius-5);
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: var(--weight-semibold);

  &:hover {
    filter: brightness(0.95);
  }
`;

const SearchContainer = styled.div`
  padding: var(--space-5) var(--space-7);
  background: var(--white);
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
  color: var(--muted-6b7280);
  z-index: 1;
`;

const RoomList = styled.ul`
  padding: var(--space-4) var(--space-7) var(--space-7);
  height: 20rem;
  overflow-y: auto;
  background: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-5);
  width: 25rem;
  position: relative;
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 3px;
  }

`;

const AddRoomContainer = styled.div`
  display: flex;
  height: 15px;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  background-color: var(--input-bg);
  border-radius: var(--radius-5);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--gray-100);
  }

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const AddRoomTitle = styled.p`
  font-family: var(--font-roboto);
  font-size: var(--space-5);
  color: var(--text-primary);
  margin: 0;
`;

const BindedRoomTitle = styled(AddRoomTitle)`
  color: var(--gray-500);
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--emerald-green);
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:checked {
    background-color: var(--emerald-green);
  }

  &:checked::after {
    content: "✓";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
  }

  &:hover {
    border-color: var(--emerald-green);
    box-shadow: 0 0 0 2px rgba(1, 101, 50, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: var(--error-red);
  text-align: center;
  margin: var(--space-2) 0;
  width: 100%;
  font-family: var(--font-sans);
`;

const NoRoomsMessage = styled.p`
  text-align: center;
  width: 100%;
  margin-top: var(--space-8);

  /* mobile - 基础样式 */
  font-size: var(--space-4);

  color: var(--muted-6b7280);
  font-family: var(--font-sans);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
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

  // Use custom hook (13.6) - already has cache config (13.15)
  const { data: tagGroups = [], isLoading, error } = useAvailableGroups(tagId, roomSearch);

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
    <ModalBackdrop onClick={onClose}  className="modal-backdrop-right">
      <StyledModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 */}
        <HeaderSection>
          <HeaderTitle>Add Room to Tag</HeaderTitle>
          <HeaderSubTitle>Select rooms to add to this tag.</HeaderSubTitle>
        </HeaderSection>

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
            <NoRoomsMessage>Loading...</NoRoomsMessage>
          ) : error ? (
            <ErrorMessage>{error.message}</ErrorMessage>
          ) : tagGroups.length === 0 ? (
            <NoRoomsMessage>No rooms found</NoRoomsMessage>
          ) : (
            tagGroups.map((room: AvailableGroup) => (
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
        <ButtonContainer>
          <FixedButtonContainer>
            <Button onClick={handleAddRooms} disabled={isProcessing}>
              {isProcessing ? "Adding..." : "Add"}
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </StyledModalContainer>
    </ModalBackdrop>
  );
};

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <ModalBackdrop onClick={onClose} className="modal-backdrop-right">
      <ErrorModalContainer onClick={(e) => e.stopPropagation()}>
        <ErrorMessage>{message}</ErrorMessage>
        <ErrorCloseButton onClick={onClose}>Close</ErrorCloseButton>
      </ErrorModalContainer>
    </ModalBackdrop>
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

  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [selectedRoomsToRemove, setSelectedRoomsToRemove] = useState<{
    [key: number]: boolean;
  }>({});
  const [pagination, setPagination] = useState({
    pageSize: 6,
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

  // Use custom hook (13.6) - already has cache config (13.15)
  const { data: tagGroupsData, isLoading, error } = useTagGroups(
    tagId, 
    { pageNum: pagination.pageNum, pageSize: pagination.pageSize }
  );

  // Extract data and pagination from response
  const tagGroups = tagGroupsData?.tagGroups.data ?? [];

  // Update pagination when data changes
  useEffect(() => {
    if (tagGroupsData?.tagGroups) {
      setPagination({
        pageSize: tagGroupsData.tagGroups.pageSize,
        pageNum: tagGroupsData.tagGroups.pageNum,
        total: tagGroupsData.tagGroups.total,
        pages: tagGroupsData.tagGroups.pages,
      });
    }
  }, [tagGroupsData]);

  // Prefetch hook for group info (replaces direct fetchGroupInfo call)
  const prefetchGroupInfo = usePrefetchGroupInfo();

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
    }
  }, [redirectPath, navigate, setRedirectPath]);

  const handleRoomClick = async (groupId: number) => {
    if (isEditMode) return;

    // Use prefetch hook to get group info (13.3: Component never calls API directly)
    const info = await prefetchGroupInfo(groupId);

    //tag中的room默认已加入
    handleJoinClick(groupId, info.groupType, true);
  };

  const handlePageChange = (page: number): void => {
    if (page > 0 && page <= pagination.pages) {
      setPagination(prev => ({ ...prev, pageNum: page }));
    }
  };

  // 与 SearchRooms 一致的页码生成规则
  const getPageItems = (current: number, total: number): Array<number | "ellipsis"> => {
    // ≤5 页：全展示
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // >5 页：按规则与末尾对称处理
    if (current === 1) {
      return [1, 2, "ellipsis", total - 1, total];
    }
    if (current === 2) {
      return [1, 2, 3, "ellipsis", total];
    }
    if (current === 3) {
      return [1, "ellipsis", 3, "ellipsis", total];
    }
    if (current === total) {
      return [1, 2, "ellipsis", total - 1, total];
    }
    if (current === total - 1) {
      return [1, "ellipsis", total - 2, total - 1, total];
    }
    if (current === total - 2) {
      return [1, "ellipsis", total - 2, total - 1, total];
    }

    // 中间页：左右省略，当前页居中
    return [1, "ellipsis", current, "ellipsis", total];
  };

  const handleRemoveRoom = (roomId: number): void => {
    // Toggle selection in edit mode
    setSelectedRoomsToRemove((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  // Use custom mutation hook (13.6)
  const removeRoomsMutation = useRemoveRoomsFromTag();

  const toggleEditMode = async (): Promise<void> => {
    if (isLoading) return; // Prevent toggle while loading

    // If exiting edit mode (submit), process the remove operations
    if (isEditMode) {
      const roomIdsToRemove = Object.keys(selectedRoomsToRemove)
        .filter((key) => selectedRoomsToRemove[parseInt(key)])
        .map((key) => parseInt(key));

      if (roomIdsToRemove.length > 0 && tagId) {
        await removeRoomsMutation.mutateAsync({ 
          tagId: tagId.toString(), 
          roomIds: roomIdsToRemove 
        });
        alert("Rooms removed successfully!");
      }
    }

    // Clear selections when toggling modes
    setSelectedRoomsToRemove({});
    setIsEditMode(!isEditMode);
    setPagination(prev => ({ ...prev, pageNum: 1 }));
  };

  // Use custom mutation hook (13.6)
  const addRoomsMutation = useAddRoomsToTag();
  
  // Handle add rooms with custom error handling
  const handleAddRoomsWithError = (selectedRoomIds: number[]): void => {
    if (!tagId || selectedRoomIds.length === 0) {
      console.error("Tag ID or selected room IDs are missing");
      return;
    }
    
    addRoomsMutation.mutate(
      { tagId, title, roomIds: selectedRoomIds },
      {
        onSuccess: () => {
          // Show success message and close the modal
          alert("Rooms added successfully!");
          setIsAddRoomVisible(false);
        },
        onError: (error) => {
          if (error.message.includes('Parameters are invalid')) {
            setErrorPopup(
              "Parameters are invalid for tag binding group. Please check your inputs and try again."
            );
          } else {
            console.error("Failed to add rooms:", error.message);
          }
        },
      }
    );
  };





  return (
    <Container>
      <TopContainer>
        {/* 将按钮移到顶部 */}
        <ButtonContainer>

        {isEditMode ? (
          <>
            <FixedButtonContainer>
              <Button
                variant="cancel"
                onClick={() => {
                  setSelectedRoomsToRemove({});
                  setIsEditMode(false);
                }}
              >
                Cancel
              </Button>
            </FixedButtonContainer>

            <FixedButtonContainer>
              <Button
                onClick={toggleEditMode}
                $isEditMode={isEditMode}
                $isLoading={isLoading}
              >
                Submit
              </Button>
            </FixedButtonContainer>
          </>
        ) : (
          <>
            <FixedButtonContainer>
              <Button
                variant="cancel"
                onClick={() => setIsAddRoomVisible(true)}
              >
                + Add Room
              </Button>
            </FixedButtonContainer>
            <FixedButtonContainer>
              <Button
                onClick={toggleEditMode}
                $isEditMode={isEditMode}
              >
                Edit
              </Button>
            </FixedButtonContainer>
          </>
          
        )}
        </ButtonContainer>

        {isAddRoomVisible && (
          <AddRoomOverlay
            onAddRooms={handleAddRoomsWithError}
            onClose={() => setIsAddRoomVisible(false)}
            isProcessing={addRoomsMutation.isPending}
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

      <MyClassRoomsContainer>
        {isLoading ? (
          <LoadingContainer>Loading...</LoadingContainer>
        ) : error ? (
          <EmptyState title="Error" description={error.message} />
        ) : tagGroups.length === 0 ? (
          <EmptyState title="No rooms found" description="You haven't joined any rooms yet. Create a new room or join existing ones." />
        ) : (
          tagGroups.map((room: TagInfoGroup) => {
            const isSelected = !!selectedRoomsToRemove[room.groupId];
            return (
              <SelectableCard key={room.groupId} $selected={isEditMode && isSelected}>
                {isEditMode && (
                  <EditSelectBadge
                    $selected={isSelected}
                    onClick={() => handleRemoveRoom(room.groupId)}
                    aria-label={isSelected ? "Selected" : "Select for removal"}
                  >
                    {isSelected ? <MdCheckCircle /> : <MdRadioButtonUnchecked />}
                  </EditSelectBadge>
                )}

                <CardTop>
                  <CardHeader>
                    <HeaderLeft>
                      <Avatar>
                        <AvatarImg src={generateGroupAvatar(room.groupName, 64)} alt={room.groupName} />
                      </Avatar>
                      <NameBlock>
                        <NameText>{room.groupName}</NameText>
                        <StatusRow>
                          <StatusDot $joined={true} />
                          <StatusText>Joined</StatusText>
                        </StatusRow>
                      </NameBlock>
                    </HeaderLeft>
                  </CardHeader>

                  <RoomInfo>
                    <InfoItem>
                      <MdGroup />
                      <InfoItemText>Admin: {room.groupAdmin}</InfoItemText>
                    </InfoItem>
                  </RoomInfo>

                  <CardDescription>
                    {room.groupDescription || "Join this room to start chatting."}
                  </CardDescription>
                </CardTop>

                <ActionButton
                  onClick={() => handleRoomClick(room.groupId)}
                  disabled={isEditMode}
                >
                  Enter
                </ActionButton>
              </SelectableCard>
            );
          })
        )}
      </MyClassRoomsContainer>
      <Footer>
        <PagerButton
          onClick={() => handlePageChange(1)}
          disabled={pagination.pageNum === 1}
        >
          <MdKeyboardDoubleArrowLeft/>
        </PagerButton>

        <PagerButton
          onClick={() => handlePageChange(pagination.pageNum - 1)}
          disabled={pagination.pageNum === 1}
        >
          <MdKeyboardArrowLeft/>
        </PagerButton>

        <PaginationCenterFixed>
          {getPageItems(pagination.pageNum, pagination.pages).map((item, idx) =>
            item === "ellipsis" ? (
              <EllipsisBlock key={`mc-ellipsis-${idx}`}>...</EllipsisBlock>
            ) : (
              <PageNumber
                key={`mc-page-${item}`}
                $active={pagination.pageNum === item}
                onClick={() => handlePageChange(item)}
              >
                {item}
              </PageNumber>
            )
          )}
        </PaginationCenterFixed>

        <PagerButton
          onClick={() => handlePageChange(pagination.pageNum + 1)}
          disabled={pagination.pageNum === pagination.pages}
        >
          <MdKeyboardArrowRight/>
        </PagerButton>

        <PagerButton
          onClick={() => handlePageChange(pagination.pages)}
          disabled={pagination.pageNum === pagination.pages}
        >
          <MdKeyboardDoubleArrowRight/>
        </PagerButton>
      </Footer>
    </Container>
  );
};

export default MyClass;
