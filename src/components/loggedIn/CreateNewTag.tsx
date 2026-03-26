import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useCreateTag } from "../../hooks/queries/useTagMutations";
import {
  ModalBackdrop,
  ModalContainer,
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  InputLabel,
  InputWrapper,
  ButtonContainer,
  FixedButtonContainer,
  Input as SharedInput,
  ErrorText,
} from "../ui/SharedComponents";

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
  const navigate = useNavigate();
  const createTagMutation = useCreateTag();

  const handleCreateTag = async () => {
    const trimmedTagName = tagName.trim();
    
    if (!trimmedTagName) {
      setError("Tag name is required");
      return;
    }

    if (!trimmedTagName.match(/^[A-Za-z0-9]{1,20}$/)) {
      setError("Tag name must contain only letters and numbers (1-20 characters)");
      return;
    }

    setError("");

    try {
      const response = await createTagMutation.mutateAsync({
        tagName: trimmedTagName,
      });

      console.log("API Response:", response);

      if (response.code === 200) {
        console.log(
          "Tag created successfully with ID:",
          response.data.tagId
        );
        alert('Tag created successfully!');
        navigate(`/my-class/${response.data.tagId.toString()}`);
        onClose();
        if (onTagCreated) {
          onTagCreated();
        }
      } else {
        console.error("API returned error:", response);
        setError(`Failed to create tag: ${response.message}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating tag:", error.message);
        setError(error.message || "Failed to create tag.");
      } else {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTagName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !createTagMutation.isPending) {
      handleCreateTag();
    }
  };

  return (
    <ModalBackdrop onClick={onClose} className="modal-backdrop-right">
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 */}
        <HeaderSection>
          <HeaderTitle>Create New Tag</HeaderTitle>
          <HeaderSubTitle>Create a new tag for your class.</HeaderSubTitle>
        </HeaderSection>


        {/* Tag Name 字段 */}
        <InputLabel>Tag Name</InputLabel>
        <InputWrapper>
          <SharedInput
            value={tagName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter tag name"
            disabled={createTagMutation.isPending}
            $hasError={!!error}
          />
          <ErrorText $visible={!!error}>{error || " "}</ErrorText>
        </InputWrapper>
        

        {/* 底部按钮 */}
        <ButtonContainer>
          <FixedButtonContainer>
            <Button variant="cancel" onClick={onClose} disabled={createTagMutation.isPending}>
              Cancel
            </Button>
          </FixedButtonContainer>
          <FixedButtonContainer>
            <Button onClick={handleCreateTag} disabled={createTagMutation.isPending || !tagName.trim()}>
              {createTagMutation.isPending ? "Creating..." : "Create Tag"}
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default CreateNewTag;
