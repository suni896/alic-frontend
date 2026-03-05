import React from "react";
import styled from "styled-components";
import LeftSection from "./LeftSection";
import coverImage from "../../assets/banner.png";

import { useEffect } from "react";
import { useState } from "react";

const images = [coverImage];

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
  overflow: hidden;
`;

const Wrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: var(--color-card);
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 90vw;
    height: 85vh;
    border-radius: var(--radius-12);
    box-shadow: var(--shadow-soft);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 90vw;
    height: 85vh;
    border-radius: var(--radius-12);
    box-shadow: var(--shadow-soft);
  }
`;

// Styled Component: RightSection
const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    flex: 0.8;
    width: 30%;
    align-items: center;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    flex: 0.8;
    width: 30%;
    align-items: center;
  }
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 90%;
  min-height: 100%;
  box-sizing: border-box;
  padding: var(--space-4) var(--space-4);
  gap: var(--space-3);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 85%;
    padding: var(--space-6) var(--space-8);
    gap: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 85%;
    padding: var(--space-7) var(--space-12);
    gap: var(--space-5);
  }
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
        <RightSection>
          <RightContent>{children}</RightContent>
        </RightSection>
      </Wrapper>
    </Container>
  );
};

export default ContainerLayout;
