import { useState, useCallback } from "react";
import apiClient from "../loggedOut/apiClient"; // 调整路径
import { useUser } from "./UserContext";

interface JoinGroupResponse {
  code: number;
  message: string;
}

export interface RoomGroup {
  groupId: number;
  groupName: string;
  groupDescription: string;
  groupType: number;
  adminId: number;
  adminName: string;
  memberCount: number;
  isJoined: boolean;
}

export function useJoinRoom() {
  const { userInfo } = useUser();

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const joinGroup = useCallback(
    async (groupId: number, password?: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await apiClient.post<JoinGroupResponse>(
          "/v1/group/add_group_member",
          {
            groupId,
            joinMemberID: userInfo?.userId,
            password: password || undefined,
          }
        );

        if (response.data.code === 200 || response.data.code === 1009) {
          setJoinSuccess(true);
          setErrorMessage("Successfully joined group");
          setShowErrorModal(true);
          setRedirectPath(`/my-room/${groupId}`);
          return true; // 返回成功状态
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to join group");
        setShowErrorModal(true);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [userInfo?.userId]
  );

  const handleJoinClick = useCallback(
    (groupId: number, groupType: number, isJoined?: boolean) => {
      setSelectedRoomId(groupId);
      setPassword("");
      console.log("isJoined", isJoined);
      // 如果用户已经加入群组，直接跳转
      if (isJoined) {
        console.log("Already joined this group");
        setJoinSuccess(true);
        setErrorMessage("Already joined this group");
        setShowErrorModal(true);
        setRedirectPath(`/my-room/${groupId}`);
        return;
      }

      // 如果是私有群组，显示密码输入框
      if (groupType === 0) {
        setShowPasswordModal(true);
      } else {
        // 公开群组，直接加入
        joinGroup(groupId);
      }
    },
    [joinGroup]
  );

  const handlePasswordSubmit = useCallback(() => {
    if (!password.trim()) {
      setErrorMessage("Password is required");
      setShowErrorModal(true);
      return;
    }
    
    if (selectedRoomId !== null) {
      joinGroup(selectedRoomId, password);
      setShowPasswordModal(false);
      setPassword("");
    }
  }, [selectedRoomId, password, joinGroup]);

  return {
    handleJoinClick,
    handlePasswordSubmit,
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
    isProcessing,
    isPasswordEmpty: !password.trim(),
  };
}
