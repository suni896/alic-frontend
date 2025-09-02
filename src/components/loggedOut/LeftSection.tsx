import React from "react";
import styled from "styled-components";

interface LeftSectionProps {
  currentImage: string;
  currentIndex: number; // Include currentIndex
  images: string[]; // Include images array
}

const LeftSectionContainer = styled.div<{ $currentImage: string }>`
  flex: 1.15;
  height: 100%;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${(props) => props.$currentImage});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: top center; /* ⬆️ 垂直顶部 + 水平居中 */
    opacity: 0.75;
    z-index: 1;
  }

  @media (max-width: 740px) {
    display: none;
    flex: 0;
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  z-index: 2;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${(props) => (props.$active ? "#016532" : "white")};
  margin: 0 5px;

  @media (max-width: 740px) {
    width: 8px;
    height: 8px;
  }
`;

const LeftSection: React.FC<LeftSectionProps> = ({
  currentImage,
  currentIndex,
  images,
}) => {
  return (
    <LeftSectionContainer $currentImage={currentImage}>
      <DotsContainer>
        {images.map((_, index: number) => (
          <Dot key={index} $active={index === currentIndex} />
        ))}
      </DotsContainer>
    </LeftSectionContainer>
  );
};

export default LeftSection;
