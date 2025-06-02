import React, { useEffect, useState } from "react";
import { useFormik, FieldArray, FormikProvider, FormikValues } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import apiClient from "../loggedOut/apiClient";
import { useParams } from "react-router-dom";
import { useRoomContext } from "./RoomContext";

axios.defaults.baseURL = "https://112.74.92.135:443";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  position: relative;
  width: 75%;
  margin-top: 8vh;
  max-width: 50rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  height: auto;
  max-height: 80vh;
  overflow-x: visible;
  @media (max-width: 700px) {
    width: 85%;
    padding-left: 0.6rem;
  }

  @media (max-width: 400px) {
    width: 80%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    opacity: 0.7;
  }
`;

const StyledCross = styled(RxCross2)`
  color: black;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
`;

const Input = styled.input`
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  background-color: white;
  outline: none;
  width: 80%;
  margin-top: 0.3rem;
  margin-bottom: 1.5rem;

  &:focus {
    border-color: #4ade80;
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.5);
  }

  @media (max-width: 700px) {
    width: 96%;
  }
`;

const Textarea = styled.textarea`
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  background-color: white;
  outline: none;
  width: 80%;
  margin-top: 0.3rem;
  margin-bottom: 1.5rem;
  resize: vertical;
  height: 80px; /* Adjust the height as needed */

  &:focus {
    border-color: #4ade80;
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.5);
  }

  @media (max-width: 700px) {
    width: 96%;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20%;
  margin: 1vh 0;

  @media (max-width: 500px) {
    gap: 10%;
  }
`;

const RadioTextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;

  input {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background-color: #757575;
    cursor: pointer;

    &:checked {
      background-color: #016532;
    }
  }
`;

const RadioOptionDesc = styled.span`
  font-size: 0.875rem;
  color: #6b7280;

  @media (max-width: 500px) {
    font-size: 0.7rem;
  }
`;

const CheckboxLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  margin: 1vh 0;

  input {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.25rem;
    background-color: #016532;
    border: none;
    outline: none;
    cursor: pointer;
  }
`;

const FieldArrayContainer = styled.div`
  max-height: 25vh;
  overflow-y: auto;
  overflow-x: visible;
  padding: 0.75rem;
  @media (max-width: 700px) {
    padding: 0.3rem;
  }
`;

const AddAssistantRow = styled.div`
  display: grid;
  grid-template-columns: 2rem minmax(0, 1.5fr) minmax(0, 1.5fr) 6rem 4rem;
  align-items: center;

  margin-bottom: 1vh;
  @media (max-width: 700px) {
    width: 100%;
  }
  @media (max-width: 400px) {
    grid-template-columns: 2rem minmax(0, 3fr) minmax(0, 3fr) 2.5rem 3rem;
  }
`;

const ToggleSwitchContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  min-width: 6rem;
  gap: 0;
  position: relative;
  left: -5vw;

  @media (max-width: 400px) {
    width: 40%;
    min-width: none;
    left: 1vw;
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
    width: 2rem;
    height: 1rem;
    background-color: #d1d5db;
    border-radius: 1rem;
    position: relative;
    transition: background-color 0.3s ease;

    &::before {
      content: "";
      position: absolute;
      top: 0.15rem;
      left: 0.15rem;
      width: 0.7rem;
      height: 0.7rem;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }
  }

  input:checked + span {
    background-color: #016532;

    &::before {
      transform: translateX(1rem);
    }
  }

  @media (max-width: 400px) {
    width: 1.5rem;
    height: 0.8rem;
  }
`;

const RemoveIcon = styled(IoIosRemoveCircleOutline)`
  font-size: 1.5rem;
  color: #ef4444;
  cursor: pointer;
  margin-right: -20rem;

  @media (max-width: 400px) {
    font-size: 1.1rem;
  }
`;

const AddIcon = styled(IoIosAddCircleOutline)`
  font-size: 1.5rem;
  color: #10b981;
  cursor: pointer;
  margin-top: 0.5rem;
  @media (max-width: 400px) {
    font-size: 1.1rem;
  }
`;

const SmallInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface StyledSpanProps {
  isadminlabel?: string;
}

const StyledSpan = styled.span<StyledSpanProps>`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;

  ${(props) =>
    props.isadminlabel &&
    `
    position: relative;
    top: -1.2vh;
  `}

  @media (max-width: 700px) {
    font-size: 0.5rem;
    ${(props) =>
      props.isadminlabel &&
      `
      position: relative;
      top: -0.8vh;
      left: 3vw;
    `}
  }

  @media (max-width: 400px) {
    font-size: 0.4rem;

    ${(props) =>
      props.isadminlabel &&
      `
      position: relative;
      
      left: -4vw;
    `}
  }
`;

interface SmallInputProps {
  hasError?: boolean;
}

const SmallInput = styled(Input)<SmallInputProps>`
  font-size: 0.9rem;
  padding: 0.5rem;
  margin: auto 0;
  width: 60%;
  border: 1px solid ${({ hasError }) => (hasError ? "red" : "#ccc")};
  &:focus {
    border-color: ${({ hasError }) => (hasError ? "red" : "#007BFF")};
  }

  @media (max-width: 800px) {
    width: 75%;
    font-size: 0.7rem;
  }
  @media (max-width: 600px) {
    width: 75%;
    font-size: 0.55rem;
  }
`;

const RightAlignedSmallInput = styled(SmallInput)`
  justify-self: end;
  width: 50%;
`;

const CreateButton = styled.button`
  width: 20%;
  background-color: black;
  color: white;
  font-size: 1rem;
  margin-top: 4vh;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  align-self: center;

  @media (max-width: 600px) {
    width: 35%;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 0.8rem;
  margin-top: -3vh;
  margin-bottom: 1vh;
`;

const validationSchema = (showAssistants: boolean) =>
  Yup.object().shape({
    roomName: Yup.string()
      .required("Room Name is required")
      .matches(
        /^[A-Za-z0-9 ]{1,20}$/,
        "Must be 1-20 characters long, supports uppercase and lowercase English letters and numbers"
      ),
    roomDescription: Yup.string()
      .required("Room Description is required")
      .max(200, "Room Description cannot exceed 200 characters"),
    roomType: Yup.string() // Changed to string to match form values
      .oneOf(["0", "1"], "Invalid group type") // Changed to string values
      .required("Room Type is required"),

    password: Yup.string().when("roomType", {
      is: (value: string) => value === "0", // Changed to "0" for private
      then: (schema) =>
        schema
          .required("Password is required for private rooms")
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
                  /^[A-Za-z0-9 ]{1,20}$/,
                  "Must be 1-20 characters long, supports uppercase and lowercase English letters and numbers"
                ),
              prompt: Yup.string()
                .required("Prompt is required")
                .max(400, "Prompt cannot exceed 400 characters"),
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
  });

// Define interface for bot data structure
interface ChatBotVO {
  accessType: number;
  botContext: number;
  botName: string;
  botPrompt: string;
}

// Define interface for form bot data
interface FormBot {
  name: string;
  prompt: string;
  context: number;
  adminOnly: boolean;
}

// Define interface for request payload
interface CreateGroupPayload {
  groupName: string;
  groupDescription: string;
  groupType: number;
  password?: string;
  chatBotVOList: ChatBotVO[];
}

interface CreateRoomComponentProps {
  onClose: () => void;
  isModify?: boolean;
  groupId?: number;
  fromSidebar?: boolean; // New prop
}

// Define the RoomInfoResponse interface at the appropriate scope
interface RoomInfoResponse {
  code: number;
  message: string;
  data?: {
    groupId: number;
    groupName: string;
    groupDescription: string;
    groupType: number;
    password?: string;
    // Include both possible field names for the bot list
    chatBotVOList?: Array<{
      botId: number;
      botName: string;
      botPrompt: string;
      botContext: number;
      accessType: number;
    }>;
    chatBots?: Array<{
      botId: number;
      botName: string;
      botPrompt: string;
      botContext: number;
      accessType: number;
    }>;
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
    Array<{
      botId: number;
      botName: string;
      botPrompt: string;
      botContext: number;
      accessType: number;
    }>
  >([]);
  const { groupId: urlGroupId } = useParams<{ groupId: string }>();
  const effectiveIsModify = fromSidebar ? false : isModify;
  const shouldCheckRole = effectiveIsModify && !fromSidebar;
  const [userRole, setUserRole] = useState<string | null>(
    fromSidebar ? "ADMIN" : null
  );
  // Determine the groupId to use - from props or URL params
  const currentGroupId =
    propGroupId || (urlGroupId ? parseInt(urlGroupId, 10) : undefined);

  const handleAddGroup = async (
    values: FormikValues,
    onClose: () => void,
    showAssistantsEnabled: boolean
  ) => {
    const groupTypeValue = parseInt(values.roomType, 10);

    // Transform bots into ChatBotVO array
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

    const requestPayload: CreateGroupPayload = {
      groupName: values.roomName,
      groupDescription: values.roomDescription,
      groupType: groupTypeValue,
      ...(groupTypeValue === 0 ? { password: values.password } : {}),
      chatBotVOList,
    };

    try {
      addRoom(requestPayload);
      onClose();
    } catch (error: any) {
      console.error("Error creating group:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const formik = useFormik({
    initialValues: {
      roomName: "",
      roomDescription: "",
      roomType: "1",
      password: "",
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

      // Per API documentation
      const requestPayload = {
        groupId: Number(currentGroupId), // Ensure groupId is a number
        groupName: values.roomName,
        groupDescription: values.roomDescription,
        // Include password only for private rooms or if it was previously set
        ...(values.roomType === "0" ? { password: values.password } : {}),
        // Include bots only if assistants are enabled
        ...(showAssistants
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
        throw new Error(response.data.message || "Failed to update room");
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
              const botList = roomData.chatBotVOList || roomData.chatBots || [];
              setOriginalBots([...botList]);

              const hasBots = botList.length > 0;
              let formattedBots: FormBotWithStatus[];

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
              }

              // Pre-fill form values regardless of user role
              formik.setValues({
                roomName: roomData.groupName,
                roomDescription: roomData.groupDescription || "",
                roomType: roomData.groupType.toString(),
                password: roomData.password || "",
                bots: isAdmin ? formattedBots : [], // Only include bots if admin
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
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value, type, checked } = e.target;

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
        <CloseButton onClick={onClose}>
          <StyledCross size={24} />
        </CloseButton>

        <FormikProvider value={formik}>
          <Form onSubmit={formik.handleSubmit}>
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              name="roomName"
              placeholder="Explore Generative AI"
              value={formik.values.roomName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={shouldCheckRole && userRole !== "ADMIN"}
            />
            {formik.touched.roomName && formik.errors.roomName && (
              <div
                style={{
                  color: "red",
                  fontSize: "0.8rem",
                  marginTop: "-3vh",
                  marginBottom: "1vh",
                }}
              >
                {formik.errors.roomName}
              </div>
            )}

            <Label htmlFor="roomDescription">Description</Label>
            <Textarea
              id="roomDescription"
              name="roomDescription"
              placeholder="Let's discuss AGI"
              value={formik.values.roomDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={shouldCheckRole && userRole !== "ADMIN"}
            />
            {formik.touched.roomDescription &&
              formik.errors.roomDescription && (
                <div
                  style={{
                    color: "red",
                    fontSize: "0.8rem",
                    marginTop: "-3vh",
                    marginBottom: "1vh",
                  }}
                >
                  {formik.errors.roomDescription}
                </div>
              )}

            <Label>Room Type</Label>
            <RadioGroup>
              <RadioTextContainer>
                <RadioOption>
                  <input
                    type="radio"
                    name="roomType"
                    value="1" // Public is 1
                    checked={formik.values.roomType === "1"}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    disabled={effectiveIsModify} // Disable only when actually modifying
                  />
                  Public
                </RadioOption>
                <RadioOptionDesc>Show on main page</RadioOptionDesc>
              </RadioTextContainer>

              <RadioTextContainer>
                <RadioOption>
                  <input
                    type="radio"
                    name="roomType"
                    value="0" // Private is 0
                    checked={formik.values.roomType === "0"}
                    onChange={(e) => {
                      formik.handleChange(e);
                      console.log("Radio changed to:", e.target.value);
                    }}
                    disabled={effectiveIsModify} // Disable only when actually modifying
                  />
                  Private
                </RadioOption>
                <RadioOptionDesc>Need room password</RadioOptionDesc>
              </RadioTextContainer>
            </RadioGroup>
            {formik.values.roomType === "0" && (
              <>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password && (
                  <ErrorMessage>{formik.errors.password}</ErrorMessage>
                )}
              </>
            )}
            {(!effectiveIsModify || userRole === "ADMIN") && (
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={showAssistants}
                  onChange={handleAssistantToggle}
                />
                Add AI Assistant(s)
              </CheckboxLabel>
            )}

            {showAssistants && (
              <>
                <FieldArray
                  name="bots"
                  render={(arrayHelpers) => (
                    <FieldArrayContainer>
                      {formik.values.bots.map((bot, index) => (
                        <AddAssistantRow key={index}>
                          <RemoveIcon
                            onClick={() => {
                              if (formik.values.bots.length > 1) {
                                // Remove from form
                                arrayHelpers.remove(index);
                              }
                            }}
                          />
                          <SmallInputContainer>
                            {index === 0 && (
                              <StyledSpan>Assistant Name*</StyledSpan>
                            )}
                            <SmallInput
                              name={`bots[${index}].name`}
                              placeholder="Assistant Name"
                              value={bot.name}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                            />
                          </SmallInputContainer>
                          <SmallInputContainer>
                            {index === 0 && <StyledSpan>Prompt*</StyledSpan>}
                            <SmallInput
                              name={`bots[${index}].prompt`}
                              placeholder="Prompt"
                              value={bot.prompt}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                            />
                          </SmallInputContainer>
                          <ToggleSwitchContainer>
                            {index === 0 && (
                              <StyledSpan isadminlabel="true">
                                Only for Admin
                              </StyledSpan>
                            )}
                            {/* MODIFIED: special handling for checkbox */}
                            <ToggleSwitch>
                              <input
                                type="checkbox"
                                name={`bots[${index}].adminOnly`}
                                checked={bot.adminOnly}
                                onChange={(e) => {
                                  // Special handling for checkbox
                                  const isChecked = e.target.checked;

                                  // First update the value
                                  formik.setFieldValue(
                                    `bots[${index}].adminOnly`,
                                    isChecked
                                  );

                                  // Then mark as modified if it's an existing bot
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
                            {index === 0 && <StyledSpan>Context*</StyledSpan>}
                            <RightAlignedSmallInput
                              type="number"
                              name={`bots[${index}].context`}
                              placeholder="Context"
                              value={bot.context}
                              onChange={(e) => handleBotFieldChange(e, index)}
                              onBlur={formik.handleBlur}
                              min={1}
                              max={20}
                            />
                          </SmallInputContainer>
                        </AddAssistantRow>
                      ))}
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
                    </FieldArrayContainer>
                  )}
                />

                {/* Error message below FieldArrayContainer for any bot validation errors */}
                {hasBotErrors() && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "0.8rem",
                      marginTop: "0.5rem",
                      marginBottom: "1vh",
                    }}
                  >
                    All assistant fields are required
                  </div>
                )}

                {typeof formik.errors.bots === "string" && (
                  <ErrorMessage>{formik.errors.bots}</ErrorMessage>
                )}
              </>
            )}
            <CreateButton type="submit">
              {effectiveIsModify ? "Update" : "Create"}
            </CreateButton>
          </Form>
        </FormikProvider>
      </Modal>
    </Overlay>
  );
};

export default CreateRoomComponent;
