import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
import type { MultiAgentConfigVO } from "../../types/multiagent";
import Button from "../ui/Button";
import AutoResizeTextarea from "../ui/Textarea";
import { useUserRole, useEditGroup, useGroupInfo } from "../../hooks/queries/useGroup";
import { 
  useProfilePresets, 
  useActionTypes, 
  useBatchUpdateConfig,
  useGlobalScript,
  useProfiles,
  useActionConfig,
} from "../../hooks/queries/useMultiAgent";
import { 
  GlobalScriptSection, 
  ProfilesSection, 
  ActionConfigSection 
} from "./MultiAgentConfig";
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
  z-index: 11001;
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


const MultiAgentContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--white);
  border-radius: var(--radius-12);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  box-sizing: border-box;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
    padding: 1.5rem;
  }
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
  margin-top: var(--space-1);

  /* tablet >= 768px - default 2 columns */
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

// 3-column radio group for Group Mode (3 options)
const RadioGroupThreeCol = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2);
  margin-top: var(--space-1);

  /* tablet >= 768px - 3 columns for 3 options */
  @media (min-width: 48rem) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-3);
    margin-top: 0.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 1fr 1fr 1fr;
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
  font-family: var(--font-roboto);
  color: var(--color-text);
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
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;
  border-radius: 8px;

  &:hover {
    background-color: var(--blue-100);
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
  padding: 0.5rem 0.5rem;
  border-bottom: 1px solid var(--gray-200);
  transition: background-color 0.2s ease;
  border-radius: 8px;

  &:hover {
    background-color: var(--blue-100);
  }

  &:last-child {
    border-bottom: none;
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 28px 1fr 1fr 60px 60px;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 32px 0.8fr 1.3fr 80px 80px;
    gap: 0.6rem;
    padding: 0.75rem 0.5rem;
  }
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr 1fr 50px 50px;
  gap: 0.3rem;
  padding: 0.5rem 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-300);
  align-items: center;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 28px 1fr 1fr 60px 60px;
    gap: 0.4rem;
    padding: 0.75rem 0.5rem;
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

  /* mobile - 基础样式 */
  span {
    width: 2rem;
    height: 1rem;
    background-color: var(--gray-300);
    border-radius: 0.5rem;
    position: relative;
    transition: background-color 0.3s ease;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0.125rem;
      width: 0.75rem;
      height: 0.75rem;
      background-color: white;
      border-radius: 50%;
      transform: translateY(-50%);
      transition: transform 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  input:checked + span {
    background-color: var(--emerald-green);

    &::before {
      transform: translateY(-50%) translateX(1rem);
    }
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    span {
      width: 2.5rem;
      height: 1.25rem;
      border-radius: 0.625rem;

      &::before {
        width: 1rem;
        height: 1rem;
        left: 0.125rem;
      }
    }

    input:checked + span::before {
      transform: translateY(-50%) translateX(1.25rem);
    }
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    span {
      width: 3rem;
      height: 1.5rem;
      border-radius: 0.75rem;

      &::before {
        width: 1.25rem;
        height: 1.25rem;
        left: 0.125rem;
      }
    }

    input:checked + span::before {
      transform: translateY(-50%) translateX(1.5rem);
    }
  }
`;

// 提示组件样式
const Tooltip = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100000;
  
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  
  background-color: var(--slate-grey);
  color: var(--white);
  border-radius: var(--radius-8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;
  
  max-width: 300px;
  line-height: 1.5;
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
  display: flex;
  padding: 0.75rem 0.5rem 0;
  margin-top: 0;
`;

const AddIcon = styled(IoIosAddCircleOutline)`
  font-size: 1.2rem;
  color: var(--emerald-green);
  cursor: pointer;
  transition: all 0.2s ease;
  height: 2rem;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    color: var(--emerald-green-dark);
    transform: scale(1.1);
  }

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: 1.5rem;
    height: 1.5rem;
    width: 28px;
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: 1.5rem;
    height: 1.5rem;
    width: 32px;
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
      .oneOf(["free", "feedback", "multiagent"], "Invalid group mode")
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

    // MultiAgent Config validation (only in multiagent mode)
    multiAgentConfig: Yup.object().when("groupMode", {
      is: "multiagent",
      then: (schema) =>
        schema.shape({
          profiles: Yup.array()
            .test(
              "has-manager",
              "At least one MANAGER is required",
              (profiles: any) => profiles?.some((p: any) => p.roleType === 0)
            )
            .test(
              "has-assistant",
              "At least one ASSISTANT is required",
              (profiles: any) => profiles?.some((p: any) => p.roleType === 1)
            ),
          globalScript: Yup.object().shape({
            scriptContent: Yup.string().required("Global Script is required"),
          }),
        }),
      otherwise: (schema) => schema.notRequired(),
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
  groupMode: "free" | "feedback" | "multiagent";
  chatBotVOList: ChatBotVO[];
  chatBotFeedbackVO?: ChatBotFeedbackVO;
  multiAgentConfig?: {
    globalScript: {
      scriptContent: string;
      interactionPolicy?: {
        turnTaking?: string;
        maxTurns?: number;
        maxDuration?: number;
        terminationCondition?: string;
      };
      roleConstraints?: Array<{
        role: string;
        canInterrupt?: boolean;
        maxSpeakingTime?: number;
      }>;
    };
    profiles: Array<{
      roleType: 0 | 1;
      roleName: string;
      description?: string;
      presetTemplateId: string;
      accessType: number;
    }>;
    actionConfig?: {
      enabledActionCodes: number[];
      customTemplates?: Record<number, string>;
    };
  };
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
    groupMode?: "free" | "feedback" | "multiagent";
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
  const [, setUserRole] = useState<string | null>(
    fromSidebar ? "ADMIN" : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [showRemoveBotTooltip, setShowRemoveBotTooltip] = useState(false);
  
  // Ref to store original multiagent profiles for comparison
  const originalMultiAgentProfilesRef = useRef<any[]>([]);

  
  // Default empty multiAgentConfig for non-multiagent modes
  const emptyMultiAgentConfig: MultiAgentConfigVO = {
    globalScript: {
      scriptContent: "",
      interactionPolicy: {
        turnTaking: "round_robin",
        maxTurns: undefined,
        maxDuration: undefined,
        terminationCondition: "",
      },
      roleConstraints: [],
    },
    profiles: [
      {
        botName: "",
        roleType: 0,
        roleName: "",
        description: "",
        presetTemplateId: "",
        accessType: 1,
      },
      {
        botName: "",
        roleType: 1,
        roleName: "",
        description: "",
        presetTemplateId: "",
        accessType: 1,
      },
    ],
    actionConfig: {
      enabledActionCodes: [],
      customTemplates: {},
    },
  };

  // Determine the groupId to use - from props or URL params
  const currentGroupId =
    propGroupId || (urlGroupId ? parseInt(urlGroupId, 10) : undefined);

  // Use React Query hooks
  const { data: userRoleData } = useUserRole(shouldCheckRole ? currentGroupId : undefined);
  const editGroupMutation = useEditGroup();
  const { data: groupInfoData } = useGroupInfo(currentGroupId);
  const { data: profilePresets } = useProfilePresets();
  const { data: actionTypes } = useActionTypes();
  const batchUpdateConfigMutation = useBatchUpdateConfig(currentGroupId || '');
  
  // Load existing multiagent config in edit mode (only when editing existing group)
  const shouldLoadMultiAgentConfig = effectiveIsModify && !!currentGroupId;
  const { data: existingGlobalScript, isLoading: isLoadingGlobalScript } = useGlobalScript(
    currentGroupId || '', 
    shouldLoadMultiAgentConfig
  );
  const { data: existingProfiles, isLoading: isLoadingProfiles } = useProfiles(
    currentGroupId || '', 
    shouldLoadMultiAgentConfig
  );
  const { data: existingActionConfig, isLoading: isLoadingActionConfig } = useActionConfig(
    currentGroupId || '', 
    shouldLoadMultiAgentConfig
  );

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
    } else if (values.groupMode === "multiagent") {
      // Validate: at least one MANAGER and one ASSISTANT
      const profiles = values.multiAgentConfig?.profiles || [];
      console.log("[Create] Validating profiles:", profiles);
      
      const nonStateAnalyzerProfiles = profiles.filter((p: any) => p.roleType !== 2);
      console.log("[Create] Non-StateAnalyzer profiles:", nonStateAnalyzerProfiles);
      
      const hasManager = nonStateAnalyzerProfiles.some((p: any) => p.roleType === 0);
      const hasAssistant = nonStateAnalyzerProfiles.some((p: any) => p.roleType === 1);
      
      console.log("[Create] Validation result:", { hasManager, hasAssistant, total: nonStateAnalyzerProfiles.length });
      
      if (!hasManager) {
        console.warn("[Create] Validation failed: No MANAGER found");
        alert("At least one MANAGER is required");
        setIsSubmitting(false);
        return;
      }
      
      if (!hasAssistant) {
        console.warn("[Create] Validation failed: No ASSISTANT found");
        alert("At least one ASSISTANT is required");
        setIsSubmitting(false);
        return;
      }
      
      console.log("[Create] Validation passed");
      
      requestPayload = {
        groupName: values.roomName,
        groupDescription: values.roomDescription,
        groupType: groupTypeValue,
        ...(groupTypeValue === 0 ? { password: values.roomPassword } : {}),
        groupMode: "multiagent",
        chatBotVOList: [],
        multiAgentConfig: values.multiAgentConfig || undefined,
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
      multiAgentConfig: emptyMultiAgentConfig,
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

      if (effectiveIsModify && userRoleData === "ADMIN") {
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
    setIsFormInitialized(false);
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

      // Step 1: Edit basic group info
      const requestPayload: any = {
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
          : {}),
      };

      console.log("Edit request payload:", requestPayload);

      const response = await editGroupMutation.mutateAsync(requestPayload);

      console.log("Edit response:", response);

      if (response.code !== 200) {
        alert(response.message || "Failed to update room");
        return;
      }

      // Step 2: For multiagent mode, use batchUpdateConfig to update Agent configuration
      if (values.groupMode === "multiagent" && values.multiAgentConfig) {
        console.log("Updating multiagent config via batchUpdateConfig...");
        
        const { globalScript, profiles, actionConfig } = values.multiAgentConfig;
        
        // Ensure interactionPolicy is an object, not a string
        let interactionPolicy = globalScript?.interactionPolicy;
        if (typeof interactionPolicy === 'string') {
          try {
            interactionPolicy = JSON.parse(interactionPolicy);
          } catch (e) {
            console.warn('Failed to parse interactionPolicy string:', e);
            interactionPolicy = {};
          }
        }
        
        // 1. Filter out State Analyzer (roleType === 2)
        console.log("[Edit] Validating profiles:", profiles);
        const nonStateAnalyzerProfiles = profiles?.filter((p: any) => p.roleType !== 2) || [];
        console.log("[Edit] Non-StateAnalyzer profiles:", nonStateAnalyzerProfiles);
        
        // Validate: at least one MANAGER and one ASSISTANT
        const hasManager = nonStateAnalyzerProfiles.some((p: any) => p.roleType === 0);
        const hasAssistant = nonStateAnalyzerProfiles.some((p: any) => p.roleType === 1);
        
        console.log("[Edit] Validation result:", { hasManager, hasAssistant, total: nonStateAnalyzerProfiles.length });
        
        if (!hasManager || !hasAssistant) {
          const missingRole = !hasManager ? "MANAGER" : "ASSISTANT";
          console.warn(`[Edit] Validation failed: No ${missingRole} found, restoring original profiles`);
          alert(`At least one ${missingRole} is required. Changes have been reverted.`);
          
          // Restore original profiles to form
          await formik.setFieldValue('multiAgentConfig.profiles', originalMultiAgentProfilesRef.current);
          console.log("[Edit] Restored original profiles:", originalMultiAgentProfilesRef.current);
          
          setIsSubmitting(false);
          return;
        }
        
        console.log("[Edit] Validation passed");
        
        // 2. Calculate deleted bot IDs (exist in original but not in current)
        const currentBotIds = new Set(nonStateAnalyzerProfiles.map((p: any) => p.botId).filter(Boolean));
        const deletedBotIds = originalMultiAgentProfilesRef.current
          .filter((p: any) => p.botId && !currentBotIds.has(p.botId))
          .map((p: any) => p.botId);
        
        // 3. Only include changed profiles (new profiles or modified existing profiles)
        const changedProfiles = nonStateAnalyzerProfiles.filter((profile: any) => {
          // New profile (no botId) - always include
          if (!profile.botId) {
            return true;
          }
          
          // Find original profile by botId
          const originalProfile = originalMultiAgentProfilesRef.current.find(
            (p: any) => p.botId === profile.botId
          );
          
          // If not found in original, it's a new profile (should have been caught above, but just in case)
          if (!originalProfile) {
            return true;
          }
          
          // Compare fields to detect changes
          const hasChanges = 
            profile.botName !== originalProfile.botName ||
            profile.roleType !== originalProfile.roleType ||
            profile.roleName !== originalProfile.roleName ||
            profile.presetTemplateId !== originalProfile.presetTemplateId ||
            profile.accessType !== originalProfile.accessType ||
            profile.description !== originalProfile.description;
          
          return hasChanges;
        });
        
        console.log(`Profiles: total=${profiles?.length || 0}, non-SA=${nonStateAnalyzerProfiles.length}, changed=${changedProfiles.length}, deleted=${deletedBotIds.length}`);
        
        // Build batch request
        const batchRequest: any = {
          globalScript: {
            ...globalScript,
            interactionPolicy: interactionPolicy || {},
          },
          actionConfig,
        };
        
        // Include profiles if there are changes
        if (changedProfiles.length > 0) {
          batchRequest.profiles = changedProfiles.map((profile: any) => ({
            botId: profile.botId,
            botName: profile.botName,
            roleType: profile.roleType,
            roleName: profile.roleName,
            presetTemplateId: profile.presetTemplateId,
            accessType: profile.accessType,
          }));
        }
        
        // Include deleted bot IDs if any
        if (deletedBotIds.length > 0) {
          batchRequest.deletedBotIds = deletedBotIds;
        }

        const batchResult = await batchUpdateConfigMutation.mutateAsync(batchRequest);
        console.log("Batch update result:", batchResult);

        // Check for partial failures
        const failedProfiles = batchResult.profiles?.filter((p: any) => !p.success) || [];
        if (failedProfiles.length > 0) {
          const errorMessages = failedProfiles.map((p: any) => 
            `${p.oldBotId || 'New'}: ${p.errorMessage || 'Unknown error'}`
          ).join('\n');
          alert(`Some profiles failed to update:\n${errorMessages}`);
          return;
        }

        if (!batchResult.globalScriptUpdated) {
          console.warn("Global script update may have failed");
        }
      }

      // Verify by checking the group info query data
      if (groupInfoData) {
        console.log("Verification response:", groupInfoData);
      }

      alert("Room successfully updated!");
      onClose();
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
    // Only initialize form when editing existing group and data is loaded
    if (!effectiveIsModify || isFormInitialized || !currentGroupId || groupInfoData?.code !== 200) {
      return;
    }
    
    const roomData = groupInfoData.data;
    if (!roomData) return;
    
    const isMultiAgentMode = roomData.groupMode === "multiagent";
    
    // For multiagent mode, wait for config data to load before initializing
    if (isMultiAgentMode) {
      const isMultiAgentDataLoaded = 
        !isLoadingGlobalScript && 
        !isLoadingProfiles && 
        !isLoadingActionConfig;
      
      if (!isMultiAgentDataLoaded) {
        return; // Wait for multiagent config data to load
      }
    }
    
    setIsFormInitialized(true);
    
    const botList = roomData.chatBots || [];
    setOriginalBots([...botList]);
    
    const hasBots = botList.length > 0;
    const isAdmin = userRoleData === "ADMIN";
    
    const feedbackInfo = (roomData as any).chatBotFeedbackVO || roomData.chatBotFeedback;
    const isFeedbackMode = roomData.groupMode === "feedback" || !!feedbackInfo;
    
    let formattedBots: FormBotWithStatus[] = [];
    
    if (!isFeedbackMode && !isMultiAgentMode) {
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
    
    // Build multiAgentConfig from loaded data
    // Ensure interactionPolicy is an object, not a string
    let loadedInteractionPolicy = existingGlobalScript?.interactionPolicy;
    if (typeof loadedInteractionPolicy === 'string') {
      try {
        loadedInteractionPolicy = JSON.parse(loadedInteractionPolicy);
      } catch (e) {
        console.warn('Failed to parse loaded interactionPolicy string:', e);
        loadedInteractionPolicy = {};
      }
    }
    
    // Filter out State Analyzer (roleType === 2) from profiles
    const filteredExistingProfiles = Array.isArray(existingProfiles) 
      ? existingProfiles.filter((p: any) => p.roleType !== 2)
      : [];
    
    const multiAgentConfig = isMultiAgentMode
      ? {
          globalScript: {
            scriptContent: existingGlobalScript?.scriptContent || '',
            interactionPolicy: loadedInteractionPolicy || {},
          },
          profiles: filteredExistingProfiles,
          actionConfig: existingActionConfig
            ? {
                enabledActionCodes: existingActionConfig.enabledActionCodes || [],
                customTemplates: existingActionConfig.customTemplates || {},
              }
            : {
                enabledActionCodes: [],
                customTemplates: {},
              },
        }
      : emptyMultiAgentConfig;
    
    formik.setValues({
      roomName: roomData.groupName,
      roomDescription: roomData.groupDescription || "",
      roomType: roomData.groupType.toString(),
      groupMode: isFeedbackMode ? "feedback" : isMultiAgentMode ? "multiagent" : "free",
      roomPassword: roomData.password || "",
      bots: isAdmin && !isFeedbackMode && !isMultiAgentMode ? formattedBots : [],
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
      multiAgentConfig,
    });
    
    // Store original profiles for later comparison (excluding State Analyzer)
    if (isMultiAgentMode) {
      originalMultiAgentProfilesRef.current = JSON.parse(JSON.stringify(filteredExistingProfiles));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsModify, currentGroupId, isFormInitialized, groupInfoData, userRoleData, existingGlobalScript, existingProfiles, existingActionConfig, isLoadingGlobalScript, isLoadingProfiles, isLoadingActionConfig]);

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

  const modalContent = (
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
                  disabled={shouldCheckRole && userRoleData !== "ADMIN"}
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
              <RadioGroupThreeCol>
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

                <RadioCard
                  checked={formik.values.groupMode === "multiagent"}
                  disabled={effectiveIsModify}
                >
                  <input
                    type="radio"
                    name="groupMode"
                    value="multiagent"
                    checked={formik.values.groupMode === "multiagent"}
                    onChange={(e) => {
                      console.log("[groupMode] changed to:", e.target.value);
                      formik.handleChange(e);
                    }}
                    disabled={effectiveIsModify}
                  />
                  <RadioIcon checked={formik.values.groupMode === "multiagent"} />
                  <RadioContent>
                    <RadioTitle>MultiAgent Mode</RadioTitle>
                    <RadioDescription>Multi-party AI discussion</RadioDescription>
                  </RadioContent>
                </RadioCard>
              </RadioGroupThreeCol>
              <ErrorText $visible={!!(formik.touched.groupMode && formik.errors.groupMode)}>
                {(formik.touched.groupMode && formik.errors.groupMode) ? formik.errors.groupMode : " "}
              </ErrorText>
            </InputGroup>
            
            {(!effectiveIsModify || userRoleData === "ADMIN") && (formik.values.groupMode === "free") &&(
              <CheckboxContainer>
                <CheckboxInput
                  type="checkbox"
                  id="ai-assistant-toggle"
                  checked={showAssistants}
                  onChange={handleAssistantToggle}
                />
                <CheckboxLabel htmlFor="ai-assistant-toggle">
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
                            data-testid="remove-bot-btn"
                            title={formik.values.bots.length <= 1 ? "Uncheck 'Add AI Assistant(s)' to remove all bots" : "Remove this bot"}
                            onClick={() => {
                              if (formik.values.bots.length > 1) {
                                arrayHelpers.remove(index);
                              } else {
                                // 只剩一个 Bot 时显示提示
                                setShowRemoveBotTooltip(true);
                                setTimeout(() => {
                                  setShowRemoveBotTooltip(false);
                                }, 3000);
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
                              {(formik.errors.bots?.[index] as any)?.name || " "}
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
                              {(formik.errors.bots?.[index] as any)?.prompt || " "}
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
                              min={1}
                              max={20}
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
                          data-testid="add-bot-btn"
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

            {(!effectiveIsModify || userRoleData === "ADMIN") &&
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
                      min={2}
                      max={20}
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
                      min={1}
                      max={30}
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

            {/* MultiAgent Configuration */}
            {formik.values.groupMode === "multiagent" && (
              <MultiAgentContainer>
                <GlobalScriptSection disabled={isSubmitting} compact />
                <ProfilesSection 
                  disabled={isSubmitting} 
                  presetTemplates={profilePresets || []} 
                  compact
                />
                <ActionConfigSection 
                  disabled={isSubmitting} 
                  actionTypes={actionTypes || []} 
                  compact
                />
              </MultiAgentContainer>
            )}

            {(!effectiveIsModify || userRoleData === "ADMIN") && (
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
                  <Button 
                    disabled={isSubmitting} 
                    type="button"
                    onClick={() => {
                      // Force validate multiagent config before submit
                      if (formik.values.groupMode === 'multiagent') {
                        const profiles = formik.values.multiAgentConfig?.profiles || [];
                        console.log('[Pre-submit check] profiles:', profiles);
                        
                        const nonStateAnalyzerProfiles = profiles.filter((p: any) => p.roleType !== 2);
                        const hasManager = nonStateAnalyzerProfiles.some((p: any) => p.roleType === 0);
                        const hasAssistant = nonStateAnalyzerProfiles.some((p: any) => p.roleType === 1);
                        
                        console.log('[Pre-submit check] result:', { hasManager, hasAssistant, total: nonStateAnalyzerProfiles.length });
                        
                        if (!hasManager || !hasAssistant) {
                          const missingRole = !hasManager ? 'MANAGER' : 'ASSISTANT';
                          console.warn(`[Pre-submit] Validation failed: No ${missingRole}, restoring...`);
                          
                          // Restore original profiles for edit mode
                          if (effectiveIsModify && originalMultiAgentProfilesRef.current.length > 0) {
                            formik.setValues({
                              ...formik.values,
                              multiAgentConfig: {
                                ...formik.values.multiAgentConfig,
                                profiles: [...originalMultiAgentProfilesRef.current],
                              },
                            });
                            console.log('[Pre-submit] Restored profiles:', originalMultiAgentProfilesRef.current);
                            alert(`At least one ${missingRole} is required. Changes have been reverted.`);
                          } else {
                            alert(`At least one ${missingRole} is required`);
                          }
                          
                          formik.setFieldTouched('multiAgentConfig.profiles', true);
                          return;
                        }
                      }
                      
                      // Trigger form submit
                      formik.submitForm();
                    }}
                  >
                    {effectiveIsModify ? "Update Room" : "Create Room"}
                  </Button>
                </FixedButtonContainer>
              </ModalButtonContainer>
            )}
          </Form>
        </FormikProvider>
        </ModalContent>
      </Modal>
      
      {/* 删除 Bot 提示 */}
    </ModalBackdrop>
  );

  const tooltipContent = (
    <Tooltip $show={showRemoveBotTooltip}>
      Uncheck &quot;Add AI Assistant(s)&quot; to remove all bots
    </Tooltip>
  );

  // Handle MultiAgent config submit from panel
  return (
    <>
      {createPortal(modalContent, document.body)}
      {createPortal(tooltipContent, document.body)}
    </>
  );
};

export default CreateRoomComponent;
