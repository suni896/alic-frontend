import React from "react";
import styled from "styled-components";
import LeftSection from "./LeftSection";
import image1 from "../../assets/collaborativeLearning-1.png";
import image2 from "../../assets/collaborativeLearning-2.png";
import image3 from "../../assets/collaborativeLearning-3.png";

const images = [image1, image2, image3];

interface LayoutProps {
  children: React.ReactNode;
  currentIndex?: number;
}

const ContainerLayout: React.FC<LayoutProps> = ({
  children,
  currentIndex = 0,
}) => {
  return (
    <Container>
      <Wrapper>
        <LeftSection
          currentImage={images[currentIndex]}
          currentIndex={currentIndex}
          images={images || []}
        />
        <RightSection>{children}</RightSection>
      </Wrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: white;
  margin-top: 30px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  width: 90%;
  height: 70%;
  max-width: 1300px;
  background: white;
  overflow: hidden;
  border: 1px solid #016532;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0.5rem 2rem;
`;

export default ContainerLayout;
