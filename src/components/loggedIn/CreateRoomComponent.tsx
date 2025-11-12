import React, { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useFormik, FieldArray, FormikProvider, FormikValues } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import { MdGroup, MdLock, MdPublic } from "react-icons/md";
import axios from "axios";
import apiClient from "../loggedOut/apiClient";
import { useParams } from "react-router-dom";
import { useRoomContext } from "./RoomContext";
import Button from "../button";
import ModalHeader from "../Header";
import { API_BASE_URL } from "../../../config";
import AutoResizeTextarea from "../Textarea";

axios.defaults.baseURL = API_BASE_URL;

const Overlay = styled.div`
  position: fixed;
  top: 7vh;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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
  top: 5px;
  width: 75%;
  max-width: 50rem;
  min-width: 320px;
  background: white;
  border: none;
  border-radius: 20px;
  padding: 2.5rem;
  height: auto;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: visible;
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

  @media (max-width: 700px) {
    width: 85%;
    padding: 2rem;
  }

  @media (max-width: 400px) {
    width: 90%;
    padding: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
`;

interface InputProps {
  $hasError?: boolean;
}

const Input = styled.input<InputProps>`
  font-size: 1rem;
  font-family: "Roboto", sans-serif;
  padding: 0.875rem 1rem;
  border: 2px solid ${(props) => (props.$hasError ? "#ef4444" : "#e5e7eb")};
  border-radius: 12px;
  color: #1f2937;
  background-color: #f9fafb;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${(props) => (props.$hasError ? "#ef4444" : "#016532")};
    background-color: white;
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(239, 68, 68, 0.1)" : "rgba(1, 101, 50, 0.1)"};
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  @media (max-width: 500px) {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  font-family: "Roboto", sans-serif;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: "⚠";
    font-size: 0.75rem;
  }
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;

  @media (max-width: 500px) {
    gap: 0.75rem;
  }
`;

const RadioCard = styled.label<{ checked: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid ${(props) => (props.checked ? "#016532" : "#e5e7eb")};
  border-radius: 12px;
  background-color: ${(props) => (props.checked ? "#f0fdf4" : "#f9fafb")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    border-color: ${(props) => (props.checked ? "#016532" : "#9ca3af")};
    background-color: ${(props) => (props.checked ? "#f0fdf4" : "#f3f4f6")};
  }

  input {
    display: none;
  }
`;

const RadioIcon = styled.div<{ checked: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid ${(props) => (props.checked ? "#016532" : "#d1d5db")};
  border-radius: 50%;
  background-color: ${(props) => (props.checked ? "#016532" : "transparent")};
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
  font-family: "Roboto", sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
`;

const RadioDescription = styled.div`
  font-family: "Roboto", sans-serif;
  font-size: 0.75rem;
  color: #6b7280;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const CheckboxInput = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #016532;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AssistantIcon = styled(FaRobot)`
  color: #016532;
  font-size: 1rem;
`;

const FieldArrayContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const AssistantTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
`;

const ColumnHeader = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  text-align: left;
  display: flex;
  align-items: center;
  height: 2.5rem;
`;

const CenteredColumnHeader = styled(ColumnHeader)`
  text-align: center;
  justify-content: center;
`;

const AddAssistantRow = styled.div`
  display: grid;
  grid-template-columns: 32px 0.8fr 1.3fr 100px 50px;
  gap: 0.6rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-radius: 8px;
    margin: 0 -0.5rem;
    padding: 0.75rem 0.5rem;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 800px) {
    grid-template-columns: 28px 1fr 1fr 60px 50px;
    gap: 0.4rem;
  }
