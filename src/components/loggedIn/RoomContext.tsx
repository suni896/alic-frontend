// RoomContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import apiClient from "../loggedOut/apiClient";

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


interface RoomListRequest {
  keyword: string;
  groupDemonTypeEnum: string;
  pageRequestVO: {
    pageSize: number;
    pageNum: number;
  };
}

interface RoomListResponse {
  code: number;
  message: string;
  data: {
    pageSize: number;
    pageNum: number;
    pages: number;
    total: number;
    data: RoomGroup[];
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
  sidebarRoomsPagination: Pagination;
  // setSidebarRoomsPagination: Dispatch<SetStateAction<RoomListPagination>>;
  mainAreaRoomsPagination: Pagination;
  // setMainAreaRoomsPagination: Dispatch<SetStateAction<RoomListPagination>>;
  addRoom: (createRoomRequest: CreateRoomRequest) => Promise<void>;
  setSidebarRoomListRequest: Dispatch<SetStateAction<RoomListRequest>>;
  setMainAreaRoomListRequest: Dispatch<SetStateAction<RoomListRequest>>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarRooms, setSidebarRooms] = useState<RoomGroup[]>([]);
  const [mainAreaRooms, setMainAreaRooms] = useState<RoomGroup[]>([]);
  const [sidebarRoomsPagination, setSidebarRoomsPagination] =
    useState<Pagination>({
      pageSize: 10,
      pageNum: 1,
      pages: 1,
      total: 0,
    });
  const [mainAreaRoomsPagination, setMainAreaRoomsPagination] =
    useState<Pagination>({
      pageSize: 8,
      pageNum: 1,
      pages: 1,
      total: 0,
    });
  const [sidebarRoomListRequest, setSidebarRoomListRequest] = useState({
    keyword: "",
    groupDemonTypeEnum: "JOINEDROOM",
    pageRequestVO: {
      pageSize: 10,
      pageNum: 1,
    },
  });
  const [mainAreaRoomListRequest, setMainAreaRoomListRequest] = useState({
    keyword: "",
    groupDemonTypeEnum: "PUBLICROOM",
    pageRequestVO: {
      pageSize: 8,
      pageNum: 1,
    },
  });

  useEffect(() => {
    fetchSidebarRooms();
  }, [sidebarRoomListRequest]);

  useEffect(() => {
    fetchMainAreaRooms();
  }, [mainAreaRoomListRequest]);

  const fetchSidebarRooms = async () => {
    const response = await apiClient.post<RoomListResponse>(
      "/v1/group/get_group_list",
      sidebarRoomListRequest
    );

    if (response.data.code === 200) {
      const rooms = response.data.data.data;
      setSidebarRooms(rooms);
      setSidebarRoomsPagination({
        pageSize: response.data.data.pageSize,
        pageNum: response.data.data.pageNum,
        total: response.data.data.total,
        pages: response.data.data.pages,
      });
    } else {
      console.error(
        `API returned error code: ${response.data.code}, message: ${response.data.message}`
      );
    }
  };

  const fetchMainAreaRooms = async () => {
    const response = await apiClient.post<RoomListResponse>(
      "/v1/group/get_group_list",
      mainAreaRoomListRequest
    );

    if (response.data.code === 200) {
      const rooms = response.data.data.data;
      setMainAreaRooms(rooms);
      setMainAreaRoomsPagination({
        pageSize: response.data.data.pageSize,
        pageNum: response.data.data.pageNum,
        total: response.data.data.total,
        pages: response.data.data.pages,
      });
    } else {
      console.error(
        `API returned error code: ${response.data.code}, message: ${response.data.message}`
      );
    }
  };

  const addRoom = async (createRoomRequest: CreateRoomRequest) => {
    const response = await apiClient.post(
      "/v1/group/create_new_group",
      createRoomRequest
    );

    if (response.data.code === 200 && response.data.data?.groupId) {
      fetchSidebarRooms();
      fetchMainAreaRooms();
    } else {
      console.error(
        `API returned error code: ${response.data.code}, message: ${response.data.message}`
      );
    }
  };

  return (
    <RoomContext.Provider
      value={{
        sidebarRooms,
        mainAreaRooms,
        sidebarRoomsPagination: sidebarRoomsPagination,
        mainAreaRoomsPagination: mainAreaRoomsPagination,
        addRoom,
        setSidebarRoomListRequest,
        setMainAreaRoomListRequest,
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
