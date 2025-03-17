import React from "react";
import { Formik, Form } from "formik";
import styled from "styled-components";

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin: 16px 0;
`;

const RadioTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioOptionDesc = styled.span`
  font-size: 0.875rem;
  color: #666;
`;

const MyForm: React.FC = () => {
  const initialValues = { roomType: "1" }; // Default to "Public" as a string

  const handleSubmit = (values: { roomType: string }) => {
    // Convert roomType to a number if necessary
    const roomTypeValue = parseInt(values.roomType, 10);
    console.log("Submitted values:", { roomType: roomTypeValue });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {(formik) => (
        <Form>
          <RadioGroup>
            <RadioTextContainer>
              <RadioOption>
                <input
                  type="radio"
                  name="roomType"
                  value="1" // Public as a string
                  checked={formik.values.roomType === "1"}
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
                  value="0" // Private as a string
                  checked={formik.values.roomType === "0"}
                  onChange={formik.handleChange}
                />
                Private
              </RadioOption>
              <RadioOptionDesc>Need room password</RadioOptionDesc>
            </RadioTextContainer>
          </RadioGroup>
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export default MyForm;
