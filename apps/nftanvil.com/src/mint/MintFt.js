import React, { useEffect, useState } from "react";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  history_load_info,
  history_load,
  HistoryEvent,
  ft_mint,
  ui_pro_set,
  NFTPreview,
  NFTContent,
  LoginRequired,
  NFTThumb,
  ICP,
  ANV,
  nft_mint_quote,
} from "../nftanvil-react";

import { Button, Box, IconButton, Tooltip, Image } from "@chakra-ui/react";

import { useWindowSize, useDebounce } from "react-use";

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
  Tag,
} from "@chakra-ui/react";

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Center,
  Spinner,
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
import { FileInput } from "../components/FileInput";
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
import mint_ft from "../assets/mint_ft.svg";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

export const MintFt = () => {
  return <MintForm />;
};

export const MintForm = () => {
  const dispatch = useDispatch();
  const address = useSelector((s) => s.user.main_account);
  return (
    <Center>
      <Formik
        validate={mintFormValidate}
        initialValues={{
          symbol: "",
          name: "",
          desc: "",
          kind: { fractionless: null },
          origin: "",
          transferable: true,
          image: false,
          fee: 1,
          supply: 10000,
          decimals: 8,
        }}
        onSubmit={async (values, actions) => {
          try {
            await dispatch(ft_mint(address, values));
            actions.setSubmitting(false);
          } catch (e) {
            actions.setSubmitting(false);
            throw e;
          }
        }}
      >
        {(props) => <FormInner props={props} />}
      </Formik>
    </Center>
  );
};

