import { useState, useEffect } from "react";
import styled from "styled-components";
import image1 from "../../assets/collaborativeLearning-1.png";
import image2 from "../../assets/collaborativeLearning-2.png";
import image3 from "../../assets/collaborativeLearning-3.png";
import LeftSection from "./LeftSection"; // Adjust the path as necessary

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
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 70%;
  max-width: 1300px;
  background: white;
  overflow: hidden;
  border: 1px solid #016532;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Drop shadow */
`;

const images = [image1, image2, image3];

const RightSection = styled.div`
  flex: 1;
`;

const Signin = () => {
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
          images={images}
        />
        <RightSection></RightSection>
      </Wrapper>
    </Container>
  );
};

export default Signin;
