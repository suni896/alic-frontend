import apiClient from "../loggedOut/apiClient";

export const fetchUserRole = async (groupId: number) => {
  try {
    const response = await apiClient.get(
      `/v1/group/get_role_in_group?groupId=${groupId}`
    );
    if (response.data.code === 200) {
      return response.data.data as "ADMIN" | "MEMBER";
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