const FormInner = ({ props }) => {
  const dispatch = useDispatch();

  const mode = useColorModeValue("light", "dark");

  const { width, height } = useWindowSize();
  const isDesktop = width > 480;

  const pro = useSelector((state) => state.ui.pro);

  const boxColor = useColorModeValue("white", "gray.600");
  const boxHeadColor = useColorModeValue("gray.200", "gray.700");

  const valid = props.dirty && props.isValid;

  return (
    <>
      <Stack mt="80px" direction={isDesktop ? "row" : "column"}>
        <Box
          bg={"#25273d"}
          borderRadius={"md"}
          maxW={480}
          minW={isDesktop ? 480 : width - 32}
          w={isDesktop ? 480 : width - 32}
          p={5}
          sx={{ position: "relative" }}
          border="2px solid #2b3455"
        >
          <Image
            src={mint_ft}
            sx={{
              position: "absolute",
              left: "-8px",
              top: "-38px",
              width: "150px",
            }}
          />
          <Form>
            <Flex
              mb="8"
              bg={"#262f58"}
              mt="-5"
              ml="-5"
              mr="-5"
              p="5"
              borderTopLeftRadius="md"
              borderTopRightRadius="md"
            >
              <Text
                fontSize="20px"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "Greycliff",
                  paddingLeft: "112px",
                }}
              >
                Mint Fractionless Fungible Token
              </Text>

              <Spacer />
            </Flex>

            <Stack spacing={3}>
              <Text>
                We are taking the reverse gas model one step further, so you
                don't have to give your friends 0.9895 cups of coffe. Anvil's
                fractionless fungible tokens are made for the purposes of
                gamification. Only whole tokens can be transferred.
              </Text>
              <Box sx={{ position: "relative" }}>
                <File
                  form={props}
                  name="image"
                  label="Image"
                  buttonLabel="Upload thumbnail"
                  onChange={async (info) => {
                    if (info.type.indexOf("image/") !== -1) {
                      if (info.size > 256 * 256 || info.type !== "image/png") {
                        let x = await resizeImage(
                          info.url,
                          256,
                          256,
                          true,
                          "image/png"
                        );

                        if (x.size > 131072) {
                          x = await resizeImage(
                            info.url,
                            180,
                            180,
                            true,
                            "image/png"
                          );
                        }
                        props.setFieldValue("image", x);

                        toast.info(
                          "Image was too big. Resizing automagically",
                          {
                            position: "bottom-center",
                          }
                        );
                      }
                    }
                  }}
                  accept="image/*,video/*"
                  validateInternal={validateContentInternal}
                  validateExternal={validateExternal}
                  validateExternalType={validateExternalType}
                  pro={pro}
                />
                {props.values.image ? (
                  <Image
                    sx={{ position: "absolute", top: "-8px", right: "22px" }}
                    src={props.values.image.url}
                    w={"56px"}
                    h={"56px"}
                    borderRadius={"6px"}
                  />
                ) : null}
              </Box>
              <Field name="origin" validate={validateDomain}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.origin && form.touched.origin}
                  >
                    <FormLabel htmlFor="origin">
                      <FormTip
                        text={`Will have external link to that location. It must be verified by placing /.well-known/nftanvil.json with {"/pathname":["allowed_author_aid","another_allowed_author_aid"]}.`}
                      >
                        Origin
                      </FormTip>
                    </FormLabel>
                    <Input
                      {...field}
                      id="origin"
                      placeholder="yourdomain.com/my_collection/"
                      variant="filled"
                    />
                    <FormErrorMessage>{form.errors.origin}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="symbol" validate={validateName}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.symbol && form.touched.symbol}
                  >
                    <FormLabel htmlFor="symbol">Symbol</FormLabel>
                    <Input
                      {...field}
                      id="symbol"
                      placeholder="ABCDE"
                      variant="filled"
                    />
                    <FormErrorMessage>{form.errors.symbol}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="name" validate={validateName}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.name && form.touched.name}
                  >
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Kitten"
                      variant="filled"
                    />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="desc" validate={validateDescriptionOrNone}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.desc && form.touched.desc}
                  >
                    <FormLabel htmlFor="desc">Description</FormLabel>
                    <Textarea
                      {...field}
                      resize="none"
                      maxLength={256}
                      id="desc"
                      placeholder="Optional"
                      variant="filled"
                    />
                    <FormErrorMessage>{form.errors.desc}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field
                name={`supply`}
                // validate={validateAttributeChange}
                min={100}
                max={800000000}
              >
                {({ field, form }) => {
                  return (
                    <FormControl
                      isInvalid={form.errors.supply && form.touched.supply}
                    >
                      <FormLabel htmlFor="supply">Total fixed supply</FormLabel>

                      <NumberInput
                        {...field}
                        onChange={(num) => {
                          props.setFieldValue("supply", num);
                        }}
                        variant="filled"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{form.errors.supply}</FormErrorMessage>
                    </FormControl>
                  );
                }}
              </Field>

              <Text fontSize="11px" mt="-2" mb="2">
                There is no transfer fee, instead each token is charged with 500
                transfers. It's holder will have to recharge it with ANV when
                depleted.
              </Text>
            </Stack>
            <Text mt="4" fontSize="14px">
              Please make sure everything is correct. This action is
              irreversible and can't be refunded. Once minted, you can't change
              these parameters or mint more of these tokens.
            </Text>
            <LoginRequired label="Authenticate to mint">
              <Button
                mt={4}
                w={"100%"}
                colorScheme="blue"
                isLoading={props.isSubmitting}
                type="submit"
                size="lg"
                sx={{
                  fontFamily: "Greycliff",
                  fontSize: "160%",
                  borderWidth: "2px",
                }}
              >
                Mint
                <Tag colorScheme="blue" ml="3">
                  <ANV mode="dark">
                    {Math.max(props.values.supply, 5000) * 500 * 10000}
                  </ANV>
                </Tag>
              </Button>
            </LoginRequired>
          </Form>
        </Box>
      </Stack>
    </>
  );
};

const FormTip = ({ children, text }) => {
  return (
    <Tooltip placement="top-start" label={text}>
      <Text>
        {children}
        {/* {" "}
        <InfoOutlineIcon color={"gray.500"} w={3} h={3} mt={"-3px"} /> */}
      </Text>
    </Tooltip>
  );
};

const File = ({
  form,
  label,
  name,
  accept,
  validateInternal,
  validateExternal,
  validateExternalType,
  onChange,
  buttonLabel,
  pro,
}) => {
  const keyInternal = name;

  return (
    <Box>
      <Field name={keyInternal} validate={validateInternal}>
        {({ field, form }) => (
          <FormControl isInvalid={form.errors[keyInternal]}>
            <FileInput
              label={buttonLabel}
              button={{ w: "100%" }}
              {...field}
              accept={accept}
              onChange={(f) => {
                form.setFieldValue(keyInternal, f, true);
                if (onChange) onChange(f);
              }}
            />
            <FormErrorMessage>{form.errors[keyInternal]}</FormErrorMessage>
          </FormControl>
        )}
      </Field>
    </Box>
  );
};
