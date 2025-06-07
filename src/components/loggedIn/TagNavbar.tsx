import { useState, useEffect } from "react";
import { MdOutlineArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import apiClient from "../loggedOut/apiClient";

interface TagData {
  tagId: number;
  tagName: string;
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
  const [tagData, setTagData] = useState<TagData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTagData = async () => {
      if (tagId) {
        try {
          console.log("Fetching tag for tagId:", tagId);
          const response = await apiClient.get(
            `/v1/tag/get_tag_info?tagId=${tagId}`
          );
          console.log("API Response:", response.data);
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
