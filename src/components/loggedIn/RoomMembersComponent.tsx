import React, { useEffect, useState } from "react";
import { MdOutlineKeyboardDoubleArrowRight, MdPeopleAlt } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";
import apiClient from "../loggedOut/apiClient";
import { useUser } from "./UserContext";
import { RxCross2 } from "react-icons/rx";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { fetchUserRole } from "./fetchUserRole";

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
  background-color: #016532;
`;

const MembersLogo = styled(MdPeopleAlt)`
  color: white;
  font-size: clamp(1.5rem, 5vw, 2rem);
  margin-left: 1rem;
  @media (max-width: 1000px) {
    margin-left: 2%;
  }
`;

const Title = styled.p`
  color: white;
  font-size: 1.2rem;
  margin-left: 5%;

  @media (max-width: 1000px) {
    font-size: 1rem;
  }
  @media (max-width: 500px) {
    font-size: 0.9rem;
  }
`;

const BottomContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ListContainer = styled.div`
  width: 90%;
  height: auto;
  max-height: 40%;
  margin-top: 3vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2vh;
  overflow-y: auto;
`;

const LineSeparator = styled.hr`
  margin: 2vh;
  width: 90%;
`;

const ExitGroupButton = styled.button`
  border: 1px solid #b2beb5;
  border-radius: 6px;
  background-color: white;
  color: #fc5600;
  margin-top: 1vh;
  @media (max-width: 1000px) {
    width: 85%;
    font-size: 0.8rem;
  }
`;

const CloseArrow = styled(MdOutlineKeyboardDoubleArrowRight)`
  font-size: 2.5rem;
  position: fixed;
  bottom: 4vh;
`;

const MemberContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  margin-right: 0;
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
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;

  @media (max-width: 1000px) {
    width: 30px;
    height: 30px;
  }
  @media (max-width: 700px) {
    margin-right: 5px;
  }
  @media (max-width: 400px) {
    width: 23px;
    height: 23px;
  }
`;

const Username = styled.p`
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const AdminLabel = styled.span`
  color: red;
  margin-left: 5px;

  @media (max-width: 600px) {
    display: block;
    margin-left: 0;
  }
`;

const MemberLabel = styled.span`
  margin-left: 5px;
`;

const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
`;

const ConfirmationContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 30%;
  min-width: 400px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  @media (max-width: 420px) {
    width: 60%;
    min-width: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;

  &:hover {
    opacity: 0.7;
  }
`;

const ConfirmTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: black;
  text-align: left;
  margin-bottom: 0;

  @media (max-width: 420px) {
    font-size: 1rem;
  }
`;

const ConfirmMessage = styled.p`
  font-size: 1rem;
  color: #666;
  margin-top: 0.2vh;
  margin-bottom: 5vh;
  text-align: left;

  @media (max-width: 420px) {
    font-size: 0.8rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ConfirmButton = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;

  ${({ variant }) =>
    variant === "primary"
      ? `
    background-color: #dc3545;
    color: white;
    &:hover {
      background-color: #c82333;
    }
    `
      : `
    background-color: #e9ecef;
    color: #333;
    &:hover {
      background-color: #dee2e6;
    }
    `}
`;

const X = styled(RxCross2)`
  color: black;
`;

const RemoveIcon = styled(AiOutlineMinusCircle)<{ isSelected: boolean }>`
  margin-left: 8px;
  cursor: pointer;
  font-size: 20px;
  color: ${(props) => (props.isSelected ? "#FC5600" : "#666")};
  transition: color 0.2s ease;

  &:hover {
    color: ${(props) => (props.isSelected ? "#FC5600" : "#999")};
  }

  @media (max-width: 1100px) {
    margin-left: 0;
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
                        {member.userName}
                        {member.groupMemberType === "ADMIN" ? (
                          <AdminLabel>(ADMIN)</AdminLabel>
                        ) : (
                          <MemberLabel>(member)</MemberLabel>
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
            <ExitGroupButton onClick={handleActionButton} disabled={isExiting}>
              {getButtonText()}
            </ExitGroupButton>
            <CloseArrow onClick={onClose} />
          </BottomContainer>
        </MembersListContainer>
      </Overlay>

      {showConfirmation && (
        <ConfirmationOverlay
          onClick={() => setShowConfirmation(false)}
          style={{ zIndex: 3000 }}
        >
          <ConfirmationContainer onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowConfirmation(false)}>
              <X size={20} />
            </CloseButton>

            <ConfirmTitle>
              {userRole === "ADMIN" && isRemoveMode
                ? "Confirm to remove selected members"
                : "Confirm to exit chat group"}
            </ConfirmTitle>
            <ConfirmMessage>Caution: cannot be withdrawn</ConfirmMessage>

            <ButtonContainer>
              <ConfirmButton
                variant="secondary"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </ConfirmButton>
              <ConfirmButton variant="primary" onClick={handleExitGroup}>
                Yes
              </ConfirmButton>
            </ButtonContainer>
          </ConfirmationContainer>
        </ConfirmationOverlay>
      )}
    </>
  );
};

export default RoomMembersComponent;
