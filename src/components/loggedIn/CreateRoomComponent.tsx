import React, { useState } from "react";
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
  position: relative; // Add this
  width: 75%;
  margin-top: 8vh;
  max-width: 50rem;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  height: auto;
  max-height: 80vh;
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
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20%;
  margin: 1vh 0;
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
  padding: 0.75rem;
`;

const AddAssistantRow = styled.div`
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) minmax(0, 1fr) 6rem 4rem;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1vh;
`;

const ToggleSwitchContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  min-width: 6rem;
  gap: 0;
  position: relative;
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
`;

const SmallInputContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const StyledSpan = styled.span`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
`;

interface SmallInputProps {
  hasError?: boolean;
}

const SmallInput = styled(Input)<SmallInputProps>`
  font-size: 0.9rem;
  padding: 0.5rem;
  margin: auto 0;
  width: 90%;
  border: 1px solid ${({ hasError }) => (hasError ? "red" : "#ccc")};
  &:focus {
    border-color: ${({ hasError }) => (hasError ? "red" : "#007BFF")};
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
        "Room Name must be 1-20 characters long"
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
            /^[A-Za-z0-9!@#$%^&*()_+\-={}$.]{6,20}$/,
            "Password must be 6-20 characters long and contain valid characters"
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    bots: showAssistants
      ? Yup.array()
          .of(
            Yup.object().shape({
              name: Yup.string().required("Assistant name is required"),
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
  chatBotVOList: ChatBotVO[]; // Changed to be required, not optional
}

const handleAddGroup = async (values: FormikValues, onClose: () => void) => {
  const roomTypeValue = values.roomType as string; // roomType is a string
  const groupTypeValue = parseInt(roomTypeValue, 10); // Convert to integer for groupType
  const { roomName, roomDescription, roomType, password, bots } = values;

  // Debug - Log all the input values with their types
  console.log("--- DEBUG: FORM VALUES ---");
  console.log(`roomName: "${roomName}" (${typeof roomName})`);
  console.log(
    `roomDescription: "${roomDescription}" (${typeof roomDescription})`
  );
  console.log(`roomType (raw): "${roomType}" (${typeof roomType})`);
  console.log(
    `groupTypeValue (parsed): ${groupTypeValue} (${typeof groupTypeValue})`
  );
  console.log(`password: "${password}" (${typeof password})`);
  console.log(`bots:`, bots);
  console.log("-----------------------");

  // Transform bots into ChatBotVO array if they exist, otherwise empty array
  let chatBotVOList: ChatBotVO[] = [];
  if (Array.isArray(bots) && bots.length > 0) {
    chatBotVOList = bots.map((bot: FormBot, index: number) => {
      // Ensure context is a number
      const botContext =
        typeof bot.context === "number"
          ? bot.context
          : parseInt(String(bot.context), 10);
      // Ensure accessType is correct format
      const accessType = bot.adminOnly ? 0 : 1;

      const botData: ChatBotVO = {
        accessType: accessType,
        botContext: botContext,
        botName: bot.name || "",
        botPrompt: bot.prompt || "",
      };

      // Debug each bot configuration
      console.log(`--- DEBUG: BOT ${index} ---`);
      console.log(`botName: "${botData.botName}" (${typeof botData.botName})`);
      console.log(
        `botPrompt: "${botData.botPrompt}" (${typeof botData.botPrompt})`
      );
      console.log(
        `botContext: ${botData.botContext} (${typeof botData.botContext})`
      );
      console.log(
        `accessType: ${botData.accessType} (${typeof botData.accessType})`
      );
      console.log("-----------------------");

      return botData;
    });
  }

  // Create the request payload with proper typing
  // Always include chatBotVOList as an array (empty if no bots)
  const requestPayload: CreateGroupPayload = {
    groupName: roomName as string,
    groupDescription: roomDescription as string,
    groupType: groupTypeValue,
    // Only include password when type is private (0)
    ...(groupTypeValue === 0 ? { password: password as string } : {}),
    // Always include chatBotVOList, even if empty
    chatBotVOList: chatBotVOList,
  };

  // Deep debug of the final request payload
  console.log("--- DEBUG: FINAL REQUEST PAYLOAD ---");
  console.log("Full payload:", JSON.stringify(requestPayload, null, 2));
  console.log("Payload structure:");
  for (const [key, value] of Object.entries(requestPayload)) {
    const valueType = Array.isArray(value) ? "array" : typeof value;
    console.log(`${key}: ${valueType}`);
    if (valueType === "array") {
      console.log(`  ${key} length: ${(value as any[]).length}`);
    }
  }
  console.log("-----------------------");

  // Add request interceptor to log all request headers
  const interceptorReq = axios.interceptors.request.use((request) => {
    console.log("Request Headers:", request.headers);
    console.log("Request Method:", request.method);
    console.log("Request URL:", request.url);
    return request;
  });

  // Add response interceptor to log all response headers
  const interceptorRes = axios.interceptors.response.use(
    (response) => {
      console.log("--- DEBUG: RESPONSE ---");
      console.log("Response Status:", response.status);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));
      console.log("Response Code:", response.data.code);
      return response;
    },
    (error) => {
      console.log("--- DEBUG: ERROR ---");
      console.log("Error Status:", error.response?.status);
      console.log("Error Data:", JSON.stringify(error.response?.data, null, 2));
      console.log("Error Message:", error.message);
      return Promise.reject(error);
    }
  );

  try {
    const response = await apiClient.post(
      "/v1/group/create_new_group",
      requestPayload
    );

    // Define an interface for the response structure
    interface ApiResponse {
      code: number;
      message: string;
      data?: {
        groupId: number;
      };
    }

    const responseData = response.data as ApiResponse;

    if (responseData.code !== 200) {
      console.error(
        `API Error: Code ${responseData.code}`,
        responseData.message
      );
      alert(
        `Error ${responseData.code}: ${responseData.message || "Unknown error"}`
      );
      return;
    }

    // Correctly access the groupId from the nested data structure
    const groupId: number | undefined = responseData.data?.groupId;
    alert("Room successfully created!");
    console.log("Room created with ID:", groupId);
    onClose();
  } catch (error: any) {
    console.error("Error creating group:", error);
    alert(`Error: ${error.response?.data?.message || error.message}`);
  } finally {
    // Remove interceptors to avoid memory leaks
    axios.interceptors.request.eject(interceptorReq);
    axios.interceptors.response.eject(interceptorRes);
  }
};

interface CreateRoomComponentProps {
  onClose: () => void;
}

const CreateRoomComponent: React.FC<CreateRoomComponentProps> = ({
  onClose,
}) => {
  const [showAssistants, setShowAssistants] = useState(false);

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
        },
      ],
    },
    validationSchema: validationSchema(showAssistants),
    onSubmit: async (values) => {
      console.log("Form Submitted", values);
      console.log("roomType value:", values.roomType);

      // If assistants are not checked, make sure bots array is empty
      const submittedValues = {
        ...values,
        bots: showAssistants ? values.bots : [],
      };

      handleAddGroup(submittedValues, onClose);
    },
  });

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
            <Input
              id="roomDescription"
              name="roomDescription"
              placeholder="Let's discuss AGI"
              value={formik.values.roomDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={showAssistants}
                onChange={handleAssistantToggle}
              />
              Add AI Assistant(s)
            </CheckboxLabel>

            {showAssistants && (
              <>
                <FieldArray
                  name="bots"
                  render={(arrayHelpers) => (
                    <FieldArrayContainer>
                      {formik.values.bots.map((bot, index) => (
                        <AddAssistantRow key={index}>
                          <IoIosRemoveCircleOutline
                            size={24}
                            color="#ef4444"
                            onClick={() =>
                              formik.values.bots.length > 1
                                ? arrayHelpers.remove(index)
                                : null
                            }
                            style={{ cursor: "pointer" }}
                          />
                          <SmallInputContainer>
                            {index === 0 && (
                              <StyledSpan>Assistant Name*</StyledSpan>
                            )}
                            <SmallInput
                              name={`bots[${index}].name`}
                              placeholder="Assistant Name"
                              value={bot.name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </SmallInputContainer>
                          <SmallInputContainer>
                            {index === 0 && <StyledSpan>Prompt*</StyledSpan>}
                            <SmallInput
                              name={`bots[${index}].prompt`}
                              placeholder="Prompt"
                              value={bot.prompt}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </SmallInputContainer>
                          <ToggleSwitchContainer>
                            {index === 0 && (
                              <StyledSpan
                                style={{
                                  position: "relative",
                                  top: "-1.1vh",
                                }}
                              >
                                Only for Admin
                              </StyledSpan>
                            )}
                            <ToggleSwitch>
                              <input
                                type="checkbox"
                                name={`bots[${index}].adminOnly`}
                                checked={bot.adminOnly}
                                onChange={formik.handleChange}
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
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              min={1}
                              max={20}
                            />
                          </SmallInputContainer>
                        </AddAssistantRow>
                      ))}
                      <IoIosAddCircleOutline
                        size={24}
                        color="#10b981"
                        onClick={() =>
                          arrayHelpers.push({
                            name: "",
                            prompt: "",
                            context: 1,
                            adminOnly: false,
                          })
                        }
                        style={{ cursor: "pointer", marginTop: "0.5rem" }}
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
            <CreateButton type="submit">Create</CreateButton>
          </Form>
        </FormikProvider>
      </Modal>
    </Overlay>
  );
};

export default CreateRoomComponent;
