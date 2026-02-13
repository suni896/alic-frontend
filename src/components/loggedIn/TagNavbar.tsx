import { useState, useEffect } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
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
  margin-left: 16rem;
  width: calc(100vw - 16rem);
  height: 5rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-left: 1px solid var(--color-line); /* 左侧灰色边框 */
  border-bottom: 1px solid var(--color-line);
  box-sizing: border-box;
`;

const BackArrow = styled(MdKeyboardArrowLeft)`
  color: var(--black);
  font-size: 2rem;
  margin-right: 1rem;
  cursor: pointer;
`;


const Title = styled.h1`
  color: var(--black);
  font-size: 1.3rem;
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
