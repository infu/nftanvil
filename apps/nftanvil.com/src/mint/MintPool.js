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
  FTSelect,
  dex_create_pool,
} from "@vvv-interactive/nftanvil-react";

import {
  Button,
  Box,
  IconButton,
  Tooltip,
  Image,
} from "@vvv-interactive/nftanvil-react/src/chakra.js";

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
} from "@vvv-interactive/nftanvil-react/src/chakra.js";

import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Center,
  Spinner,
} from "@vvv-interactive/nftanvil-react/src/chakra.js";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@vvv-interactive/nftanvil-react/src/chakra.js";
import { SmallCloseIcon, InfoOutlineIcon, CheckIcon } from "@chakra-ui/icons";

import { AnvilIcon } from "../icons";

import { Select } from "@vvv-interactive/nftanvil-react/src/chakra.js";
import { Formik, Field, Form, FieldArray } from "formik";
import { Switch } from "@vvv-interactive/nftanvil-react/src/chakra.js";
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
import mint_pool from "../assets/mint_pool.svg";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

export const MintPool = () => {
  return <MintForm />;
};

export const MintForm = () => {
  const dispatch = useDispatch();
  const address = useSelector((s) => s.user.main_account);
  return (
    <Center>
      <Formik
        validate={mintFormValidate}
        initialValues={{}}
        onSubmit={async (values, actions) => {
          try {
            await dispatch(dex_create_pool(address, values));
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
            src={mint_pool}
            sx={{
              position: "absolute",
              left: "-8px",
              top: "-40px",
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
                Mint Liquidity Pool
              </Text>

              <Spacer />
            </Flex>

            <Stack spacing={3}>
              <Text>Create a liquidity pool between two fungible tokens</Text>
              <Field name="token_one">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.token_one && form.touched.token_one}
                  >
                    {/* <FormLabel htmlFor="token_one">Token One</FormLabel> */}
                    <FTSelect
                      value={field.value}
                      onChange={(t) => {
                        console.log();
                        props.setFieldValue(`token_one`, t);
                      }}
                    />

                    <FormErrorMessage>{form.errors.token_one}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="token_two">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.token_two && form.touched.token_two}
                  >
                    {/* <FormLabel htmlFor="token_two">Token Two</FormLabel> */}
                    <FTSelect
                      value={field.value}
                      initialValue={false}
                      onChange={(t) => {
                        console.log();
                        props.setFieldValue(`token_two`, t);
                      }}
                    />

                    <FormErrorMessage>{form.errors.token_two}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
            </Stack>

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
                Mint Pool
                <Tag colorScheme="blue" ml="3">
                  <ANV mode="dark">{20 * 100000000}</ANV>
                </Tag>
              </Button>
            </LoginRequired>
          </Form>
        </Box>
      </Stack>
    </>
  );
};
