import React from "react";
import styled from "styled-components";
import LeftSection from "./LeftSection";
import coverImage from "../../assets/cover.png";

import { useEffect } from "react";
import { useState } from "react";

const images = [coverImage];

const Container = styled.div`
  display: flex;
  height: calc(100vh - 7vh);
  width: 100vw;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  background: white;
  overflow-y: scroll;
`;

const Wrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 90vw;
  height: 75vh;
  max-width: 1300px;
  background: white;
  border: 1px solid #016532;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 740px) {
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
  overflow-y: auto;
  
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