`;

const FeedbackAssistantRow = styled.div`
  display: grid;
  grid-template-columns: 10px 0.7fr 1fr 50px 50px;
  gap: 0.9rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    border-radius: 8px;
    margin: 0 -0.5rem;
    padding: 0.75rem 0.5rem;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 800px) {
    grid-template-columns: 28px 1fr 1fr 60px 50px;
    gap: 0.4rem;
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 32px 0.8fr 1.3fr 70px 50px;
  gap: 0.6rem;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #cbd5e1;
  align-items: center;

  @media (max-width: 800px) {
    grid-template-columns: 28px 1fr 1fr 60px 50px;
    gap: 0.4rem;
  }
`;

const SmallInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-height: 2.5rem;
  justify-content: center;
`;

const SmallInput = styled(Input)<InputProps>`
  font-size: 0.875rem;
  padding: 0.5rem 0.6rem;
  margin: 0;
  height: 2.5rem;
  box-sizing: border-box;

  /* 针对数字输入框的特殊样式 */
  &[type="number"] {
    padding: 0.5rem 0.4rem;
    text-align: center;
  }

  @media (max-width: 800px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.5rem;
    height: 2.25rem;
    
    &[type="number"] {
      padding: 0.4rem 0.3rem;
    }
  }

  @media (max-width: 600px) {
    font-size: 0.7rem;
    height: 2rem;
    
    &[type="number"] {
      padding: 0.3rem 0.2rem;
    }
  }
`;

const SmallTextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-height: 2.5rem;
  justify-content: center;
`;


const BotFieldErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.7rem;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  line-height: 1.2;
  margin-top: 0.2rem;
  z-index: 1;
`;

const ToggleSwitchContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  // align-items: center;
  position: relative;
  gap: 0;
  height: 2.5rem;

  @media (max-width: 400px) {
    width: 100%;
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
    background-color: #d1d5db;
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
    background-color: #016532;

    &::before {
      transform: translateX(1.5rem);
    }
  }

  @media (max-width: 800px) {
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
`;

const RemoveIcon = styled(IoIosRemoveCircleOutline)`
  font-size: 1.5rem;
  color: #ef4444;
  cursor: pointer;
  justify-self: center;
  align-self: center;
  transition: all 0.2s ease;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #dc2626;
    transform: scale(1.1);
  }

  @media (max-width: 400px) {
    font-size: 1.2rem;
  }
`;

const AddIconContainer = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 1.3fr 70px 60px;
  gap: 0.6rem;
  margin-top: 1rem;
  align-items: center;

  @media (max-width: 800px) {
    grid-template-columns: 28px 1fr 1fr 60px 50px;
    gap: 0.4rem;
  }
`;

const AddIcon = styled(IoIosAddCircleOutline)`
  font-size: 1.5rem;
  color: #10b981;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 1.5rem;

  &:hover {
    color: #059669;
    transform: scale(1.1);
  }

  @media (max-width: 800px) {
    font-size: 1.2rem;
    height: 2.25rem;
  }

  @media (max-width: 400px) {
    font-size: 1rem;
    height: 2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  justify-content: center;
  height: 50px;

  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
  }
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
                .min(1, "Minimum value is 1")
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
  fromSidebar?: boolean; // New prop
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
    clearContextTime?: string; // 添加clearContextTime字段
    groupMode?: "free" | "feedback";
    // Include both possible field names for the bot list

    chatBots?: ChatBotVO[];
    chatBotFeedback?:ChatBotFeedbackVO;
    
  };
}

// Extend the FormBot interface to include status and botId
interface FormBotWithStatus extends FormBot {
  botId?: number; // Only present for existing bots
  status: "new" | "modified" | "unchanged"; // Track status for edit operations
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
  const [originalBots, setOriginalBots] = useState<
    ChatBotVO[]
  >([]);
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
        msgCountInterval: 1,
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
        // Handle edit group logic
        await handleEditGroup(values);
      } else if (!effectiveIsModify) {
        // Handle create group logic
        const submittedValues = {
          ...values,
          bots: showAssistants ? values.bots : [], // Empty array if assistants not enabled
        };
        await handleAddGroup(submittedValues, onClose, showAssistants);
      } else {
        alert("You don't have permission to modify this room");
      }
    },
  });

  useEffect(() => {
    const fetchRoomInfo = async () => {
      // Only fetch room info when modifying and not from sidebar
      if (
        effectiveIsModify &&
        !fromSidebar &&
        !apiRequestMade &&
        currentGroupId
      ) {
        try {
          setApiRequestMade(true);

          // Only fetch user role when modifying
          if (shouldCheckRole) {
            const roleResponse = await fetchUserRole(currentGroupId);
            setUserRole(roleResponse);
          }

          // ... rest of the fetch logic ...
        } catch (error: any) {
          console.error("Error message:", error.message);
          setApiRequestMade(false);
        }
      }
    };

    fetchRoomInfo();
  }, [effectiveIsModify, currentGroupId, apiRequestMade, fromSidebar]);

  // Reset state and enforce isModify=false when coming from sidebar
  useEffect(() => {
    if (fromSidebar) {
      setApiRequestMade(false);
      setShowAssistants(false);
      setOriginalBots([]);
      setUserRole(null);
      formik.resetForm();
    }
  }, [fromSidebar]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setShowAssistants(false);
      setApiRequestMade(false);
      setOriginalBots([]);
      setUserRole(null);
      formik.resetForm();
    };
  }, []);

  // Reset state when effectiveIsModify or groupId changes
  useEffect(() => {
    setApiRequestMade(false);
    setShowAssistants(false);
    setOriginalBots([]);
    setUserRole(null);
    formik.resetForm();
  }, [effectiveIsModify, propGroupId]);

  const fetchUserRole = async (groupId: number) => {
    try {
      const response = await apiClient.get(
        `/v1/group/get_role_in_group?groupId=${groupId}`
      );
      if (response.data.code === 200) {
        return response.data.data; // "ADMIN" or "MEMBER"
      }else{
        alert(response.data.message || "Failed to fetch user role.");
      }
      return null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  // MODIFIED: function to handle edit group submission
  const handleEditGroup = async (values: any) => {
    if (!currentGroupId) {
      console.error("Cannot edit group: groupId is undefined");
      return;
    }

    try {
      // Debug log the form values
      console.log("Edit form values:", values);

      // Separate bots based on their status
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

      // Find deleted bots by comparing original bots with current bots
      const currentBotIds = values.bots
        .filter((bot: FormBotWithStatus) => bot.botId)
        .map((bot: FormBotWithStatus) => bot.botId);

      // Calculate which bots were deleted (for debugging)
      const deletedBotIds = originalBots
        .filter((bot) => !currentBotIds.includes(bot.botId))
        .map((bot) => bot.botId);

      console.log("Deleted bot IDs:", deletedBotIds);

      // For API, we need ALL existing bots that haven't been deleted in modifyChatBotVOS
      // This includes both modified and unchanged bots
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
      const feedbackBotVO: ChatBotFeedbackVO | undefined =
        values.groupMode === "feedback"
            ? {
                  botId: values.feedbackBot.botId,
                  botName: values.feedbackBot.name || "",
                  botPrompt: values.feedbackBot.prompt || "",
                  msgCountInterval:
                      typeof values.feedbackBot.msgCountInterval === "number"
                          ? values.feedbackBot.msgCountInterval
                          : parseInt(String(values.feedbackBot?.msgCountInterval ?? 0), 10),
                  timeInterval:
                      typeof values.feedbackBot?.timeInterval === "number"
                          ? values.feedbackBot.timeInterval
                          : parseInt(String(values.feedbackBot?.timeInterval ?? 0), 10),
              }
            : undefined;
      // Per API documentation
      const requestPayload = {
        groupId: Number(currentGroupId), // Ensure groupId is a number
        groupName: values.roomName,
        groupDescription: values.roomDescription,
        // Include password only for private rooms or if it was previously set
        ...(values.roomType === "0" ? { password: values.roomPassword } : {}),
        // Include bots only if assistants are enabled
        ...(values.groupMode === "feedback" 
          ? {
            modifyChatBotFeedbackVO: feedbackBotVO,
            }:{}),
        ...(showAssistants && values.groupMode === "free"
          ? {
              addChatBotVOList: addedBots,
              modifyChatBotVOS: existingBots, // All existing bots that haven't been deleted
            }
          : {
              addChatBotVOList: [],
              modifyChatBotVOS: [],
            }),
      };

      console.log("Edit request payload:", requestPayload);

      const response = await apiClient.post(
        "/v1/group/edit_group_info",
        requestPayload
      );

      console.log("Edit response:", response.data);

      if (response.data.code === 200) {
        // Verify the update by fetching the updated data
        try {
          const verifyResponse = await apiClient.get(
            `/v1/group/get_group_info?groupId=${currentGroupId}`
          );
          console.log("Verification response:", verifyResponse.data);
        } catch (verifyError) {
          console.error("Failed to verify update:", verifyError);
        }

        alert("Room successfully updated!");
        onClose();
      } else {
        alert(response.data.message || "Failed to update room");
      }
    } catch (error: any) {
      console.error("Error updating group:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
      
    }
  };

  // Helper function to check if any bot fields are empty
  const hasBotErrors = () => {
    if (!showAssistants) return false;

    // Check for errors in the "bots" field
    if (
      formik.errors.bots &&
      typeof formik.errors.bots === "object" &&
      !Array.isArray(formik.errors.bots)
    ) {
      return true;
    }

    // Check for specific bot field errors
    if (Array.isArray(formik.errors.bots)) {
      return formik.errors.bots.some(
        (error) => error && typeof error === "object"
      );
    }

    return false;
  };

  // Toggle assistant checkbox handler
  const handleAssistantToggle = () => {
    setShowAssistants(!showAssistants);

    // If turning off assistants, we don't need to validate the bot fields
    if (showAssistants) {
      // Reset any bot-related errors when turning off assistants
      formik.setErrors({
        ...formik.errors,
        bots: undefined,
      });
    }
  };

  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (isModify && !apiRequestMade && currentGroupId) {
        try {
          setApiRequestMade(true);

          // First fetch user role
          const roleResponse = await fetchUserRole(currentGroupId);
          setUserRole(roleResponse); // Store the role
          const isAdmin = roleResponse === "ADMIN";

          const groupIdParam =
            typeof currentGroupId === "string"
              ? parseInt(currentGroupId, 10)
              : currentGroupId;

          const url = `/v1/group/get_group_info?groupId=${groupIdParam}`;

          try {
            const response = await apiClient.get<RoomInfoResponse>(url);

            if (
              response.status === 200 &&
              response.data.code === 200 &&
              response.data.data
            ) {
              const roomData = response.data.data;
              const botList = roomData.chatBots || [];
              setOriginalBots([...botList]);

              const hasBots = botList.length > 0;

              // Detect feedback mode via groupMode or presence of feedback bot info
              const feedbackInfo =
                (roomData as any).chatBotFeedbackVO ||
                roomData.chatBotFeedback;
              const isFeedbackMode =
                roomData.groupMode === "feedback" || !!feedbackInfo;

              let formattedBots: FormBotWithStatus[] = [];

              if (!isFeedbackMode) {
                if (hasBots) {
                  formattedBots = botList.map((bot) => ({
                    name: bot.botName,
                    prompt: bot.botPrompt,
                    context: bot.botContext,
                    adminOnly: bot.accessType === 0,
                    botId: bot.botId,
                    status: "unchanged",
                  }));

                  // Only show assistants section if user is admin
                  setShowAssistants(isAdmin && hasBots);
                } else {
                  formattedBots = [
                    {
                      name: "",
                      prompt: "",
                      context: 1,
                      adminOnly: false,
                      status: "new",
                    },
                  ];
                  setShowAssistants(false);
                }
              } else {
                // In feedback mode, do not show normal assistants
                setShowAssistants(false);
              }

              // Pre-fill form values
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
                            : parseInt(String(feedbackInfo.msgCountInterval), 10),
                        timeInterval:
                          typeof feedbackInfo.timeInterval === "number"
                            ? feedbackInfo.timeInterval
                            : parseInt(String(feedbackInfo.timeInterval), 10),
                        botId: feedbackInfo.botId,
                      }
                    : {
                        name: "",
                        prompt: "",
                        msgCountInterval: 1,
                        timeInterval: 1,
                        botId: undefined,
                      },
              });
            } else {
              console.error(
                "API returned successfully but with unexpected format or error code"
              );
            }
          } catch (apiError) {
            console.error("API request failed:", apiError);
            setApiRequestMade(false);
          }
        } catch (error: any) {
          console.error("Error message:", error.message);
          setApiRequestMade(false);
        }
      }
    };

    fetchRoomInfo();
  }, [isModify, currentGroupId, apiRequestMade, formik]);

  // MODIFIED: Track changes in bot fields to update their status
  const handleBotFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Call the standard formik handler to update the value
    formik.handleChange(e);

    // Get the current bot
    const bot = formik.values.bots[index];

    // If this is an existing bot (has botId), mark it as modified
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
    <Overlay>
      <Modal>
        <ModalHeader
          icon={MdGroup}
          title={effectiveIsModify ? "Edit Room" : "Create New Room"}
          onClose={onClose}
        />
        <FormikProvider value={formik}>
          <Form onSubmit={formik.handleSubmit}>
            <InputGroup>
              <Label htmlFor="roomName">Group Name</Label>
              <SmallInput
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
              {formik.touched.roomName && formik.errors.roomName && (
                <ErrorMessage>{formik.errors.roomName}</ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="roomDescription">Description</Label>
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
              {formik.touched.roomDescription &&
                formik.errors.roomDescription && (
                  <ErrorMessage>{formik.errors.roomDescription}</ErrorMessage>
                )}
            </InputGroup>

            <InputGroup>
              <Label>Group Type</Label>
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
                <Label htmlFor="roomPassword">Password</Label>
                <Input
                  id="roomPassword"
                  name="roomPassword"
                  type="password"
                  autoComplete="new-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.roomPassword}
                  $hasError={
                    !!(formik.touched.roomPassword && formik.errors.roomPassword)
                  }
                />
                {formik.touched.roomPassword && formik.errors.roomPassword && (
                  <ErrorMessage>{formik.errors.roomPassword}</ErrorMessage>
                )}
              </InputGroup>
            )}
            <InputGroup>
              <Label>Group Mode</Label>
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
              {formik.touched.groupMode && formik.errors.groupMode && (
                <ErrorMessage>{formik.errors.groupMode}</ErrorMessage>
              )}
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
                            <SmallInput
                              name={`bots[${index}].name`}
                              placeholder="Assistant Name"
                              value={bot.name}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
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
                            {formik.touched.bots?.[index]?.name &&
                              formik.errors.bots?.[index] &&
                              typeof formik.errors.bots[index] === "object" &&
                              (formik.errors.bots[index] as any).name && (
                                <BotFieldErrorMessage>
                                  {(formik.errors.bots[index] as any).name}
                                </BotFieldErrorMessage>
                              )}
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
                            {formik.touched.bots?.[index]?.prompt &&
                              formik.errors.bots?.[index] &&
                              typeof formik.errors.bots[index] === "object" &&
                              (formik.errors.bots[index] as any).prompt && (
                                <BotFieldErrorMessage>
                                  {(formik.errors.bots[index] as any).prompt}
                                </BotFieldErrorMessage>
                              )}
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
                            <SmallInput
                              type="number"
                              name={`bots[${index}].context`}
                              placeholder="Context"
                              value={bot.context}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                              min={1}
                              max={20}
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
                            {formik.touched.bots?.[index]?.context &&
                              formik.errors.bots?.[index] &&
                              typeof formik.errors.bots[index] === "object" &&
                              (formik.errors.bots[index] as any).context && (
                                <BotFieldErrorMessage>
                                  {(formik.errors.bots[index] as any).context}
                                </BotFieldErrorMessage>
                              )}
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
                  <ErrorMessage>All assistant fields are required</ErrorMessage>
                )}

                {typeof formik.errors.bots === "string" && (
                  <ErrorMessage>{formik.errors.bots}</ErrorMessage>
                )}
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
                  <ColumnHeader>Message Count Interval</ColumnHeader>
                  <ColumnHeader>Time Interval</ColumnHeader>
                </HeaderRow>

                <FeedbackAssistantRow>
                  <div />

                  <SmallInputContainer>
                    <SmallInput
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
                    {(formik.touched as any).feedbackBot?.name &&
                      (formik.errors.feedbackBot as any)?.name && (
                        <BotFieldErrorMessage>
                          {(formik.errors.feedbackBot as any).name}
                        </BotFieldErrorMessage>
                      )}
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
                    {(formik.touched as any).feedbackBot?.prompt &&
                      (formik.errors.feedbackBot as any)?.prompt && (
                        <BotFieldErrorMessage>
                          {(formik.errors.feedbackBot as any).prompt}
                        </BotFieldErrorMessage>
                      )}
                  </SmallTextareaContainer>

                  <SmallInputContainer>
                    <SmallInput
                      type="number"
                      name="feedbackBot.msgCountInterval"
                      placeholder="Message Count Interval"
                      value={
                        formik.values.feedbackBot?.msgCountInterval?.toString() ?? "1"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={1}
                      max={20}
                      $hasError={
                        !!(
                          (formik.touched as any).feedbackBot?.msgCountInterval &&
                          (formik.errors.feedbackBot as any)?.msgCountInterval
                        )
                      }
                    />
                    {(formik.touched as any).feedbackBot?.msgCountInterval &&
                      (formik.errors.feedbackBot as any)?.msgCountInterval && (
                        <BotFieldErrorMessage>
                          {(formik.errors.feedbackBot as any).msgCountInterval}
                        </BotFieldErrorMessage>
                      )}
                  </SmallInputContainer>

                  <SmallInputContainer>
                    <SmallInput
                      type="number"
                      name="feedbackBot.timeInterval"
                      placeholder="Time Interval"
                      value={
                        formik.values.feedbackBot?.timeInterval?.toString() ?? "1"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={1}
                      max={30}
                      $hasError={
                        !!(
                          (formik.touched as any).feedbackBot?.timeInterval &&
                          (formik.errors.feedbackBot as any)?.timeInterval
                        )
                      }
                    />
                    {(formik.touched as any).feedbackBot?.timeInterval &&
                      (formik.errors.feedbackBot as any)?.timeInterval && (
                        <BotFieldErrorMessage>
                          {(formik.errors.feedbackBot as any).timeInterval}
                        </BotFieldErrorMessage>
                      )}
                  </SmallInputContainer>
                </FeedbackAssistantRow>
              </FieldArrayContainer>
            )}

            {(!effectiveIsModify || userRole === "ADMIN") && (
              <ButtonContainer>
                <Button
                  variant="cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" disabled={isSubmitting} type="submit">
                  {effectiveIsModify ? "Update Room" : "Create Room"}
                </Button>
              </ButtonContainer>
            )}
          </Form>
        </FormikProvider>
      </Modal>
    </Overlay>
  );
};

export default CreateRoomComponent;
