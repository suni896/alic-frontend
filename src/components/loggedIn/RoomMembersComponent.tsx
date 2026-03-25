import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";
import { useUserInfo } from "../../hooks/queries/useUser";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { useUserRole, useGroupMemberList, useRemoveGroupMember } from "../../hooks/queries/useGroup";
import type { GroupMember } from "../../api/group.api";

// Keep for backwards compatibility with MyRoom.tsx
export const membersCache = new Map<number, GroupMember[]>();
import Button from "../ui/Button";
import ConfirmationModal from "../loggedIn/ConfirmationModal";
import {
  HeaderSection,
  HeaderTitle,
} from "../ui/SharedComponents";

const Overlay = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;

  /* ================= Box Model ================= */
  width: 100%;
  height: 100vh;

  /* ================= Visual ================= */
  background: rgba(17, 24, 39, 0.35);
`;

const MembersListContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* ================= Box Model ================= */
  width: 70%;
  height: 100vh;

  /* ================= Visual ================= */
  background: var(--white);
  box-shadow: -4px 0 var(--space-5) rgba(0, 0, 0, 0.1);
  
  @media (min-width: 48rem) {
    width: 35%;
  }
  @media (min-width: 64rem) {
    width: 25%;
  }
  @media (min-width: 80rem) {
    width: 20%;
  }
`;

const TitleContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  // flex-direction: column;
  // justify-content: center;
  // align-items: center;
  position: relative;
  
  /* ================= Box Model ================= */
  width: 100%;
  height: 4rem;
  padding: var(--space-6) 0 0 var(--space-6);

  /* ================= Visual ================= */
  background: var(--white);
  // border-bottom: 1px solid var(--color-line);
`;


const BottomContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  
  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-4) 0;
  
  /* ================= Visual ================= */
  background-color: var(--white);
  border-top: 1px solid var(--color-line);
  overflow-x: hidden;
`;

const ListContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex: 1;          /* 吃掉剩余空间 */
  overflow-y: auto; /* 菜单滚动 */
  flex-direction: column;
  overflow-x: hidden;
  
  /* ================= Box Model ================= */
  width: 90%;
  // margin-top: var(--space-8);
  padding: 0 var(--space-3);
  gap: var(--space-3);
  
  /* ================= Visual ================= */
  background-color: var(--white);
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius-3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: var(--radius-3);
    
    &:hover {
      background: var(--gray-400);
    }
  }
`;

const LineSeparator = styled.hr`
  /* ================= Layout ================= */
  border: none;
  
  /* ================= Box Model ================= */
  width: 90%;
  height: 1px;
  margin: var(--space-3) 0;

  /* ================= Visual ================= */
  background: linear-gradient(90deg, transparent, var(--gray-200), transparent);
`;


const CloseArrow = styled(MdOutlineKeyboardDoubleArrowRight)`
  /* ================= Layout ================= */
  margin-top: var(--space-4);

  /* ================= Typography ================= */
  font-size: 1.5rem;

  /* ================= Visual ================= */
  color: var(--gray-500);

  /* ================= Animation ================= */
  transition: all 0.3s ease;

  /* ================= Interaction ================= */
  cursor: pointer;
  
  &:hover {
    color: var(--emerald-green);
  }
`;

const MemberContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  /* ================= Box Model ================= */
  width: 90%;
  padding: var(--space-3);
  
  /* ================= Visual ================= */
  background: var(--white);
  border-radius: var(--radius-5);
  border: 1px solid var(--gray-200);
  box-shadow: 0 1px var(--space-2) rgba(0, 0, 0, 0.05);

  /* ================= Animation ================= */
  transition: all 0.3s ease;
  
  /* ================= Interaction ================= */
  &:hover {
    background: linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%);
    border-color: var(--emerald-green);
    transform: translateY(-1px);
    box-shadow: 0 var(--space-2) var(--space-4) rgba(1, 101, 50, 0.1);
  }
`;

const MemberInfo = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;

  /* ================= Typography ================= */
  /* mobile - 基础样式 */
  font-size: var(--space-3);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-3);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;

