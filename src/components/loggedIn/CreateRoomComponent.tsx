import React, { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useFormik, FieldArray, FormikProvider, FormikValues } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import { MdLock, MdPublic } from "react-icons/md";
import { FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useRoomContext } from "./RoomContext";
import Button from "../ui/Button";
import AutoResizeTextarea from "../ui/Textarea";
import { useUserRole, useEditGroup, useGroupInfo } from "../../hooks/queries/useGroup";
import {
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  InputLabel,
  ButtonContainer,
  FixedButtonContainer,
  Input as SharedInput,
  ErrorText,
  ModalBackdrop
} from "../ui/SharedComponents";



const Modal = styled.div`
  position: relative;
  width: 95%;
  max-width: 50rem;
  background: var(--white);
  border: none;
  border-radius: var(--radius-12);
  padding: var(--space-4);
  height: auto;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px var(--shadow-25);
  animation: slideIn 0.3s ease-out;
  cursor: default;
  display: flex;
  flex-direction: column;

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

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 85%;
    padding: var(--space-6);
    max-height: 85vh;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 75%;
    padding: var(--space-7);
    max-height: 40rem;
  }
`;

// 可滚动的内容区域
const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: visible;
  padding-right: var(--space-1);
  margin-top: var(--space-3);

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 2px;
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding-right: var(--space-2);
    margin-top: var(--space-4);
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding-right: var(--space-2);
    margin-top: var(--space-4);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: 0.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: 0.5rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;


const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
  margin-top: var(--space-1);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    margin-top: 0.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.5rem;
  }

`;

const RadioCard = styled.label<{ checked: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid ${(props) => (props.checked ? "var(--emerald-green)" : "var(--gray-200)")};
  border-radius: 12px;
  background-color: ${(props) => (props.checked ? "var(--green-50)" : "var(--gray-50)")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    border-color: ${(props) => (props.checked ? "var(--emerald-green)" : "var(--gray-400)")};
    background-color: ${(props) => (props.checked ? "var(--green-50)" : "var(--gray-100)")};
  }

  input {
    display: none;
  }
`;

const RadioIcon = styled.div<{ checked: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid ${(props) => (props.checked ? "var(--emerald-green)" : "var(--gray-300)")};
  border-radius: 50%;
  background-color: ${(props) => (props.checked ? "var(--emerald-green)" : "transparent")};
  position: relative;
  transition: all 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.5rem;
    height: 0.5rem;
    background-color: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: ${(props) => (props.checked ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
`;

const RadioContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const RadioTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-roboto);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
`;

const RadioDescription = styled.div`
  font-family: var(--font-roboto);
  font-size: 0.75rem;
  color: var(--muted-6b7280);
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--gray-100);
    border-color: var(--gray-300);
  }
`;

const CheckboxInput = styled.input`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--emerald-green);
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:checked {
    background-color: var(--emerald-green);
  }

  &:checked::after {
    content: "✓";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
  }
`;

const CheckboxLabel = styled.label`
  font-family: var(--font-roboto);
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--slate-grey);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AssistantIcon = styled(FaRobot)`
  color: var(--emerald-green);
  font-size: 1rem;
`;

const FieldArrayContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--white);
  border-radius: var(--radius-12);
  border: 1px solid var(--gray-200);
`;

const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-200);
`;

const AssistantTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
`;

const ColumnHeader = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-600);
  text-align: left;
  display: flex;
  align-items: center;
  height: 2.5rem;
`;

const ColumnHeaderWithHelp = styled(ColumnHeader)`
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: auto;
  min-height: 2.5rem;
  line-height: 1.2;
`;
const HelpIcon = styled.span`
  margin-left: 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  font-size: 0.75rem;
  line-height: 1;
  color: var(--muted-6b7280);
  border: 1px solid var(--gray-300);
  border-radius: 9999px;
  background-color: var(--gray-100);
  cursor: 
`;

const CenteredColumnHeader = styled(ColumnHeader)`
  text-align: center;
  justify-content: center;
`;

const AddAssistantRow = styled.div`
  display: grid;
  grid-template-columns: 32px 0.8fr 1.3fr 80px 80px;
  gap: 0.6rem;
  align-items: start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--blue-100);
    border-radius: 8px;
    margin: 0 -0.5rem;
    padding: 0.75rem 0.5rem;
  }

  &:last-child {
    border-bottom: none;
  }

  /* mobile - 基础样式 */
  grid-template-columns: 24px 1fr 1fr 50px 50px;
  gap: 0.3rem;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 28px 1fr 1fr 60px 60px;
    gap: 0.4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 32px 0.8fr 1.3fr 80px 80px;
    gap: 0.6rem;
  }
`;

const FeedbackAssistantRow = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr 1fr 50px 50px;
  gap: 0.3rem;
  align-items: start;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--blue-100);
    border-radius: 8px;
    margin: 0 -0.5rem;
    padding: 0.5rem 0.5rem;
  }

  &:last-child {
    border-bottom: none;
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 28px 1fr 1fr 60px 60px;
    gap: 0.4rem;
    padding: 0.75rem 0;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 32px 0.8fr 1.3fr 80px 80px;
    gap: 0.6rem;
    padding: 0.75rem 0;
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr 1fr 50px 50px;
  gap: 0.3rem;
  padding: 0.5rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-300);
  align-items: center;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 28px 1fr 1fr 60px 60px;
    gap: 0.4rem;
    padding: 0.75rem 0;
    margin-bottom: 1rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 32px 0.8fr 1.3fr 80px 80px;
    gap: 0.6rem;
  }
`;

const SmallInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-height: 2rem;
  justify-content: flex-start;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    min-height: 2.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    min-height: 2.5rem;
  }
`;



const SmallTextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-height: 2rem;
  justify-content: flex-start;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    min-height: 2.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    min-height: 2.5rem;
  }
`;




const ToggleSwitchContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  gap: 0;
  min-height: 2rem;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    min-height: 2.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    min-height: 2.5rem;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  input {
    display: none;
  }

  span {
    width: 3rem;
    height: 1.5rem;
    background-color: var(--gray-300);
    border-radius: 0.75rem;
    position: relative;
    transition: background-color 0.3s ease;

    &::before {
      content: "";
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1.25rem;
      height: 1.25rem;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  input:checked + span {
    background-color: var(--emerald-green);

    &::before {
      transform: translateX(1.5rem);
    }
  }

  /* mobile - 基础样式 */
  span {
    width: 2rem;
    height: 1rem;

    &::before {
      width: 0.75rem;
      height: 0.75rem;
      top: 0.125rem;
      left: 0.125rem;
    }
  }

  input:checked + span::before {
    transform: translateX(1rem);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    span {
      width: 2.5rem;
      height: 1.25rem;

      &::before {
        width: 1rem;
        height: 1rem;
        top: 0.125rem;
        left: 0.125rem;
      }
    }

    input:checked + span::before {
      transform: translateX(1.25rem);
    }
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    span {
      width: 3rem;
      height: 1.5rem;

      &::before {
        width: 1rem;
        height: 1rem;
        top: 0.125rem;
        left: 0.125rem;
      }
    }

    input:checked + span::before {
      transform: translateX(1.5rem);
    }
  }
`;

const RemoveIcon = styled(IoIosRemoveCircleOutline)`
  font-size: 1.2rem;
  color: var(--error-red);
  cursor: pointer;
  justify-self: center;
  align-self: center;
  transition: all 0.2s ease;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--error-red-dark);
    transform: scale(1.1);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 1.5rem;
    height: 2.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 1.5rem;
    height: 2.5rem;
  }
`;

const AddIconContainer = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr 1fr 50px 40px;
  gap: 0.3rem;
  margin-top: 0.75rem;
  align-items: center;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 28px 1fr 1fr 60px 50px;
    gap: 0.4rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 32px 1fr 1.3fr 70px 60px;
    gap: 0.6rem;
    margin-top: 1rem;
  }
`;

const AddIcon = styled(IoIosAddCircleOutline)`
  font-size: 1.2rem;
  color: var(--emerald-green);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 1.2rem;

  &:hover {
    color: var(--emerald-green-dark);
    transform: scale(1.1);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 1.5rem;
    height: 1.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 1.5rem;
    height: 1.5rem;
  }
`;

const ModalButtonContainer = styled(ButtonContainer)`
  margin-top: 2rem;
`;

