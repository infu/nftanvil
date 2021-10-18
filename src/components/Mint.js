import React from "react";
import {
  login,
  logout,
  mint,
  owned,
  challenge,
  sendSolution,
} from "../reducers/user";
import { useSelector, useDispatch } from "react-redux";

import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Flex,
  Spacer,
  Center,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalModalHeader,
  ModalCloseButton,
  ModalBody,
  FormLabel,
  Input,
  FormControl,
  ModalFooter,
  ModalContent,
  ModalHeader,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useClipboard, useColorMode } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import {
  SunIcon,
  MoonIcon,
  CopyIcon,
  AddIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import { Switch } from "@chakra-ui/react";
import { challengeDraw } from "../purefunc/image";

export const Mint = () => {
  const dispatch = useDispatch();

  return (
    <Box
      bg={useColorModeValue("white", "gray.600")}
      borderRadius="md"
      border={1}
      mt={"80px"}
      w={480}
      p={5}
    >
      <MintForm />
    </Box>
  );
};

export const MintForm = () => {
  const dispatch = useDispatch();

  function validateName(value) {
    return null;
  }

  return (
    <Formik
      initialValues={{ name: "" }}
      onSubmit={(values, actions) => {
        dispatch(mint());
        // dispatch(sendSolution(values.code));
        actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
          <Field name="name" validate={validateName}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.code && form.touched.code}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input {...field} id="name" placeholder="name" />
                <FormErrorMessage>{form.errors.code}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="ch" validate={validateName}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.code && form.touched.code}>
                <FormLabel htmlFor="ch">Code</FormLabel>
                <Checkbox {...field} defaultIsChecked>
                  Checkbox
                </Checkbox>
                <FormErrorMessage>{form.errors.code}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="sel" validate={validateName}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.code && form.touched.code}>
                <FormLabel htmlFor="sel">Code</FormLabel>

                <Select {...field} placeholder="Select option">
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </Select>
                <FormErrorMessage>{form.errors.code}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="sw" validate={validateName}>
            {({ field, form }) => (
              <FormControl
                display="flex"
                alignItems="center"
                isInvalid={form.errors.code && form.touched.code}
              >
                <FormLabel htmlFor="email-alerts" mb="0">
                  Enable email alerts?
                </FormLabel>
                <Switch {...field} id="email-alerts" />
                <FormErrorMessage>{form.errors.code}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Button
            mt={4}
            colorScheme="teal"
            isLoading={props.isSubmitting}
            type="submit"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};