const LoadingIndicator = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  align-items: center;

  /* ================= Box Model ================= */
  width: 100%;
  height: 5rem;

  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);

  /* ================= Visual ================= */
  color: var(--gray-500);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    height: 5.5rem;
    font-size: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    height: 6.25rem;
    font-size: var(--space-5);
  }
`;

const Avatar = styled.img`
  /* ================= Layout ================= */
  display: block;

  /* ================= Box Model ================= */
  /* mobile - 基础样式 */
  width: 1.75rem;
  height: 1.75rem;
  margin-right: var(--space-2);

  /* ================= Visual ================= */
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--gray-200);

  /* ================= Animation ================= */
  transition: all 0.3s ease;

  /* ================= Interaction ================= */
  &:hover {
    border-color: var(--emerald-green);
    transform: scale(1.05);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 2rem;
    height: 2rem;
    margin-right: var(--space-2);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 2.25rem;
    height: 2.25rem;
    margin-right: var(--space-3);
  }

  /* large desktop >= 1280px */
  @media (min-width: 80rem) {
    width: 2.75rem;
    height: 2.75rem;
    margin-right: var(--space-4);
  }
`;

const Username = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
`;

const UserNameText = styled.p`
  /* ================= Layout ================= */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* ================= Box Model ================= */
  margin: 0;
  max-width: 100%;

  /* ================= Typography ================= */
  /* mobile - 基础样式 */
  font-size: var(--space-3);

  /* ================= Visual ================= */
  color: var(--primary-text);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const AdminLabel = styled.span`
  /* ================= Layout ================= */
  display: inline-block;

  /* ================= Box Model ================= */
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-3);

  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* ================= Visual ================= */
  color: var(--emerald-green);
  background: var(--white);
  border-radius: var(--radius-5);
  border: 1px solid var(--emerald-green);
`;

const MemberLabel = styled.span`
  /* ================= Layout ================= */
  display: inline-block;

  /* ================= Box Model ================= */
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-3);

  /* ================= Typography ================= */
  font-size: var(--space-3);
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* ================= Visual ================= */
  color: var(--gray-500);
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
  border-radius: var(--radius-5);
  border: 1px solid var(--gray-300);
`;

const ButtonContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: center;
  
  /* ================= Box Model ================= */
  height: 2.5rem;
  gap: var(--space-4);
`;

const RemoveIcon = styled(AiOutlineMinusCircle)<{ isSelected: boolean }>`
  /* ================= Layout ================= */
  display: block;
  flex-shrink: 0;

  /* ================= Box Model ================= */
  /* mobile - 基础样式 */
  margin-left: var(--space-2);
  padding: var(--space-1);

  /* ================= Typography ================= */
  /* mobile - 基础样式 */
  font-size: 1.25rem;

  /* ================= Visual ================= */
  color: ${(props) => (props.isSelected ? "var(--error-red)" : "var(--gray-400)")};
  border-radius: 50%;

  /* ================= Animation ================= */
  transition: all 0.3s ease;

  /* ================= Interaction ================= */
  cursor: pointer;

  &:hover {
    color: ${(props) => (props.isSelected ? "var(--error-red-dark)" : "var(--gray-500)")};
    background-color: ${(props) => (props.isSelected ? "var(--error-red-light)" : "var(--gray-100)")};
    transform: scale(1.1);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-left: var(--space-3);
    font-size: 1.375rem;
  }
`;



interface RoomMembersComponentProps {
  onClose: () => void;
}

