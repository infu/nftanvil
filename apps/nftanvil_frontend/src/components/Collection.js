import React from "react";
import { mint } from "../reducers/nft";
import { proSet, setNftSotrageModal } from "../reducers/user";
import { LoginRequired } from "./LoginRequired";
import { useSelector, useDispatch } from "react-redux";

import {
  Button,
  Box,
  IconButton,
  Radio,
  RadioGroup,
  Tooltip,
} from "@chakra-ui/react";
import { useWindowSize } from "react-use";

import {
  Flex,
  Spacer,
  useColorModeValue,
  FormLabel,
  Input,
  FormControl,
  FormErrorMessage,
  Textarea,
  Text,
  Grid,
  useClipboard,
} from "@chakra-ui/react";

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
} from "@chakra-ui/react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { SmallCloseIcon, InfoOutlineIcon, CheckIcon } from "@chakra-ui/icons";

import { AnvilIcon } from "../icons";

import { Select } from "@chakra-ui/react";
import { Formik, Field, Form, FieldArray } from "formik";
import { Switch } from "@chakra-ui/react";
import { toast } from "react-toastify";

import {
  itemQuality,
  itemTransfer,
  itemUse,
  itemHold,
} from "@vvv-interactive/nftanvil-tools/cjs/items.js";
import { FileInput } from "./FileInput";
import { NFTPreview } from "./NFT";
import { resizeImage } from "@vvv-interactive/nftanvil-tools/cjs/image.js";
import { Principal } from "@dfinity/principal";
import {
  validateName,
  validateExtensionCanister,
  validateHoldId,
  validateUseId,
  validateDescription,
  validateThumbInternal,
  validateContentInternal,
  validateExternal,
  validateExternalType,
  validateDescriptionOrNone,
  validateCooldown,
  validateAttributeName,
  validateAttributeChange,
  mintFormValidate,
  validateDomain,
  validateTagName,
} from "@vvv-interactive/nftanvil-tools/cjs/validate.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { values } from "lodash";

export const Collection = () => {
  return <CollectionForm />;
};

export const CollectionForm = () => {
  const { width, height } = useWindowSize();
  const isDesktop = width > 480;
  const address = useSelector((state) => state.user.address);

  const dispatch = useDispatch();

  const boxColor = useColorModeValue("white", "gray.600");
  const boxHeadColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Formik
      validate={mintFormValidate}
      initialValues={{
        domain: null,
        authors: [],
        socketable: [],
        max: 10000,
        renderer: null,
        IPFSGateway: null,
      }}
      onSubmit={(values, actions) => {
        console.log(values);
        // setTimeout(() => {
        //   actions.setSubmitting(false);
        // }, 500);

        // dispatch(mint(record2request(form2record(values))));
      }}
    >
      {(props) => (
        <>
          <Stack mt="80px" direction={isDesktop ? "row" : "column"}>
            <Box
              bg={boxColor}
              borderRadius={"md"}
              border={1}
              maxW={480}
              w={isDesktop ? 480 : width - 32}
              p={5}
            >
              <Form>
                <Flex
                  mb="8"
                  bg={boxHeadColor}
                  mt="-5"
                  ml="-5"
                  mr="-5"
                  p="5"
                  borderTopLeftRadius="md"
                  borderTopRightRadius="md"
                >
                  <Text
                    fontSize="28px"
                    sx={{ fontWeight: "bold", fontFamily: "Greycliff" }}
                  >
                    Collection
                  </Text>
                  <Spacer />
                </Flex>

                <Stack spacing={3}>
                  <Field name="name" validate={validateName}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.name && form.touched.name}
                      >
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <Input
                          {...field}
                          id="name"
                          placeholder="Excalibur"
                          variant="filled"
                        />
                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="domain" validate={validateDomain}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.domain && form.touched.domain}
                      >
                        <FormLabel htmlFor="domain">
                          <FormTip text="Verify domain by placing /.well-known/nftanvil.json with {allowed:[allowed author principal ids]}">
                            Verified domain
                          </FormTip>
                        </FormLabel>
                        <Input
                          {...field}
                          id="domain"
                          placeholder="yourdomain.com"
                          variant="filled"
                        />
                        <FormErrorMessage>
                          {form.errors.domain}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <LoginRequired label="Authenticate">
                    <Button
                      mt={4}
                      w={"100%"}
                      colorScheme="teal"
                      isLoading={props.isSubmitting}
                      type="submit"
                      size="lg"
                      sx={{ fontFamily: "Greycliff", fontSize: "160%" }}
                      rightIcon={<AnvilIcon />}
                    >
                      Create collection
                    </Button>
                  </LoginRequired>
                </Stack>
              </Form>
            </Box>
          </Stack>
        </>
      )}
    </Formik>
  );
};

const FormTip = ({ children, text }) => {
  return (
    <Tooltip placement="top-start" label={text}>
      <Text>{children}</Text>
    </Tooltip>
  );
};