const validationSchema = (showAssistants: boolean) =>
  Yup.object().shape({
    roomName: Yup.string()
      .required("Group Name is required")
      .matches(
        /^[A-Za-z0-9]{1,20}$/,
        "Must be 1-20 characters long, supports uppercase and lowercase English letters and numbers"
      ),
    roomDescription: Yup.string()
      .required("Group Description is required")
      .max(800, "Group Description cannot exceed 800 characters"),
    roomType: Yup.string() // Changed to string to match form values
      .oneOf(["0", "1"], "Invalid group type") // Changed to string values
      .required("Group Type is required"),
    groupMode: Yup.string()
      .oneOf(["free", "feedback"], "Invalid group mode")
      .required("Group Mode is required"),

    roomPassword: Yup.string().when("roomType", {
      is: (value: string) => value === "0",
      then: (schema) =>
        schema
          .required("Password is required for private groups")
          .matches(
            /^[A-Za-z0-9!@#$%^&*()_+\-={}$.]{6,33}$/,
            "Password must be 6-33 characters long and contain valid characters"
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    bots: showAssistants
      ? Yup.array()
          .of(
            Yup.object().shape({
              name: Yup.string()
                .required("Assistant name is required")
                .matches(
                  /^[\u4e00-\u9fa5A-Za-z0-9]{1,20}$/,
                  "Must be 1-20 characters long. Supports letters, numbers, and Chinese characters."
                )
                .test(
                  "unique-name",
                  "Assistant name must be unique",
                  function (value) {
                    if (!value) return true; // Let required validation handle empty values

                    const { from } = this;
                    if (!from || !from[1] || !from[1].value) return true;

                    const allBots = from[1].value.bots || [];

                    // Count how many times this name appears
                    const nameCount = allBots.filter(
                      (bot: any) =>
                        bot.name &&
                        bot.name.trim().toLowerCase() ===
                          value.trim().toLowerCase()
                    ).length;

                    return nameCount <= 1;
                  }
                ),
              prompt: Yup.string()
                .required("Prompt is required")
                .max(2000, "Prompt cannot exceed 2000 characters"),
              context: Yup.number()
                .required("Context is required")
                .min(1, "Minimum value is 1")
                .max(20, "Maximum value is 20"),
              adminOnly: Yup.boolean(),
            })
          )
          .min(1, "Add at least one assistant")
          .required("Bot info is required")
      : Yup.array().notRequired(),

    // Make feedback assistant required only in feedback mode
    feedbackBot:
    Yup.object()
      .shape({
        name: Yup.string().transform((v) => (typeof v === "string" ? v.trim() : v)),
        prompt: Yup.string().transform((v) => (typeof v === "string" ? v.trim() : v)),
        msgCountInterval: Yup.number(),
        timeInterval: Yup.number(),
      })
      .when("groupMode", {
        is: "feedback",
        then: (schema) =>
          schema
            .shape({
              name: Yup.string()
                .transform((v) => (typeof v === "string" ? v.trim() : v))
                .required("Assistant name is required")
                .matches(
                  /^[\u4e00-\u9fa5A-Za-z0-9]{1,20}$/,
                  "Must be 1-20 characters long. Supports letters, numbers, and Chinese characters."
                ),
              prompt: Yup.string()
                .transform((v) => (typeof v === "string" ? v.trim() : v))
                .required("Prompt is required")
                .max(2000, "Prompt cannot exceed 2000 characters"),
              msgCountInterval: Yup.number()
                .typeError("Message Count Interval must be a number")
                .integer("Message Count Interval must be an integer")
                .min(2, "Minimum value is 2")
                .max(20, "Maximum value is 20")
                .required("Message Count Interval is required"),
              timeInterval: Yup.number()
                .typeError("Time Interval must be a number")
                .integer("Time Interval must be an integer")
                .min(1, "Minimum value is 1")
                .max(30, "Maximum value is 30")
                .required("Time Interval is required"),
            })
            .required("AI Feedback Assistant Configuration is required"),
        otherwise: (schema) =>
          schema
            .shape({
              name: Yup.string()
                .transform((v) => (typeof v === "string" ? v.trim() : v))
                .nullable()
                .notRequired(),
              prompt: Yup.string()
                .transform((v) => (typeof v === "string" ? v.trim() : v))
                .nullable()
                .notRequired(),
              msgCountInterval: Yup.number().nullable().notRequired(),
              timeInterval: Yup.number().nullable().notRequired(),
            })
            .nullable()
            .notRequired(),
      }),
  });

// Define interface for bot data structure
interface ChatBotVO {
  accessType: number;
  botContext: number;
  botName: string;
  botPrompt: string;
  botId?: number;
}

// Define interface for form bot data
interface FormBot {
  name: string;
  prompt: string;
  context: number;
  adminOnly: boolean;
}

// Define interface for feedback mode payload
interface ChatBotFeedbackVO {
  botName: string;
  botPrompt: string;
  msgCountInterval: number;
  timeInterval: number;
  botId?: number;
}

// Define interface for request payload
interface CreateGroupPayload {
  groupName: string;
  groupDescription: string;
  groupType: number;
  password?: string;
  groupMode: "free" | "feedback";
  chatBotVOList: ChatBotVO[];
  chatBotFeedbackVO?: ChatBotFeedbackVO;
}

interface CreateRoomComponentProps {
  onClose: () => void;
  isModify?: boolean;
  groupId?: number;
  fromSidebar?: boolean;
}

// Define the RoomInfoResponse interface at the appropriate scope
export interface RoomInfoResponse {
  code: number;
  message: string;
  data?: {
    groupId: number;
    groupName: string;
    groupDescription: string;
    groupType: number;
    password?: string;
    clearContextTime?: string;
    groupMode?: "free" | "feedback";
    chatBots?: ChatBotVO[];
    chatBotFeedback?: ChatBotFeedbackVO;
  };
}

// Extend the FormBot interface to include status and botId
interface FormBotWithStatus extends FormBot {
  botId?: number;
  status: "new" | "modified" | "unchanged";
}

const CreateRoomComponent: React.FC<CreateRoomComponentProps> = ({
  onClose,
  isModify = false,
  groupId: propGroupId,
  fromSidebar = false,
}) => {
  const { addRoom } = useRoomContext();
  const [showAssistants, setShowAssistants] = useState(false);
  const [apiRequestMade, setApiRequestMade] = useState(false);
  const [originalBots, setOriginalBots] = useState<ChatBotVO[]>([]);
  const { groupId: urlGroupId } = useParams<{ groupId: string }>();
  const effectiveIsModify = fromSidebar ? false : isModify;
  const shouldCheckRole = effectiveIsModify && !fromSidebar;
  const [userRole, setUserRole] = useState<string | null>(
    fromSidebar ? "ADMIN" : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the groupId to use - from props or URL params
  const currentGroupId =
    propGroupId || (urlGroupId ? parseInt(urlGroupId, 10) : undefined);

  // Use React Query hooks
  const { data: userRoleData } = useUserRole(shouldCheckRole ? currentGroupId : undefined);
  const editGroupMutation = useEditGroup();
  const { data: groupInfoData } = useGroupInfo(currentGroupId);

  const handleAddGroup = async (
    values: FormikValues,
    onClose: () => void,
    showAssistantsEnabled: boolean
  ) => {
    const groupTypeValue = parseInt(values.roomType, 10);

    const chatBotVOList: ChatBotVO[] = showAssistantsEnabled
      ? values.bots.map((bot: FormBot) => ({
          accessType: bot.adminOnly ? 0 : 1,
          botContext:
            typeof bot.context === "number"
              ? bot.context
              : parseInt(String(bot.context), 10),
          botName: bot.name || "",
          botPrompt: bot.prompt || "",
        }))
      : [];

    let requestPayload: CreateGroupPayload;

    if (values.groupMode === "feedback") {
      requestPayload = {
        groupName: values.roomName,
        groupDescription: values.roomDescription,
        groupType: groupTypeValue,
        ...(groupTypeValue === 0 ? { password: values.roomPassword } : {}),
        groupMode: "feedback",
        chatBotVOList: [],
        chatBotFeedbackVO: {
          botName: values.feedbackBot.name || "",
          botPrompt: values.feedbackBot.prompt || "",
          msgCountInterval:
            typeof values.feedbackBot.msgCountInterval === "number"
              ? values.feedbackBot.msgCountInterval
              : parseInt(String(values.feedbackBot.msgCountInterval), 10),
          timeInterval:
            typeof values.feedbackBot.timeInterval === "number"
              ? values.feedbackBot.timeInterval
              : parseInt(String(values.feedbackBot.timeInterval), 10),
        },
      };
    } else {
      requestPayload = {
        groupName: values.roomName,
        groupDescription: values.roomDescription,
        groupType: groupTypeValue,
        ...(groupTypeValue === 0 ? { password: values.roomPassword } : {}),
        groupMode: "free",
        chatBotVOList,
      };
    }

    setIsSubmitting(true);
    try {
      addRoom(requestPayload);
      onClose();
    } catch (error: any) {
      console.error("Error creating group:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      roomName: "",
      roomDescription: "",
      roomType: "1",
      groupMode: "free",
      roomPassword: "",
      bots: [
        {
          name: "",
          prompt: "",
          context: 1,
          adminOnly: false,
          botId: undefined,
          status: "new",
        },
      ] as FormBotWithStatus[],
      feedbackBot: {
        name: "",
        prompt: "",
        msgCountInterval: 2,
        timeInterval: 1,
        botId: undefined,
      },
    },
    validationSchema: validationSchema(showAssistants),
    onSubmit: async (values) => {
      console.log("Form Submitted", values);
      console.log("roomType value:", values.roomType);
      console.log(
        "Bot status summary:",
        values.bots.map((bot) => ({
          botId: bot.botId,
          name: bot.name,
          status: bot.status,
        }))
      );

      if (effectiveIsModify && userRole === "ADMIN") {
        await handleEditGroup(values);
      } else if (!effectiveIsModify) {
        const submittedValues = {
          ...values,
          bots: showAssistants ? values.bots : [],
        };
        await handleAddGroup(submittedValues, onClose, showAssistants);
      } else {
        alert("You don't have permission to modify this room");
      }
    },
  });

  useEffect(() => {
    if (
      effectiveIsModify &&
      !fromSidebar &&
      !apiRequestMade &&
      currentGroupId &&
      shouldCheckRole &&
      userRoleData
    ) {
      setApiRequestMade(true);
      if (userRoleData) {
       setUserRole(userRoleData);
      } else {
        alert("Failed to fetch user role.");
        setUserRole(null);
      }
    }
  }, [effectiveIsModify, currentGroupId, apiRequestMade, fromSidebar, shouldCheckRole, userRoleData]);

  useEffect(() => {
    if (fromSidebar) {
      setApiRequestMade(false);
      setShowAssistants(false);
      setOriginalBots([]);
      setUserRole(null);
      formik.resetForm();
    }
  }, [fromSidebar]);

  useEffect(() => {
    return () => {
      setShowAssistants(false);
      setApiRequestMade(false);
      setOriginalBots([]);
      setUserRole(null);
      formik.resetForm();
    };
  }, []);

  useEffect(() => {
    setApiRequestMade(false);
    setShowAssistants(false);
    setOriginalBots([]);
    setUserRole(null);
    formik.resetForm();
  }, [effectiveIsModify, propGroupId]);

const handleEditGroup = async (values: any) => {
    if (!currentGroupId) {
      console.error("Cannot edit group: groupId is undefined");
      return;
    }

    try {
      console.log("Edit form values:", values);

      const addedBots = values.bots
        .filter((bot: FormBotWithStatus) => bot.status === "new")
        .map((bot: FormBotWithStatus) => ({
          accessType: bot.adminOnly ? 0 : 1,
          botContext:
            typeof bot.context === "number"
              ? bot.context
              : parseInt(String(bot.context), 10),
          botName: bot.name,
          botPrompt: bot.prompt,
        }));

      const currentBotIds = values.bots
        .filter((bot: FormBotWithStatus) => bot.botId)
        .map((bot: FormBotWithStatus) => bot.botId);

      const deletedBotIds = originalBots
        .filter((bot) => !currentBotIds.includes(bot.botId))
        .map((bot) => bot.botId);

      console.log("Deleted bot IDs:", deletedBotIds);

      const existingBots = values.bots
        .filter(
          (bot: FormBotWithStatus) =>
            bot.botId &&
            (bot.status === "modified" || bot.status === "unchanged")
        )
        .map((bot: FormBotWithStatus) => ({
          botId: bot.botId,
          accessType: bot.adminOnly ? 0 : 1,
          botContext:
            typeof bot.context === "number"
              ? bot.context
              : parseInt(String(bot.context), 10),
          botName: bot.name,
          botPrompt: bot.prompt,
        }));

      const feedbackBotVO =
        values.groupMode === "feedback"
          ? {
              botId: values.feedbackBot.botId,
              botName: values.feedbackBot.name || "",
              botPrompt: values.feedbackBot.prompt || "",
              msgCountInterval:
                typeof values.feedbackBot.msgCountInterval === "number"
                  ? values.feedbackBot.msgCountInterval
                  : parseInt(String(values.feedbackBot?.msgCountInterval ?? 2), 10),
              timeInterval:
                typeof values.feedbackBot?.timeInterval === "number"
                  ? values.feedbackBot.timeInterval
                  : parseInt(String(values.feedbackBot?.timeInterval ?? 1), 10),
            }
          : undefined;

      const requestPayload = {
        groupId: Number(currentGroupId),
        groupName: values.roomName,
        groupDescription: values.roomDescription,
        ...(values.roomType === "0" ? { password: values.roomPassword } : {}),
        ...(values.groupMode === "feedback"
          ? {
              modifyChatBotFeedbackVO: feedbackBotVO,
            }
          : {}),
        ...(showAssistants && values.groupMode === "free"
          ? {
              addChatBotVOList: addedBots,
              modifyChatBotVOS: existingBots,
            }
          : {
              addChatBotVOList: [],
              modifyChatBotVOS: [],
            }),
      };

      console.log("Edit request payload:", requestPayload);

      const response = await editGroupMutation.mutateAsync(requestPayload);

      console.log("Edit response:", response);

      if (response.code === 200) {
        // Verify by checking the group info query data
        if (groupInfoData) {
          console.log("Verification response:", groupInfoData);
        }

        alert("Room successfully updated!");
        onClose();
      } else {
        alert(response.message || "Failed to update room");
      }
    } catch (error: any) {
      console.error("Error updating group:", error);
      alert(`Error: ${error.message || "Failed to update room"}`);
    }
  };

  const hasBotErrors = () => {
    if (!showAssistants) return false;

    const { bots } = formik.errors;
    if (!bots) return false;

    if (typeof bots === "string") {
      return true;
    }

    if (Array.isArray(bots)) {
      return bots.some((error) => error && typeof error === "object");
    }

    return false;
  };

  const handleAssistantToggle = () => {
    setShowAssistants(!showAssistants);

    if (showAssistants) {
      formik.setErrors({
        ...formik.errors,
        bots: undefined,
      });
    }
  };

  useEffect(() => {
    if (isModify && !apiRequestMade && currentGroupId && groupInfoData?.code === 200) {
      setApiRequestMade(true);
      
      const roomData = groupInfoData.data;
      if (!roomData) return;
      
      const botList = roomData.chatBots || [];
      setOriginalBots([...botList]);
      
      const hasBots = botList.length > 0;
      const isAdmin = userRole === "ADMIN";
      
      const feedbackInfo = (roomData as any).chatBotFeedbackVO || roomData.chatBotFeedback;
      const isFeedbackMode = roomData.groupMode === "feedback" || !!feedbackInfo;
      
      let formattedBots: FormBotWithStatus[] = [];
      
      if (!isFeedbackMode) {
        if (hasBots) {
          formattedBots = botList.map((bot: any) => ({
            name: bot.botName,
            prompt: bot.botPrompt,
            context: bot.botContext,
            adminOnly: bot.accessType === 0,
            botId: bot.botId,
            status: "unchanged" as const,
          }));
          setShowAssistants(isAdmin && hasBots);
        } else {
          formattedBots = [
            {
              name: "",
              prompt: "",
              context: 1,
              adminOnly: false,
              status: "new" as const,
            },
          ];
          setShowAssistants(false);
        }
      } else {
        setShowAssistants(false);
      }
      
      formik.setValues({
        roomName: roomData.groupName,
        roomDescription: roomData.groupDescription || "",
        roomType: roomData.groupType.toString(),
        groupMode: isFeedbackMode ? "feedback" : "free",
        roomPassword: roomData.password || "",
        bots: isAdmin && !isFeedbackMode ? formattedBots : [],
        feedbackBot:
          isFeedbackMode && feedbackInfo
            ? {
                name: feedbackInfo.botName || "",
                prompt: feedbackInfo.botPrompt || "",
                msgCountInterval:
                  typeof feedbackInfo.msgCountInterval === "number"
                    ? feedbackInfo.msgCountInterval
                    : typeof feedbackInfo.msgCountInterval === "string"
                    ? parseInt(feedbackInfo.msgCountInterval, 10)
                    : 2,
                timeInterval:
                  typeof feedbackInfo.timeInterval === "number"
                    ? feedbackInfo.timeInterval
                    : typeof feedbackInfo.timeInterval === "string"
                    ? parseInt(feedbackInfo.timeInterval, 10)
                    : 1,
                botId: feedbackInfo.botId,
              }
            : {
                name: "",
                prompt: "",
                msgCountInterval: 2,
                timeInterval: 1,
                botId: undefined,
              },
      });
    }
  }, [isModify, currentGroupId, apiRequestMade, groupInfoData, userRole, formik]);

  const handleBotFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    formik.handleChange(e);

    const bot = formik.values.bots[index];

    if (bot && bot.botId && bot.status === "unchanged") {
      console.log(
        `Marking bot at index ${index} as modified: ${name} changed to ${
          type === "checkbox" ? checked : value
        }`
      );

      const updatedBots = [...formik.values.bots];
      updatedBots[index] = {
        ...updatedBots[index],
        status: "modified",
      };

      formik.setFieldValue("bots", updatedBots);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}  className="modal-backdrop-right">
      <Modal onClick={(e) => e.stopPropagation()}>
        {/* 右上角关闭按钮 */}
        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX size={24} />
        </ModalCloseButton>

        {/* 顶部标题 - 固定在顶部不滚动 */}
        <HeaderSection>
          <HeaderTitle>{effectiveIsModify ? "Edit Room" : "Create New Room"}</HeaderTitle>
          <HeaderSubTitle>{effectiveIsModify ? "Update your room details." : "Create a new room for your group."}</HeaderSubTitle>
        </HeaderSection>

        {/* 可滚动的内容区域 */}
        <ModalContent>
        <FormikProvider value={formik}>
          <Form onSubmit={formik.handleSubmit}>
            <InputGroup>
              <InputLabel htmlFor="roomName">Group Name</InputLabel>
              <SharedInput
                id="roomName"
                name="roomName"
                placeholder="Explore Generative AI"
                autoComplete="off"
                value={formik.values.roomName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={effectiveIsModify}
                $hasError={!!(formik.touched.roomName && formik.errors.roomName)}
              />
              <ErrorText $visible={!!(formik.touched.roomName && formik.errors.roomName)}>
                {(formik.touched.roomName && formik.errors.roomName) ? formik.errors.roomName : ' '}
              </ErrorText>
            </InputGroup>

            <InputGroup>
              <InputLabel htmlFor="roomDescription">Description</InputLabel>
              <SmallTextareaContainer>
                <AutoResizeTextarea
                  name="roomDescription"
                  placeholder="Let's discuss AGI"
                  value={formik.values.roomDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  hasError={
                    !!(
                      formik.touched.roomDescription &&
                      formik.errors.roomDescription
                    )
                  }
                  disabled={shouldCheckRole && userRole !== "ADMIN"}
                />
              </SmallTextareaContainer>
              <ErrorText $visible={!!(formik.touched.roomDescription && formik.errors.roomDescription)}>
                {(formik.touched.roomDescription && formik.errors.roomDescription) ? formik.errors.roomDescription : " "}
              </ErrorText>
            </InputGroup>

            <InputGroup>
              <InputLabel>Group Type</InputLabel>
              <RadioGroup>
                <RadioCard
                  checked={formik.values.roomType === "1"}
                  disabled={effectiveIsModify}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value="1"
                    checked={formik.values.roomType === "1"}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    disabled={effectiveIsModify}
                  />
                  <RadioIcon checked={formik.values.roomType === "1"} />
                  <RadioContent>
                    <RadioTitle>
                      <MdPublic />
                      Public
                    </RadioTitle>
                    <RadioDescription>Display on Public Pages</RadioDescription>
                  </RadioContent>
                </RadioCard>

                <RadioCard
                  checked={formik.values.roomType === "0"}
                  disabled={effectiveIsModify}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value="0"
                    checked={formik.values.roomType === "0"}
                    onChange={(e) => {
                      formik.handleChange(e);
                      console.log("Radio changed to:", e.target.value);
                    }}
                    disabled={effectiveIsModify}
                  />
                  <RadioIcon checked={formik.values.roomType === "0"} />
                  <RadioContent>
                    <RadioTitle>
                      <MdLock />
                      Private
                    </RadioTitle>
                    <RadioDescription>Password Required to Join</RadioDescription>
                  </RadioContent>
                </RadioCard>
              </RadioGroup>
            </InputGroup>

            {formik.values.roomType === "0" && (
              <InputGroup>
                <InputLabel htmlFor="roomPassword">Password</InputLabel>
                <SharedInput
                  id="roomPassword"
                  name="roomPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.roomPassword}
                  $hasError={
                    !!(formik.touched.roomPassword && formik.errors.roomPassword)
                  }
                />
                <ErrorText $visible={!!(formik.touched.roomPassword && formik.errors.roomPassword)}>
                  {(formik.touched.roomPassword && formik.errors.roomPassword) ? formik.errors.roomPassword : " "}
                </ErrorText>
              </InputGroup>
            )}
            <InputGroup>
              <InputLabel>Group Mode</InputLabel>
              <RadioGroup>
                <RadioCard
                  checked={formik.values.groupMode === "free"}
                  disabled={effectiveIsModify}
                >
                  <input
                    type="radio"
                    name="groupMode"
                    value="free"
                    checked={formik.values.groupMode === "free"}
                    onChange={(e) => {
                      console.log("[groupMode] changed to:", e.target.value);
                      formik.handleChange(e);
                    }}
                    disabled={effectiveIsModify}
                  />
                  <RadioIcon checked={formik.values.groupMode === "free"} />
                  <RadioContent>
                    <RadioTitle>Free Chat Mode</RadioTitle>
                    <RadioDescription>Unmoderated, Open Dialogue</RadioDescription>
                  </RadioContent>
                </RadioCard>

                <RadioCard
                  checked={formik.values.groupMode === "feedback"}
                  disabled={effectiveIsModify}
                >
                  <input
                    type="radio"
                    name="groupMode"
                    value="feedback"
                    checked={formik.values.groupMode === "feedback"}
                    onChange={(e) => {
                      console.log("[groupMode] changed to:", e.target.value);
                      formik.handleChange(e);
                    }}
                    disabled={effectiveIsModify}
                  />
                  <RadioIcon checked={formik.values.groupMode === "feedback"} />
                  <RadioContent>
                    <RadioTitle>Auto Feedback Mode</RadioTitle>
                    <RadioDescription>Automatic feedback from the assistant</RadioDescription>
                  </RadioContent>
                </RadioCard>
              </RadioGroup>
              <ErrorText $visible={!!(formik.touched.groupMode && formik.errors.groupMode)}>
                {(formik.touched.groupMode && formik.errors.groupMode) ? formik.errors.groupMode : " "}
              </ErrorText>
            </InputGroup>
            
            {(!effectiveIsModify || userRole === "ADMIN") && (formik.values.groupMode === "free") &&(
              <CheckboxContainer>
                <CheckboxInput
                  type="checkbox"
                  checked={showAssistants}
                  onChange={handleAssistantToggle}
                />
                <CheckboxLabel>
                  <AssistantIcon />
                  Add AI Assistant(s)
                </CheckboxLabel>
              </CheckboxContainer>
            )}

            {showAssistants  && (formik.values.groupMode === "free") && (
              <FieldArrayContainer>
                <AssistantHeader>
                  <AssistantIcon />
                  <AssistantTitle>AI Assistants Configuration</AssistantTitle>
                </AssistantHeader>

                <FieldArray
                  name="bots"
                  render={(arrayHelpers) => (
                    <>
                      <HeaderRow>
                        <CenteredColumnHeader></CenteredColumnHeader>
                        <ColumnHeader>Assistant Name</ColumnHeader>
                        <ColumnHeader>Prompt</ColumnHeader>
                        <ColumnHeader>Admin Only</ColumnHeader>
                        <ColumnHeader>Context</ColumnHeader>
                      </HeaderRow>

                      {formik.values.bots.map((bot, index) => (
                        <AddAssistantRow key={index}>
                          <RemoveIcon
                            onClick={() => {
                              if (formik.values.bots.length > 1) {
                                arrayHelpers.remove(index);
                              }
                            }}
                          />
                          <SmallInputContainer>
                            <SharedInput
                              name={`bots[${index}].name`}
                              placeholder="Assistant Name"
                              value={bot.name}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                              disabled={effectiveIsModify && bot?.botId != null}
                              $hasError={
                                !!(
                                  formik.touched.bots?.[index]?.name &&
                                  formik.errors.bots?.[index] &&
                                  typeof formik.errors.bots[index] ===
                                    "object" &&
                                  (formik.errors.bots[index] as any).name
                                )
                              }
                            />
                            <ErrorText $visible={!!(
                              formik.touched.bots?.[index]?.name &&
                              formik.errors.bots?.[index] &&
                              typeof formik.errors.bots[index] === "object" &&
                              (formik.errors.bots[index] as any).name
                            )}>
                         
                            </ErrorText>
                          </SmallInputContainer>
                          <SmallTextareaContainer>
                            <AutoResizeTextarea
                              name={`bots[${index}].prompt`}
                              placeholder="Prompt"
                              value={bot.prompt}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                              hasError={
                                !!(
                                  formik.touched.bots?.[index]?.prompt && formik.errors.bots?.[index] &&
                                  typeof formik.errors.bots[index] === "object" && (formik.errors.bots[index] as any).prompt
                                )
                              }
                            />
                            <ErrorText $visible={!!(
                              formik.touched.bots?.[index]?.prompt &&
                              formik.errors.bots?.[index] &&
                              typeof formik.errors.bots[index] === "object" &&
                              (formik.errors.bots[index] as any).prompt
                            )}>
                  
                            </ErrorText>
                          </SmallTextareaContainer>
                          <ToggleSwitchContainer>
                            <ToggleSwitch>
                              <input
                                type="checkbox"
                                name={`bots[${index}].adminOnly`}
                                checked={bot.adminOnly}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  formik.setFieldValue(
                                    `bots[${index}].adminOnly`,
                                    isChecked
                                  );
                                  if (bot.botId && bot.status === "unchanged") {
                                    const updatedBots = [...formik.values.bots];
                                    updatedBots[index] = {
                                      ...updatedBots[index],
                                      adminOnly: isChecked,
                                      status: "modified",
                                    };
                                    formik.setFieldValue("bots", updatedBots);
                                    console.log(
                                      `Bot at index ${index} marked as modified (adminOnly: ${isChecked})`
                                    );
                                  }
                                }}
                              />
                              <span></span>
                            </ToggleSwitch>
                          </ToggleSwitchContainer>
                          <SmallInputContainer>
                            <SharedInput
                              type="number"
                              name={`bots[${index}].context`}
                              placeholder="Context"
                              value={String(bot.context)}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                              $hasError={
                                !!(
                                  formik.touched.bots?.[index]?.context &&
                                  formik.errors.bots?.[index] &&
                                  typeof formik.errors.bots[index] ===
                                    "object" &&
                                  (formik.errors.bots[index] as any).context
                                )
                              }
                            />
                            <ErrorText $visible={!!(
                              formik.touched.bots?.[index]?.context &&
                              formik.errors.bots?.[index] &&
                              typeof formik.errors.bots[index] === "object" &&
                              (formik.errors.bots[index] as any).context
                            )}>
                          
                            </ErrorText>
                          </SmallInputContainer>
                        </AddAssistantRow>
                      ))}

                      <AddIconContainer>
                        <AddIcon
                          onClick={() =>
                            arrayHelpers.push({
                              name: "",
                              prompt: "",
                              context: 1,
                              adminOnly: false,
                              status: "new",
                            })
                          }
                        />
                      </AddIconContainer>
                    </>
                  )}
                />

                {hasBotErrors() && (
                  <ErrorText>All assistant fields are required</ErrorText>
                )}

                <ErrorText $visible={typeof formik.errors.bots === "string"}>
                  {typeof formik.errors.bots === "string" ? formik.errors.bots : " "}
                </ErrorText>
              </FieldArrayContainer>
            )}

            {(!effectiveIsModify || userRole === "ADMIN") &&
            formik.values.groupMode === "feedback" &&
            (!effectiveIsModify || !!formik.values.feedbackBot?.botId) && (
              <FieldArrayContainer>
                <AssistantHeader>
                  <AssistantIcon />
                  <AssistantTitle>AI Feedback Assistant Configuration</AssistantTitle>
                </AssistantHeader>

                <HeaderRow>
                  <CenteredColumnHeader></CenteredColumnHeader>
                  <ColumnHeader>Assistant Name</ColumnHeader>
                  <ColumnHeader>Prompt</ColumnHeader>
                  <ColumnHeaderWithHelp>
                    <span>Message Count Interval</span>
                    <HelpIcon title="The number of messages required to trigger an automatic reply" aria-label="trigger feedback message count">?</HelpIcon>
                  </ColumnHeaderWithHelp>
                  <ColumnHeaderWithHelp>
                    <span>Time Interval</span>
                    <HelpIcon title="The minimum time gap between two automatic replies (in minutes)" aria-label="trigger feedback message count">?</HelpIcon>
                  </ColumnHeaderWithHelp>
                </HeaderRow>

                <FeedbackAssistantRow>
                  <div />

                  <SmallInputContainer>
                    <SharedInput
                      name="feedbackBot.name"
                      disabled={effectiveIsModify}
                      placeholder="Assistant Name"
                      value={formik.values.feedbackBot?.name ?? ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      $hasError={
                        !!(
                          (formik.touched as any).feedbackBot?.name &&
                          (formik.errors.feedbackBot as any)?.name
                        )
                      }
                    />
                    <ErrorText $visible={!!(
                      (formik.touched as any).feedbackBot?.name &&
                      (formik.errors.feedbackBot as any)?.name
                    )}>
                      {(formik.errors.feedbackBot as any)?.name || " "}
                    </ErrorText>
                  </SmallInputContainer>

                  <SmallTextareaContainer>
                    <AutoResizeTextarea
                      name="feedbackBot.prompt"
                      placeholder="Prompt"
                      value={formik.values.feedbackBot?.prompt}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      hasError={
                        !!(
                          (formik.touched as any).feedbackBot?.prompt &&
                          (formik.errors.feedbackBot as any)?.prompt
                        )
                      }
                    />
                    <ErrorText $visible={!!(
                      (formik.touched as any).feedbackBot?.prompt &&
                      (formik.errors.feedbackBot as any)?.prompt
                    )}>
                      {(formik.errors.feedbackBot as any)?.prompt || " "}
                    </ErrorText>
                  </SmallTextareaContainer>

                  <SmallInputContainer>
                    <SharedInput
                      type="number"
                      name="feedbackBot.msgCountInterval"
                      placeholder="Message Count Interval"
                      value={
                        formik.values.feedbackBot?.msgCountInterval?.toString() ?? "2"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      $hasError={
                        !!(
                          (formik.touched as any).feedbackBot?.msgCountInterval &&
                          (formik.errors.feedbackBot as any)?.msgCountInterval
                        )
                      }
                    />
                    <ErrorText $visible={!!(
                      (formik.touched as any).feedbackBot?.msgCountInterval &&
                      (formik.errors.feedbackBot as any)?.msgCountInterval
                    )}>
                      {(formik.errors.feedbackBot as any)?.msgCountInterval || " "}
                    </ErrorText>
                  </SmallInputContainer>

                  <SmallInputContainer>
                    <SharedInput
                      type="number"
                      name="feedbackBot.timeInterval"
                      placeholder="Time Interval"
                      value={
                        formik.values.feedbackBot?.timeInterval?.toString() ?? "1"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      $hasError={
                        !!(
                          (formik.touched as any).feedbackBot?.timeInterval &&
                          (formik.errors.feedbackBot as any)?.timeInterval
                        )
                      }
                    />
                    <ErrorText $visible={!!(
                      (formik.touched as any).feedbackBot?.timeInterval &&
                      (formik.errors.feedbackBot as any)?.timeInterval
                    )}>
                      {(formik.errors.feedbackBot as any)?.timeInterval || " "}
                    </ErrorText>
                  </SmallInputContainer>
                </FeedbackAssistantRow>
              </FieldArrayContainer>
            )}

            {(!effectiveIsModify || userRole === "ADMIN") && (
              <ModalButtonContainer>
                <FixedButtonContainer>
                  <Button
                    variant="cancel"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </FixedButtonContainer>
                <FixedButtonContainer>
                  <Button disabled={isSubmitting} type="submit">
                    {effectiveIsModify ? "Update Room" : "Create Room"}
                  </Button>
                </FixedButtonContainer>
              </ModalButtonContainer>
            )}
          </Form>
        </FormikProvider>
        </ModalContent>
      </Modal>
    </ModalBackdrop>
  );
};

export default CreateRoomComponent;
