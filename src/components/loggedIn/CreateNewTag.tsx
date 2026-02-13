import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiTag } from "react-icons/fi";
import apiClient from "../loggedOut/apiClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../button";
import LabeledInputWithCount from "../Input";
import ModalHeader from "../Header";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  position: absolute;
  top: 70px;
  background: white;
  border: none;
  border-radius: 16px;
  padding: 2.5rem;
  width: 28%;
  max-width: 480px;
  min-width: 320px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 1200px) {
    width: 35%;
  }
  @media (max-width: 1000px) {
    width: 45%;
  }
  @media (max-width: 700px) {
    width: 55%;
    padding: 2rem;
  }
  @media (max-width: 500px) {
    width: 70%;
    padding: 1.5rem;
  }
  @media (max-width: 400px) {
    width: 85%;
    padding: 1.25rem;
  }
`;

const TagIcon = styled(FiTag)`
  color: #white;
  font-size: 1.5rem;
`;

const InputContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const InputLabel = styled.label`
  display: block;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--slate-grey);
  margin-bottom: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  justify-content: center;
  height: 40px;
  
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;


const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface CreateNewTagProps {
  onClose: () => void;
  onTagCreated?: () => void;
}

const CreateNewTag: React.FC<CreateNewTagProps> = ({
  onClose,
  onTagCreated,
}) => {
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Add useRef to reference the modal container
  const modalRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      setError("Tag name is required");
      return;
    }

    if (!tagName.match(/^[A-Za-z0-9\s]{1,20}$/)) {
      setError("Tag name must contain only letters, numbers, and spaces (1-20 characters)");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const requestData = {
      tagName: tagName.trim(),
    };

    try {
      const response = await apiClient.post("/v1/tag/add_tag", requestData);

      console.log("API Response:", response.data);

      if (response.data.code === 200) {
        console.log(
          "Tag created successfully with ID:",
          response.data.data.tagId
        );
        navigate(`/my-class/${response.data.data.tagId.toString()}`);
        onClose();
        if (onTagCreated) {
          onTagCreated();
        }
      } else {
        console.error("API returned error:", response.data);
        setError(`Failed to create tag: ${response.data.message}`);
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
      } else {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTagName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleCreateTag();
    }
  };

  return (
    <Overlay>
      <Modal ref={modalRef}>
        <ModalHeader icon={TagIcon} title="Create New Tag" onClose={onClose} />
        <InputContainer>
          <InputLabel>Tag Name</InputLabel>
          <LabeledInputWithCount
            value={tagName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            error={error}
            maxLength={20}
            placeholder="Enter tag name"
            type="text"
            disabled={isSubmitting}
          />
        </InputContainer>

        <ButtonContainer>
          <Button variant="cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateTag} disabled={isSubmitting || !tagName.trim()}>
            {isSubmitting && <LoadingSpinner />}
            {isSubmitting ? "Creating..." : "Create Tag"}
          </Button>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default CreateNewTag;
