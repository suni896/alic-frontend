import React from "react";
import styled from "styled-components";

interface LeftSectionProps {
  currentImage: string;
  currentIndex: number; // Include currentIndex
  images: string[]; // Include images array
}

const LeftSectionContainer = styled.div<{ currentImage: string }>`
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
    background-image: url(${(props) => props.currentImage});
    background-size: cover;
    background-position: center;
    opacity: 0.75;
    z-index: 1;
  }

  @media (max-width: 740px) {
    display: none;
  }
`;

const LeftTitle = styled.h1`
  position: absolute;
  top: 35px;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  color: black;
  font-size: 1.5rem;
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 500;
  font-style: italic;
  z-index: 2;

  @media (max-width: 740px) {
    font-size: 1.2rem;
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

const Dot = styled.div<{ active: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${(props) => (props.active ? "#016532" : "white")};
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
  const title = "Join our community today for collaborative learning!";

  return (
    <LeftSectionContainer currentImage={currentImage}>
      <LeftTitle>{title}</LeftTitle>
      <DotsContainer>
        {images.map((_, index: number) => (
          <Dot key={index} active={index === currentIndex} />
        ))}
      </DotsContainer>
    </LeftSectionContainer>
  );
};

export default LeftSection;
