import React, { useState, ChangeEvent } from "react";
import styled from "styled-components";
import apiClient from "../loggedOut/apiClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border: 1px solid #016532;
  border-radius: 8px;
  padding: 2vh 2%;
  width: 20%;
  position: relative;

  @media (max-width: 1000px) {
    width: 35%;
  }
  @media (max-width: 700px) {
    width: 50%;
  }
  @media (max-width: 500px) {
    width: 65%;
  }
  @media (max-width: 400px) {
    width: 75%;
  }
`;

const ModalTitle = styled.label`
  font-family: Roboto;
  font-weight: 400;
`;

interface ModalInputProps {
  hasError?: boolean;
}

const ModalInput = styled.input<ModalInputProps>`
  margin-top: 1vh;
  margin-bottom: ${(props) => (props.hasError ? "0.5vh" : "3vh")};
  width: 85%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid ${(props) => (props.hasError ? "#ff0000" : "#016532")};
  border-radius: 8px;
  color: #333;
  background-color: white;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  font-size: 0.8rem;
  margin-bottom: 1.5vh;
  width: 85%;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1vh;
  gap: 5%;

  @media (max-width: 700px) {
    gap: 2%;
    font-size: 0.9rem;
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: black;
`;

const CreateButton = styled.button``;

interface CreateNewTagProps {
  onClose: () => void;
}

const CreateNewTag: React.FC<CreateNewTagProps> = ({ onClose }) => {
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateTag = async () => {
    if (!tagName.match(/^[A-Za-z0-9]{1,20}$/)) {
      setError(
        "Tag name must contain only letters and numbers, and be 1-20 characters"
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    const requestData = {
      tagName: tagName,
    };

    try {
      const response = await apiClient.post("/v1/tag/add_tag", requestData);

      console.log("API Response:", response.data);

      if (response.data.code === 200) {
        console.log(
          "Tag created successfully with ID:",
          response.data.data.tagId
        );
        alert(`Tag "${tagName}" created successfully!`);
        navigate(`/my-class/${response.data.data.tagId.toString()}`);
        onClose();
      } else {
        console.error("API returned error:", response.data);
        setError(`Failed to create tag: ${response.data.message}`);
        alert(`Error: ${response.data.message}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error creating tag:",
          error.response?.data || error.message
        );
        setError(
          error.response?.data?.message ||
            `Error (${error.response?.status}): Failed to create tag.`
        );
        alert(
          `Error: ${error.response?.data?.message || "Failed to create tag"}`
        );
      } else {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred. Please try again.");
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value);
    if (error) setError("");
  };

  return (
    <Overlay>
      <Modal>
        <ModalTitle>Tag Name</ModalTitle>
        <ModalInput
          type="text"
          placeholder="CLASS D"
          value={tagName}
          onChange={handleInputChange}
          hasError={!!error}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <ButtonContainer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <CreateButton onClick={handleCreateTag} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </CreateButton>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default CreateNewTag;
