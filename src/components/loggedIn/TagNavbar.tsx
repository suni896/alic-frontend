import { useState, useEffect } from "react";
import { MdOutlineArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import apiClient from "../loggedOut/apiClient";

interface TagInfoGroup {
  groupId: number;
  groupName: string;
  groupAdmin: number;
  groupDescription: string;
}

interface TagGroups {
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
  data: TagInfoGroup[];
}

interface TagInfoData {
  tagId: number;
  tagName: string;
  tagGroups: TagGroups;
}

interface TagInfoResponse {
  code: number;
  message: string;
  data: TagInfoData;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 72px;
  background-color: #016532;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
`;

const BackArrow = styled(MdOutlineArrowBack)`
  color: white;
  font-size: 2rem;
  margin-right: 1rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  margin: 0;
  margin-right: 1rem;

  @media (max-width: 740px) {
    font-size: 0.9rem;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 2%;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 2%;
  gap: 1rem;

  @media (max-width: 500px) {
    gap: 0.4rem;
  }
`;

interface TagNavbarProps {
  tagId?: number;
}

const TagNavbar: React.FC<TagNavbarProps> = ({ tagId }) => {
  const [tagData, setTagData] = useState<TagInfoData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTagData = async () => {
      if (tagId) {
        const requestData = {
          tagId: tagId,
          pageRequestVO: {
            pageNum: 1,
            pageSize: 1,
          },
        };

        try {
          const response = await apiClient.post<TagInfoResponse>(
            "/v1/tag/get_tag_info",
            requestData
          );
          if (response.data.code === 200) {
            console.log("Tags data:", response.data.data);
            setTagData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching tag data:", error);
        }
      } else {
        console.log("No groupId provided");
      }
    };

    fetchTagData();
  }, [tagId]);

  return (
    <Container>
      <TitleContainer>
        <BackArrow onClick={() => navigate("/search-rooms")} />
        <Title>{tagData?.tagName}</Title>
      </TitleContainer>
      <RightContainer />
    </Container>
  );
};

export default TagNavbar;
