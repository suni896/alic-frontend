import React from "react";
import styled from "styled-components";
import LeftSection from "./LeftSection";
import image1 from "../../assets/collaborativeLearning-1.png";
import image2 from "../../assets/collaborativeLearning-2.png";
import image3 from "../../assets/collaborativeLearning-3.png";
import { useEffect } from "react";
import { useState } from "react";

const images = [image1, image2, image3];

const Container = styled.div`
  display: flex;
  height: 92vh;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  margin-top: 8vh;
  background: white;
`;

const Wrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 90vw;
  height: 70vh;
  max-width: 1300px;
  background: white;
  border: 1px solid #016532;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 740px) and (min-height: 720px) {
    height: 63vh;
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0.5rem 2rem;
`;

const ContainerLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

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

export default ContainerLayout;
