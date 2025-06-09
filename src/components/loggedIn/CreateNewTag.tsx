import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import styled from "styled-components";
import { RxCross2 } from "react-icons/rx";
import { FiTag } from "react-icons/fi";
import apiClient from "../loggedOut/apiClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  background: white;
  border: none;
  border-radius: 20px;
  padding: 2.5rem;
  width: 28%;
  max-width: 480px;
  min-width: 320px;
  position: relative;
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

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  outline: none;

  &:hover {
    opacity: 0.7;
  }
  &:focus {
    outline: none;
  }
`;

const StyledCross = styled(RxCross2)`
  font-size: 1.25rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const TagIcon = styled(FiTag)`
  color: #016532;
  font-size: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-family: 'Roboto', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
  
  @media (max-width: 500px) {
    font-size: 1.25rem;
  }
`;

const InputContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const InputLabel = styled.label`
  display: block;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
`;

interface ModalInputProps {
  hasError?: boolean;
}

const ModalInput = styled.input<ModalInputProps>`
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  border: 2px solid ${(props) => (props.hasError ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#ef4444" : "#016532")};
    background-color: white;
    box-shadow: 0 0 0 3px ${(props) => 
      props.hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 500px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  font-family: 'Roboto', sans-serif;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: "⚠";
    font-size: 0.75rem;
  }
`;

const CharacterCount = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
  font-family: 'Roboto', sans-serif;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const BaseButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 500px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
`;

const CancelButton = styled(BaseButton)`
  background-color: #f8fafc;
  color: #374151;
  border-color: #e5e7eb;

  &:hover:not(:disabled) {
    background-color: #f1f5f9;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CreateButton = styled(BaseButton)`
  background-color: #016532;
  color: white;
  border-color: #016532;

  &:hover:not(:disabled) {
    background-color: #014a24;
    border-color: #014a24;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 101, 50, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value);
    if (error) setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleCreateTag();
    }
  };

  return (
    <Overlay>
      <Modal ref={modalRef}>
        <CloseButton onClick={onClose} disabled={isSubmitting}>
          <StyledCross />
        </CloseButton>
        
        <Header>
          <TagIcon />
          <ModalTitle>Create New Tag</ModalTitle>
        </Header>

        <InputContainer>
          <InputLabel>Tag Name</InputLabel>
          <ModalInput
            type="text"
            placeholder="Enter tag name (e.g., CLASS D)"
            value={tagName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            hasError={!!error}
            maxLength={20}
            disabled={isSubmitting}
          />
          <CharacterCount>{tagName.length}/20</CharacterCount>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputContainer>

        <ButtonContainer>
          <CancelButton onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <CreateButton onClick={handleCreateTag} disabled={isSubmitting || !tagName.trim()}>
            {isSubmitting && <LoadingSpinner />}
            {isSubmitting ? "Creating..." : "Create Tag"}
          </CreateButton>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default CreateNewTag;
