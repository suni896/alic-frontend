import { useState, useCallback } from "react";
import { useJoinGroup } from "../../hooks/queries/useGroup";
import { useUserInfo } from "../../hooks/queries/useUser";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { userInfo } = useUserInfo();
  const joinGroupMutation = useJoinGroup();

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const joinGroup = useCallback(
    async (groupId: number, password?: string): Promise<boolean> => {
      try {
        const response = await joinGroupMutation.mutateAsync({
          groupId,
          joinMemberID: userInfo?.userId,
          password: password || undefined,
        });

        if (response.code === 200 || response.code === 1009) {
          setJoinSuccess(true);
          setRedirectPath(`/my-room/${groupId}`);
          return true;
        } else {
          alert(response.message || t('joinRooms.failedToJoinGroup'));
          return false;
        }
      } catch (error: any) {
        alert(error.message || t('joinRooms.failedToJoinGroup'));
        return false;
      }
    },
    [userInfo?.userId, joinGroupMutation, t]
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
      alert(t('joinRooms.passwordRequiredJoin'));
      return;
    }

    if (selectedRoomId !== null) {
      joinGroup(selectedRoomId, password);
      setShowPasswordModal(false);
      setPassword("");
    }
  }, [selectedRoomId, password, joinGroup, t]);

  return {
    handleJoinClick,
    handlePasswordSubmit,
    showPasswordModal,
    setShowPasswordModal,
    password,
    setPassword,
    joinSuccess,
    redirectPath,
    setRedirectPath,
    isProcessing: joinGroupMutation.isPending,
    isPasswordEmpty: !password.trim(),
  };
}
