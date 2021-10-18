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
import {
  SunIcon,
  MoonIcon,
  CopyIcon,
  AddIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { Formik, Field, Form } from "formik";

import { challengeDraw } from "../purefunc/image";

const Captcha = ({ challenge }) => {
  const width = (challenge.length / 16) * 16;
  const height = 16;
  const draw = (ctx) => {
    challengeDraw(ctx, challenge);
  };
  return (
    <Canvas
      draw={draw}
      height={height}
      width={width}
      style={{
        width: "100%",
        imageRendering: "pixelated",
        backgroundColor: "#fff",
      }}
    />
  );
};

export const Challenge = () => {
  const initialRef = React.useRef();
  const challenge = useSelector((state) => state.user.challenge);

  return (
    <Modal
      initialFocusRef={initialRef}
      //   finalFocusRef={finalRef}
      isOpen={challenge !== null}
      //   onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Captcha</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Captcha challenge={challenge} />

          <CaptchaForm />
        </ModalBody>

        <ModalFooter>
          {/* <Button colorScheme="blue" mr={3}>
        Save
      </Button>
      <Button onClick={onClose}>Cancel</Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Canvas = ({ draw, height, width, style }) => {
  const canvas = React.useRef();
  React.useEffect(() => {
    const context = canvas.current.getContext("2d");
    draw(context);
  });
  return <canvas style={style} ref={canvas} height={height} width={width} />;
};

function CaptchaForm() {
  const dispatch = useDispatch();

  function validateName(value) {
    let error;
    if (!value) {
      error = "Code is required";
    } else if (value.length !== 5) {
      error = "5 characters required";
    }
    return error;
  }

  return (
    <Formik
      initialValues={{ code: "" }}
      onSubmit={(values, actions) => {
        dispatch(sendSolution(values.code));
        //   actions.setSubmitting(false);
      }}
    >
      {(props) => (
        <Form>
          <Field name="code" validate={validateName}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.code && form.touched.code}>
                <FormLabel htmlFor="code">Code</FormLabel>
                <Input {...field} id="code" placeholder="code" />
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
}
