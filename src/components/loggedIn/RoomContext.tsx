// RoomContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useSidebarRooms, useMainAreaRooms, useTags, useCreateRoom } from "../../hooks/queries/useRoom";
import { useUserInfo } from "../../hooks/queries/useUser";
import axios from "axios";

interface RoomGroup {
  groupId: number;
  groupName: string;
  groupDescription: string;
  groupType: number;
  adminId: number;
  adminName: string;
  memberCount: number;
  isJoined: boolean;
}

export interface Tag {
  tagId: number;
  tagName: string;
}

import type { GetGroupListRequest } from '../../api/room.api';

interface TagListRequest {
  keyword: string;
  pageRequestVO: {
    pageSize: number;
    pageNum: number;
  };
}

interface Pagination {
  pageSize: number;
  pageNum: number;
  pages: number;
  total: number;
}

interface CreateRoomRequest {
  groupName: string;
  groupDescription: string;
  groupType: number;
  password?: string;
  chatBotVOList: ChatBotVO[];
  groupMode: "free" | "feedback";
  chatBotFeedbackVO?: {
    botName: string;
    botPrompt: string;
    msgCountInterval: number;
    timeInterval: number;
  };
}

interface ChatBotVO {
  accessType: number;
  botContext: number;
  botName: string;
  botPrompt: string;
}

interface RoomContextType {
  sidebarRooms: RoomGroup[];
  mainAreaRooms: RoomGroup[];
  tags: Tag[];
  sidebarRoomsPagination: Pagination;
  mainAreaRoomsPagination: Pagination;
  tagsPagination: Pagination;
  addRoom: (createRoomRequest: CreateRoomRequest) => Promise<void>;
  setSidebarRoomListRequest: Dispatch<SetStateAction<GetGroupListRequest>>;
  setMainAreaRoomListRequest: Dispatch<SetStateAction<GetGroupListRequest>>;
  setTagListRequest: Dispatch<SetStateAction<TagListRequest>>;
  refreshTags: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userInfo } = useUserInfo();
  const isLoggedIn = !!userInfo;

  const [sidebarRoomListRequest, setSidebarRoomListRequest] = useState<GetGroupListRequest>({
    keyword: "",
    groupDemonTypeEnum: "JOINEDROOM",
    pageRequestVO: {
      pageSize: 5,
      pageNum: 1,
    },
  });
  const [mainAreaRoomListRequest, setMainAreaRoomListRequest] = useState<GetGroupListRequest>({
    keyword: "",
    groupDemonTypeEnum: "PUBLICROOM",
    pageRequestVO: {
      pageSize: 6,
      pageNum: 1,
    },
  });
  const [tagListRequest, setTagListRequest] = useState<TagListRequest>({
    keyword: "",
    pageRequestVO: {
      pageSize: 8,
      pageNum: 1,
    },
  });

  // Use React Query hooks - only enable when user is logged in
  const { data: sidebarRoomsData } = useSidebarRooms({
    ...sidebarRoomListRequest,
    enabled: isLoggedIn,
  });
  const { data: mainAreaRoomsData } = useMainAreaRooms({
    ...mainAreaRoomListRequest,
    enabled: isLoggedIn,
  });
  const { data: tagsData, refetch: refetchTags } = useTags({
    ...tagListRequest,
    enabled: isLoggedIn,
  });
  const createRoomMutation = useCreateRoom();

  // Extract data and pagination
  const sidebarRooms = sidebarRoomsData?.code === 200 ? sidebarRoomsData.data.data : [];
  const sidebarRoomsPagination = sidebarRoomsData?.code === 200 ? {
    pageSize: sidebarRoomsData.data.pageSize,
    pageNum: sidebarRoomsData.data.pageNum,
    total: sidebarRoomsData.data.total,
    pages: sidebarRoomsData.data.pages,
  } : { pageSize: 5, pageNum: 1, total: 0, pages: 0 };

  const mainAreaRooms = mainAreaRoomsData?.code === 200 ? mainAreaRoomsData.data.data : [];
  const mainAreaRoomsPagination = mainAreaRoomsData?.code === 200 ? {
    pageSize: mainAreaRoomsData.data.pageSize,
    pageNum: mainAreaRoomsData.data.pageNum,
    total: mainAreaRoomsData.data.total,
    pages: mainAreaRoomsData.data.pages,
  } : { pageSize: 6, pageNum: 1, total: 0, pages: 0 };

  const tags = tagsData?.code === 200 ? tagsData.data.data : [];
  const tagsPagination = tagsData?.code === 200 ? {
    pageSize: tagsData.data.pageSize,
    pageNum: tagsData.data.pageNum,
    total: tagsData.data.total,
    pages: tagsData.data.pages,
  } : { pageSize: 7, pageNum: 1, total: 0, pages: 0 };

  const refreshTags = () => {
    setTagListRequest((prev) => ({
      ...prev,
      pageRequestVO: { ...prev.pageRequestVO, pageNum: 1 },
    }));
    refetchTags();
  };

  const addRoom = async (createRoomRequest: CreateRoomRequest) => {
    try {
      const response = await createRoomMutation.mutateAsync(createRoomRequest);
  
      if (response.code === 200 && response.data?.groupId) {
        // Rooms will be refreshed automatically by the mutation's onSuccess
      } else {
        alert(response.message || "Failed to create group.");
        console.error(
          `API returned error code: ${response.code}, message: ${response.message}`
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        alert(
          error.response?.data?.message ||
            "Failed to create group. Please try again."
        );
      } else if (error instanceof Error) {
        console.error("Unexpected error:", error);
        alert(error.message || "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <RoomContext.Provider
      value={{
        sidebarRooms,
        mainAreaRooms,
        tags,
        sidebarRoomsPagination: sidebarRoomsPagination,
        mainAreaRoomsPagination: mainAreaRoomsPagination,
        tagsPagination: tagsPagination,
        addRoom,
        setSidebarRoomListRequest,
        setMainAreaRoomListRequest,
        setTagListRequest,
        refreshTags,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
};
