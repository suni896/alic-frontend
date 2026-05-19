import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useCreateTag } from "../../hooks/queries/useTagMutations";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const handleCreateTag = async () => {
    const trimmedTagName = tagName.trim();
    
    if (!trimmedTagName) {
      setError(t('myClass.tagNameRequired'));
      return;
    }

    if (!trimmedTagName.match(/^[A-Za-z0-9]{1,20}$/)) {
      setError(t('myClass.tagNameInvalid'));
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
        alert(t('myClass.tagCreatedSuccess'));
        navigate(`/my-class/${response.data.tagId.toString()}`);
        onClose();
        if (onTagCreated) {
          onTagCreated();
        }
      } else {
        console.error("API returned error:", response);
        setError(`${t('myClass.createTagFailed')}: ${response.message}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating tag:", error.message);
        setError(error.message || t('myClass.createTagFailed'));
      } else {
        console.error("Unexpected error:", error);
        setError(t('myClass.createTagError'));
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

  const modalContent = (
    <ModalBackdrop onClick={onClose} className="modal-backdrop-right">
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label={t('common.close')}>
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 */}
        <HeaderSection>
          <HeaderTitle>{t('myClass.createNewTag')}</HeaderTitle>
          <HeaderSubTitle>{t('myClass.createTagSubtitle')}</HeaderSubTitle>
        </HeaderSection>


        {/* Tag Name 字段 */}
        <InputLabel>{t('myClass.tagName')}</InputLabel>
        <InputWrapper>
          <SharedInput
            value={tagName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={t('myClass.tagNamePlaceholder')}
            disabled={createTagMutation.isPending}
            $hasError={!!error}
          />
          <ErrorText $visible={!!error}>{error || " "}</ErrorText>
        </InputWrapper>
        

        {/* 底部按钮 */}
        <ButtonContainer>
          <FixedButtonContainer>
            <Button variant="cancel" onClick={onClose} disabled={createTagMutation.isPending}>
              {t('common.cancel')}
            </Button>
          </FixedButtonContainer>
          <FixedButtonContainer>
            <Button onClick={handleCreateTag} disabled={createTagMutation.isPending || !tagName.trim()}>
              {createTagMutation.isPending ? t('myClass.creatingTag') : t('myClass.createTagButton')}
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </ModalContainer>
    </ModalBackdrop>
  );

  return createPortal(modalContent, document.body);
};

export default CreateNewTag;
