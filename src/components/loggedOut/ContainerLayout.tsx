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
  overflow-y: auto;
`;

const Wrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 90vw;
  height: 85vh;
  background: var(--color-card);
  border-radius: var(--radius-12);
  box-shadow: var(--shadow-soft);
`;

// Styled Component: RightSection
const RightSection = styled.div`
  flex: 0.8;
  display: flex;
  justify-content: center;      /* 子内容居中 */
  align-items: center;          /* 垂直居中 */
  box-sizing: border-box;
  width: 30%;
  height: 100%;
  padding: 0;                   /* 边距由嵌套容器提供 */
  overflow-y: auto;
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;      /* 容器内元素左对齐 */
  width: 85%;
  min-height: 100%;
  box-sizing: border-box;
  padding: var(--space-7) var(--space-12);           /* 统一内边距，形成边距效果 */
  gap: var(--space-5);                    /* 元素间垂直间距 */
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
