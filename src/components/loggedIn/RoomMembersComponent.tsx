import React, { useEffect, useState } from "react";
import { MdOutlineKeyboardDoubleArrowRight, MdPeopleAlt } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { fetchUserRole } from "./fetchUserRole";
import Button from "../button";
import ConfirmationModal from "../ConfirmationModal";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 2000;
`;

const MembersListContainer = styled.div`
  height: 100%;
  width: 20%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1000px) {
    width: 22%;
  }
  @media (max-width: 800px) {
    width: 25%;
  }
  @media (max-width: 700px) {
    width: 35%;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 10%;
  background: linear-gradient(135deg, #016532 0%, #014a24 100%);
  box-shadow: 0 2px 10px rgba(1, 101, 50, 0.3);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  }
`;

const MembersLogo = styled(MdPeopleAlt)`
  color: white;
  font-size: clamp(1.5rem, 5vw, 2rem);
  margin-left: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  
  @media (max-width: 1000px) {
    margin-left: 2%;
  }
`;

const Title = styled.p`
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-left: 5%;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  letter-spacing: 0.5px;

  @media (max-width: 1000px) {
    font-size: 1rem;
  }
  @media (max-width: 500px) {
    font-size: 0.9rem;
  }
`;

const BottomContainer = styled.div`
  width: 100%;
  height: 90%;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const ListContainer = styled.div`
  width: 95%;
  height: auto;
  max-height: 70%;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding: 0 0.5rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
`;

const LineSeparator = styled.hr`
  margin: 1.5rem 0;
  width: 90%;
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
`;


const CloseArrow = styled(MdOutlineKeyboardDoubleArrowRight)`
  font-size: 1.5rem;
  position: fixed;
  bottom: 4vh;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #374151;
    transform: translateX(4px);
  }
`;

const MemberContainer = styled.div`
  display: flex;
  width: 90%;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border-color: #016532;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 101, 50, 0.1);
  }
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 900px) {
    font-size: 0.8rem;
  }
  @media (max-width: 700px) {
    font-size: 0.7rem;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
  color: #6b7280;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #016532;
    transform: scale(1.05);
  }

  @media (max-width: 1000px) {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
  @media (max-width: 700px) {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
  @media (max-width: 400px) {
    width: 28px;
    height: 28px;
    margin-right: 6px;
  }
`;

const Username = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
`;

const UserNameText = styled.p`
  margin: 0;
  font-weight: 600;
  color: #1a202c;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  @media (max-width: 900px) {
    font-size: 0.8rem;
  }
  @media (max-width: 700px) {
    font-size: 0.75rem;
  }
`;

const AdminLabel = styled.span`
  color: #dc2626;
  font-size: 0.7rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  border: 1px solid #fca5a5;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MemberLabel = styled.span`
  color: #6b7280;
  font-size: 0.7rem;
  font-weight: 500;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const RemoveIcon = styled(AiOutlineMinusCircle)<{ isSelected: boolean }>`
  margin-left: 8px;
  cursor: pointer;
  font-size: 22px;
  color: ${(props) => (props.isSelected ? "#dc2626" : "#9ca3af")};
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    color: ${(props) => (props.isSelected ? "#b91c1c" : "#6b7280")};
    background-color: ${(props) => (props.isSelected ? "#fee2e2" : "#f3f4f6")};
    transform: scale(1.1);
  }

  @media (max-width: 1100px) {
    margin-left: 4px;
    font-size: 20px;
  }
`;

export const membersCache = new Map<number, GroupMember[]>();

export interface GroupMember {
  userId: number;
  userEmail: string;
  userName: string;
  userPortrait: string;
  groupMemberType: "ADMIN" | "MEMBER";
  selected?: boolean;
}

interface RoomMembersComponentProps {
  onClose: () => void;
}

const RoomMembersComponent: React.FC<RoomMembersComponentProps> = ({
  onClose,
}) => {
  const { userInfo } = useUser();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { groupId } = useParams();
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"ADMIN" | "MEMBER" | null>(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      if (groupId) {
        const role = await fetchUserRole(Number(groupId));
        setUserRole(role);
        console.log(role);
      }
    };
    initialize();
  }, [groupId]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      const cachedMembers = membersCache.get(Number(groupId));
      console.log("fetched members", groupId, cachedMembers);
      if (cachedMembers) {
        setMembers(cachedMembers);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/v1/group/get_group_member_list?groupId=${groupId}`
        );

        console.log("get_group_member_list response", response);
        if (response.data.code === 200) {
          const fetchedMembers = response.data.data;
          setMembers(fetchedMembers);
          membersCache.set(Number(groupId), fetchedMembers); // Cache the result
          console.log("fetched members", groupId, fetchedMembers);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch group members"
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching group members: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupMembers();
  }, [groupId]);

  const handleExitGroup = async () => {
    if (!groupId) return;

    try {
      setIsExiting(true);

      if (userRole === "ADMIN" && isRemoveMode) {
        console.log("admin");
        // Remove selected members
        for (const memberId of selectedMembers) {
          await apiClient.post("/v1/group/remove_group_member", {
            groupId: Number(groupId),
            removeMemberId: memberId,
          });
        }

        // Refresh member list
        const response = await apiClient.get(
          `/v1/group/get_group_member_list?groupId=${groupId}`
        );
        if (response.data.code === 200) {
          setMembers(response.data.data);
          membersCache.delete(Number(groupId));
        }

        setIsRemoveMode(false);
        setSelectedMembers([]);
      } else {
        // Exit group for self
        const response = await apiClient.post("/v1/group/remove_group_member", {
          groupId: Number(groupId),
          removeMemberId: userInfo?.userId,
        });

        if (response.data.code === 200) {
          membersCache.delete(Number(groupId));
          navigate("/search-rooms");
        }
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
      return isRemoveMode ? "Finish" : "Remove Members";
    }
    return "Exit Group";
  };

  return (
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
            <MembersLogo />
            <Title>Group Members</Title>
          </TitleContainer>
          <BottomContainer>
            <ListContainer>
              {loading ? (
                <LoadingIndicator>Loading members...</LoadingIndicator>
              ) : error ? (
                <div>Error: {error}</div>
              ) : (
                members.map((member) => (
                  <MemberContainer key={member.userId}>
                    <MemberInfo>
                      <Avatar
                        src={`data:image/png;base64, ${member.userPortrait}`}
                        alt={member.userName}
                      />
                      <Username>
                        <UserNameText>{member.userName}</UserNameText>
                        {member.groupMemberType === "ADMIN" ? (
                          <AdminLabel>admin</AdminLabel>
                        ) : (
                          <MemberLabel>member</MemberLabel>
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
              ? "Confirm to remove selected members"
              : "Confirm to exit chat group"
          }
          message="Caution: cannot be withdrawn"
        />
      )}
    </>
  );
};

export default RoomMembersComponent;