const RoomMembersComponent: React.FC<RoomMembersComponentProps> = ({
  onClose,
}) => {
  const { userInfo } = useUserInfo();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { groupId } = useParams();
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const navigate = useNavigate();

  // Use React Query hook (13.6)
  const { data: roleData } = useUserRole(groupId ? Number(groupId) : undefined);

  // Sync role data to state
  useEffect(() => {
    if (roleData) {
      setUserRole(roleData);
    }
  }, [roleData]);

  // Use React Query hook
  const { data: membersData, isLoading, error: queryError, refetch: refetchMembers } = useGroupMemberList(
    groupId ? Number(groupId) : undefined
  );

  // Sync query data to state
  useEffect(() => {
    if (membersData?.code === 200) {
      setMembers(membersData.data);
    }
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "An unknown error occurred");
    }
    setLoading(isLoading);
  }, [membersData, queryError, isLoading]);

  const removeGroupMemberMutation = useRemoveGroupMember();

  const handleExitGroup = async () => {
    if (!groupId) return;

    try {
      setIsExiting(true);

      if (userRole === "ADMIN" && isRemoveMode) {
        console.log("admin");
        // Remove selected members
        for (const memberId of selectedMembers) {
          await removeGroupMemberMutation.mutateAsync({
            groupId: Number(groupId),
            removeMemberId: memberId,
          });
        }

        // Refresh member list
        await refetchMembers();

        setIsRemoveMode(false);
        setSelectedMembers([]);
      } else {
        // Exit group for self
        await removeGroupMemberMutation.mutateAsync({
          groupId: Number(groupId),
          removeMemberId: userInfo?.userId!,
        });

        navigate("/search-rooms");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
      console.error("Error:", err);
    } finally {
      setIsExiting(false);
      setShowConfirmation(false);
    }
  };

  const toggleMemberSelection = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    } else {
      setSelectedMembers((prev) => [...prev, memberId]);
    }
  };

  const handleActionButton = () => {
    if (userRole === "ADMIN") {
      if (isRemoveMode) {
        if (selectedMembers.length > 0) {
          setShowConfirmation(true);
        } else {
          setIsRemoveMode(false);
        }
      } else {
        setIsRemoveMode(true);
      }
    } else {
      setShowConfirmation(true);
    }
  };

  const getButtonText = () => {
    if (isExiting) return "Processing...";
    if (userRole === "ADMIN") {
      return isRemoveMode ? "Finish" : "Edit";
    }
    return "Exit Group";
  };

  const modalContent = (
    <>
      <Overlay
        onClick={(e) => {
          if (e.target === e.currentTarget && !showConfirmation) {
            onClose();
          }
        }}
      >
        <MembersListContainer>
          <TitleContainer>
            <HeaderSection>
              {/* <MembersLogo /> */}
              <HeaderTitle >Members</HeaderTitle>
            </HeaderSection>
          </TitleContainer>
          <ListContainer>
              {loading ? (
                <LoadingIndicator>Loading members...</LoadingIndicator>
              ) : error ? (
                <div>Error: {error}</div>
              ) : (
                members.map((member) => (
                  <MemberContainer key={member.userId} data-testid="member-item">
                    <MemberInfo>
                      <Avatar
                        src={`data:image/png;base64, ${member.userPortrait}`}
                        alt={member.userName}
                      />
                      <Username>
                        <UserNameText>{member.userName}</UserNameText>
                        {member.groupMemberType === "ADMIN" ? (
                          <AdminLabel data-testid="admin-badge">admin</AdminLabel>
                        ) : (
                          <MemberLabel data-testid="member-badge">member</MemberLabel>
                        )}
                      </Username>
                    </MemberInfo>
                    {isRemoveMode &&
                      userRole === "ADMIN" &&
                      member.groupMemberType !== "ADMIN" && (
                        <RemoveIcon
                          isSelected={selectedMembers.includes(member.userId)}
                          onClick={() => toggleMemberSelection(member.userId)}
                        />
                      )}
                  </MemberContainer>
                ))
              )}
          </ListContainer>
          <BottomContainer>
            
            <LineSeparator />
            <ButtonContainer>
              <Button variant="primary" onClick={handleActionButton} disabled={isExiting}>
                {getButtonText()}
              </Button>
            </ButtonContainer>
            
            <CloseArrow onClick={onClose} />
          </BottomContainer>
        </MembersListContainer>
      </Overlay>

      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleExitGroup}
          title={
            userRole === "ADMIN" && isRemoveMode
              ? "Confirm to Remove Selected Members"
              : "Confirm to Exit Chat Group"
          }
          message="Caution: This action cannot be undone."
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default RoomMembersComponent;
