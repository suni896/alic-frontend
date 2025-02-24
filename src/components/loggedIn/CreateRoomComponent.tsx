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
    roomType: Yup.number()
      .oneOf([1, 2], "Invalid group type")
      .required("Room Type is required"),

    password: Yup.string().when("roomType", {
      is: (value: number) => value === 0, // Ensure the condition is valid
      then: (schema) =>
        schema
          .required("Password is required for roomType 0")
          .matches(
            /^[A-Za-z0-9!@#$%^&*()_+\-={}$.]{6,20}$/,
            "Password must be 6-20 characters long and contain valid characters"
          ), // Add conditionally required validation
      otherwise: (schema) => schema.notRequired(), // Optional otherwise validation
    }),
    bots: showAssistants
      ? Yup.array()
          .of(
            Yup.object().shape({
              name: Yup.string(),
              prompt: Yup.string().max(
                400,
                "Prompt cannot exceed 400 characters"
              ),
              context: Yup.number()
                .min(1, "Minimum value is 1")
                .max(20, "Maximum value is 20"),
              adminOnly: Yup.boolean(),
            })
          )
          .min(1, "Add at least one assistant")
          .required("Bot info is required")
      : Yup.array().notRequired(), // If `showAssistants` is false, make `bots` optional
  });

const handleAddGroup = async (values: FormikValues, onClose: () => void) => {
  const { roomName, roomDescription, roomType, password, bots } = values;
  const apiRoomType = roomType === 2 ? 0 : roomType;

  const chatBotVOList = bots.map((bot: any) => ({
    accessType: bot.adminOnly ? 0 : 1,
    botContext: bot.context,
    botName: bot.name,
    botPrompt: bot.prompt,
  }));
  console.log(roomType);
  try {
    const response = await axios.post("/v1/group/create_new_group", {
      groupName: roomName,
      groupDescription: roomDescription,
      groupType: apiRoomType, // Now it is 0 or 1
      password: roomType === 0 ? password : undefined,
      chatBotVOList,
    });
    const groupId: number = response.data.groupId;
    alert("Room successfully created!");
    console.log("Room created with ID: ", groupId);
    onClose;
  } catch (error) {
    console.error("Error creating group: ", error);
  }
};

interface CreateRoomComponentProps {
  onClose: () => void;
}

const CreateRoomComponent: React.FC<CreateRoomComponentProps> = ({
  onClose,
}) => {
  const [showAssistants, setShowAssistants] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  // const private radiooption checked => setShowPasswordModal(true)

  const handlePasswordSubmit = () => {
    setShowPasswordModal(false);
    setShowErrorModal(true);
  };

  const formik = useFormik({
    initialValues: {
      roomName: "",
      roomDescription: "",
      roomType: 1,
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

      handleAddGroup(values, onClose);
    },
  });

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
                    value={1} // Public is 1
                    checked={formik.values.roomType === 1}
                    onChange={formik.handleChange}
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
                    value={2} // Private is 0, 2 mapped to 0
                    checked={formik.values.roomType === 2}
                    onChange={formik.handleChange}
                  />
                  Private
                </RadioOption>
                <RadioOptionDesc>Need room password</RadioOptionDesc>
              </RadioTextContainer>
            </RadioGroup>

            <CheckboxLabel>
              <input
                type="checkbox"
                checked={showAssistants}
                onChange={() => setShowAssistants(!showAssistants)}
              />
              Add AI Assistant(s)
            </CheckboxLabel>

            {showAssistants && (
              <FieldArray
                name="bots"
                render={(arrayHelpers) => (
                  <FieldArrayContainer>
                    {formik.values.bots.map((bot, index) => (
                      <AddAssistantRow key={index}>
                        <IoIosRemoveCircleOutline
                          size={24}
                          color="#ef4444"
                          onClick={() => arrayHelpers.remove(index)}
                          style={{ cursor: "pointer" }}
                        />
                        <SmallInputContainer>
                          {index === 0 && (
                            <StyledSpan>Assistant Name</StyledSpan>
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
                          {index === 0 && <StyledSpan>Prompt</StyledSpan>}
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
                          {index === 0 && <StyledSpan>Context</StyledSpan>}
                          <RightAlignedSmallInput
                            type="number"
                            name={`bots[${index}].context`}
                            placeholder="Context"
                            value={bot.context}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
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
            )}

            <CreateButton type="submit">Create</CreateButton>
          </Form>
        </FormikProvider>
      </Modal>
    </Overlay>
  );
};

export default CreateRoomComponent;
