import React, { useEffect, useState } from "react";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  history_load_info,
  history_load,
  HistoryEvent,
  nft_mint,
  ui_pro_set,
  NFTPreview,
  NFTContent,
  LoginRequired,
  NFTThumb,
  ICP,
  nft_mint_quote,
} from "../nftanvil-react";

import { Button, Box, IconButton, Tooltip } from "@chakra-ui/react";

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

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

export const MintSingleNft = () => {
  return <MintForm />;
};

export const ProToggle = () => {
  const dispatch = useDispatch();
  const pro = useSelector((state) => state.ui.pro);

  return (
    <FormControl w={"110px"} ml="2px" display="inline-flex" alignItems="center">
      <FormLabel htmlFor="pro" mb="0">
        <Text fontSize="11px">ADVANCED</Text>
      </FormLabel>
      <Switch
        id="pro"
        isChecked={pro}
        onChange={(e) => dispatch(ui_pro_set(e.target.checked))}
      />
    </FormControl>
  );
};

const form2record = (v, { address } = {}) => {
  let a = {
    domain: v.domain.replace(/^http[s]*?:\/\//, ""),
    author: address, // not sent to minting, temporary here for the preview
    price: {
      amount: AccountIdentifier.icpToE8s(v.price),
      marketplace: [],
    },
    authorShare: v.authorShare,
    name: v.name,
    lore: v.lore,
    transfer: {
      [v.transfer]:
        v.transfer === "bindsDuration"
          ? parseInt(v.transfer_bind_duration, 10)
          : null,
    },

    quality: parseInt(v.quality, 10),
    ttl: v.ttl,
    attributes: v.attributes.map((x) => [
      x.name.toLowerCase(),
      parseInt(x.change, 10),
    ]),
    tags: v.tags.map((x) => x.toLowerCase()),
    content: v.content?.url
      ? {
          internal: {
            url: v.content.url,
            contentType: v.content.type,
            size: v.content.size,
          },
        }
      : null,

    thumb: v.thumb?.url
      ? {
          internal: {
            url: v.thumb.url,
            contentType: v.thumb.type,
            size: v.thumb.size,
          },
        }
      : null,

    secret: v.secret,
  };
  return a;
};

const record2request = (v) => {
  let a = {
    price: v.price,
    domain: v.domain ? [v.domain] : [],
    authorShare: Math.round(v.authorShare * 100),
    name: [v.name].filter(Boolean),
    lore: [v.lore].filter(Boolean),
    transfer: v.transfer,
    quality: v.quality,
    ttl: [v.ttl].filter(Boolean),
    attributes: v.attributes.filter(Boolean),
    tags: v.tags.filter(Boolean),
    content: [v.content].filter(Boolean),
    thumb: v.thumb,
    secret: v.secret,
    custom: [],
    rechargeable: true,
    customVar: [],
  };
  return a;
};

export const MintForm = () => {
  const dispatch = useDispatch();

  return (
    <Center>
      <Formik
        validate={mintFormValidate}
        initialValues={{
          collectionId: null,
          domain: "",
          authorShare: 0.5,
          price: 0.0,
          name: "",
          quality: 1,
          transfer: "unrestricted",
          use_duration: 30,
          use_id: "",
          hold_desc: "",
          hold_id: "",
          transfer_bind_duration: 1440,
          maxChildren: 0,
          attributes: [],
          preset: "ic-lite",
          ttl: null,
          secret: false,
          tags: [],
        }}
        onSubmit={async (values, actions) => {
          try {
            await dispatch(nft_mint(record2request(form2record(values))));
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
  const address = useSelector((state) => Object.keys(state.user.accounts)[0]);

  const pro = useSelector((state) => state.ui.pro);

  const boxColor = useColorModeValue("white", "gray.600");
  const boxHeadColor = useColorModeValue("gray.200", "gray.700");

  let [mintPrice, setMintPrice] = useState(0);
  let [record, setRecord] = useState(false);

  const valid = props.dirty && props.isValid;

  useDebounce(
    () => {
      setRecord(form2record(props.values, { address }));
      if (!valid) return;

      dispatch(nft_mint_quote(record)).then((re) => {
        setMintPrice(re.ops + re.storage);
      });
    },
    300,
    [record, valid, dispatch]
  );

  return (
    <>
      <Stack mt="80px" direction={isDesktop ? "row" : "column"}>
        <Box
          bg={boxColor}
          borderRadius={"md"}
          border={1}
          maxW={480}
          minW={isDesktop ? 480 : width - 32}
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
                fontSize="24px"
                sx={{ fontWeight: "bold", fontFamily: "Greycliff" }}
              >
                Mint Non-Fungible Token
              </Text>

              <Spacer />
              <ProToggle />
            </Flex>

            <Stack spacing={3}>
              {props.dirty ? (
                <NFTContent meta={record} preset="container" />
              ) : null}
              <NFTThumb meta={record} />
              <File
                form={props}
                name="content"
                label="Content"
                buttonLabel="Upload content image or video"
                onChange={async (info) => {
                  if (info.type.indexOf("image/") !== -1) {
                    if (info.size > 1024 * 1024) {
                      let x = await resizeImage(info.url, 1280, 1280);
                      props.setFieldValue("content", x);

                      toast.info("Image was too big. Resizing automatically", {
                        position: "bottom-center",
                      });
                    }
                    let f = await resizeImage(info.url, 432, 432, true);
                    // console.log("resized", f);
                    props.setFieldValue("thumb", f);
                  }
                }}
                accept="image/*,video/*"
                validateInternal={validateContentInternal}
                validateExternal={validateExternal}
                validateExternalType={validateExternalType}
                pro={pro}
              />

              <File
                form={props}
                label="Thumb"
                name="thumb"
                accept="image/*"
                buttonLabel="Upload thumbnail image"
                validateInternal={validateThumbInternal}
                validateExternal={validateExternal}
                validateExternalType={validateExternalType}
                pro={pro}
                onChange={async (info) => {
                  if (info.type.indexOf("image/") !== -1) {
                    if (info.size > 1024 * 128) {
                      let x = await resizeImage(info.url, 432, 432);
                      // console.log("resized", x);
                      props.setFieldValue("thumb", x);
                      toast.info("Image was too big. Resizing automatically", {
                        position: "bottom-center",
                      });
                    }
                  }
                }}
              />
              {pro ? (
                <Field name="secret">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.secret}
                      display="flex"
                      alignItems="center"
                    >
                      <FormLabel htmlFor="secret" mb="0">
                        <FormTip text="Content will be visible only to the owner. However node operators currently have memory read access and can see it too">
                          Secret content, public thumbnail
                        </FormTip>
                      </FormLabel>
                      <Switch {...field} id="secret" />
                      <FormErrorMessage ml="10px" mt="-3px">
                        {form.errors.secret}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              ) : null}
              {pro ? (
                <Field name="domain" validate={validateDomain}>
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.domain && form.touched.domain}
                    >
                      <FormLabel htmlFor="domain">
                        <FormTip
                          text={`Will have external link to that location. It must be verified by placing /.well-known/nftanvil.json with {"/pathname":["allowed_author_aid","another_allowed_author_aid"]}.`}
                        >
                          Verified collection url
                        </FormTip>
                      </FormLabel>
                      <Input
                        {...field}
                        id="domain"
                        placeholder="yourdomain.com/my_collection/"
                        variant="filled"
                      />
                      <FormErrorMessage>{form.errors.domain}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              ) : null}

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
              <Field name="lore" validate={validateDescriptionOrNone}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.lore && form.touched.lore}
                  >
                    <FormLabel htmlFor="lore">Lore</FormLabel>
                    <Textarea
                      {...field}
                      resize="none"
                      maxLength={256}
                      id="lore"
                      placeholder="Forged in a dragon's breath"
                      variant="filled"
                    />
                    <FormErrorMessage>{form.errors.lore}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <FieldArray name="attributes">
                {({ insert, remove, push }) => (
                  <Stack spacing={3}>
                    {props.values.attributes.length > 0 &&
                      props.values.attributes.map((friend, index) => (
                        <Box key={index}>
                          <Grid templateColumns="1fr 1fr 50px" gap={6}>
                            <Field
                              name={`attributes.${index}.change`}
                              validate={validateAttributeChange}
                            >
                              {({ field, form }) => {
                                let hasError, errText;
                                try {
                                  hasError =
                                    form.errors.attributes[index].change &&
                                    form.touched.attributes[index].change;
                                  errText =
                                    form.errors.attributes[index].change;
                                } catch (e) {}
                                return (
                                  <FormControl isInvalid={hasError}>
                                    <NumberInput
                                      {...field}
                                      onChange={(num) => {
                                        props.setFieldValue(
                                          `attributes.${index}.change`,
                                          num
                                        );
                                      }}
                                      variant="filled"
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                    <FormErrorMessage>
                                      {errText}
                                    </FormErrorMessage>
                                  </FormControl>
                                );
                              }}
                            </Field>

                            <Field
                              name={`attributes.${index}.name`}
                              validate={validateAttributeName}
                            >
                              {({ field, form }) => {
                                let hasError, errText;
                                try {
                                  hasError =
                                    form.errors.attributes[index].name &&
                                    form.touched.attributes[index].name;
                                  errText = form.errors.attributes[index].name;
                                } catch (e) {}

                                return (
                                  <FormControl isInvalid={hasError}>
                                    <Input
                                      {...field}
                                      id={`attributes.${index}.name`}
                                      placeholder="Intellect"
                                      variant="filled"
                                    />
                                    <FormErrorMessage>
                                      {errText}
                                    </FormErrorMessage>
                                  </FormControl>
                                );
                              }}
                            </Field>

                            <IconButton
                              colorScheme="gray"
                              variant="solid"
                              icon={<SmallCloseIcon />}
                              onClick={() => remove(index)}
                            />
                          </Grid>
                        </Box>
                      ))}

                    <Button onClick={() => push({ name: "", change: "5" })}>
                      Add attribute
                    </Button>
                  </Stack>
                )}
              </FieldArray>

              <FieldArray name="tags">
                {({ insert, remove, push }) => (
                  <Stack spacing={3}>
                    {props.values.tags.length > 0 &&
                      props.values.tags.map((friend, index) => (
                        <Box key={index}>
                          <Grid templateColumns="1fr 50px" gap={6}>
                            <Field
                              name={`tags.${index}`}
                              validate={validateTagName}
                            >
                              {({ field, form }) => {
                                let hasError, errText;
                                try {
                                  hasError =
                                    form.errors.tags[index] &&
                                    form.touched.tags[index];
                                  errText = form.errors.tags[index];
                                } catch (e) {}

                                return (
                                  <FormControl isInvalid={hasError}>
                                    <Input
                                      {...field}
                                      id={`tags.${index}`}
                                      placeholder="tag"
                                      variant="filled"
                                    />
                                    <FormErrorMessage>
                                      {errText}
                                    </FormErrorMessage>
                                  </FormControl>
                                );
                              }}
                            </Field>

                            <IconButton
                              colorScheme="gray"
                              variant="solid"
                              icon={<SmallCloseIcon />}
                              onClick={() => remove(index)}
                            />
                          </Grid>
                        </Box>
                      ))}

                    <Button onClick={() => push("")}>Add tag</Button>
                  </Stack>
                )}
              </FieldArray>

              {pro ? (
                <Field name="quality">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.quality && form.touched.quality}
                    >
                      <FormLabel htmlFor="quality">Quality</FormLabel>

                      <Select
                        {...field}
                        //placeholder="Select option"
                        variant="filled"
                      >
                        {itemQuality[mode].map((x, idx) => (
                          <option key={idx} value={idx}>
                            {x.label}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{form.errors.quality}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              ) : null}

              {pro ? (
                <Field name="authorShare">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={
                        form.errors.authorShare && form.touched.authorShare
                      }
                    >
                      <FormLabel htmlFor="authorShare">
                        <FormTip text="Royalties give you a percentage of the sale price each time an NFT gets sold">
                          Author royalties
                        </FormTip>
                      </FormLabel>
                      <Stack direction="horizontal">
                        <Slider
                          onChange={(v) => {
                            props.setFieldValue("authorShare", v);
                          }}
                          value={field.value}
                          min={0}
                          max={1.5}
                          step={0.1}
                        >
                          <SliderTrack>
                            <Box position="relative" right={10} />
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb boxSize={6} />
                        </Slider>
                        <Text w={"60px"} align="right">
                          {field.value}%
                        </Text>
                      </Stack>
                      <FormErrorMessage>
                        {form.errors.authorShare}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              ) : null}

              {false && pro ? (
                <Field name="price">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.price && form.touched.price}
                    >
                      <FormLabel htmlFor="price">Initial price</FormLabel>
                      <Stack direction="horizontal">
                        <NumberInput
                          {...field}
                          onChange={(num) => {
                            props.setFieldValue("price", num);
                          }}
                          w={"100%"}
                          precision={4}
                          step={0.01}
                          //max="0.12"
                          min="0"
                          variant="filled"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text pt="2" pl="4" w="60px">
                          ICP
                        </Text>
                      </Stack>

                      <FormErrorMessage>{form.errors.price}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              ) : null}

              {pro ? (
                <Box
                  {...(props.values.transfer === "bindsDuration"
                    ? {
                        borderWidth: "1px",
                        p: "3",
                        borderRadius: "10",
                        mt: "3",
                      }
                    : {})}
                >
                  <Stack spacing="2">
                    <Field name="transfer">
                      {({ field, form }) => (
                        <FormControl
                          isInvalid={
                            form.errors.transfer && form.touched.transfer
                          }
                        >
                          <FormLabel htmlFor="transfer">
                            <FormTip text="Note - the author can always transfer their tokens">
                              Transfer
                            </FormTip>
                          </FormLabel>

                          <Select
                            {...field}
                            //placeholder="Select option"
                            variant="filled"
                          >
                            {itemTransfer.map((x) => (
                              <option key={x.val} value={x.val}>
                                {x.label}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>
                            {form.errors.transfer}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>

                    {props.values.transfer === "bindsDuration" ? (
                      <Field
                        name="transfer_bind_duration"
                        validate={validateCooldown}
                      >
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.transfer_bind_duration &&
                              form.touched.transfer_bind_duration
                            }
                          >
                            <FormLabel htmlFor="transfer_bind_duration">
                              Bound duration in minutes
                            </FormLabel>

                            <NumberInput
                              {...field}
                              onChange={(num) => {
                                props.setFieldValue(
                                  "transfer_bind_duration",
                                  num
                                );
                              }}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <FormErrorMessage>
                              {form.errors.transfer_bind_duration}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    ) : null}
                  </Stack>
                </Box>
              ) : null}

              {/* {pro ? (
                <Field name="ttl">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.ttl && form.touched.ttl}
                    >
                      <FormLabel htmlFor="ttl">
                        <FormTip text="Once a token passes TTL it will be burned. 0 means forever">
                          Time to live in minutes
                        </FormTip>
                      </FormLabel>

                      <NumberInput
                        variant="filled"
                        {...field}
                        onChange={(num) => {
                          props.setFieldValue("ttl", num);
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>
                        {form.errors.ttl}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              ) : null} */}
            </Stack>

            {/* <Field name={"preset"}>
                {({ field, form }) => (
                  <PricingPresets
                    record={record}
                    valid={props.dirty && props.isValid}
                    onChange={(v) => {
                      form.setFieldValue("preset", v);
                    }}
                  />
                )}
              </Field> */}

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
                //rightIcon={<AnvilIcon />}
              >
                Mint
                {mintPrice ? (
                  <Tag colorScheme="blue" ml="3">
                    <ICP mode="dark">{mintPrice}</ICP>
                  </Tag>
                ) : null}
              </Button>
            </LoginRequired>
            {!pro ? (
              <Box fontSize="11px" align="center" mt="16px">
                For more options turn on <ProToggle />
              </Box>
            ) : null}
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
