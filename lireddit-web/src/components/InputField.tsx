import { FormControl, FormLabel, Input, FormErrorMessage } from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

interface InputFieldProps {
  name: string;
  placeholder: string;
  label: string;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, placeholder, ...props}) => {
  const [field, {error}] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
    <FormLabel htmlFor={field.name}>{label}</FormLabel>
    <Input {...field} {...props} id={field.name} placeholder={placeholder} />
    {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
  </FormControl>
  )
}

export default InputField;