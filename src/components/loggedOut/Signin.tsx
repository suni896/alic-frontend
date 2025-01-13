import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
`;

const Wrapper = styled.div`
  display: flex;
  width: 90%;
  max-width: 1300px;
  background: white;
  overflow: hidden;
`;

const Signin = () => {
  return (
    <Container>
      <Wrapper></Wrapper>
    </Container>
  );
};

export default Signin;
