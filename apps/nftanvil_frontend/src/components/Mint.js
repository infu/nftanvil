import React from "react";
import moment from "moment";
import { mint } from "../reducers/nft";
import { proSet } from "../reducers/user";
import { LoginRequired } from "./LoginRequired";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
  Radio,
  RadioGroup,
  Tooltip,
  Wrap,
  WrapItem,
  useMediaQuery,
} from "@chakra-ui/react";
import { useWindowSize } from "react-use";

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
  Textarea,
  Text,
  Grid,
} from "@chakra-ui/react";
import { useClipboard, useColorMode } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
} from "@chakra-ui/react";

import {
  CloseIcon,
  SmallCloseIcon,
  CopyIcon,
  AddIcon,
  WarningIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { Formik, Field, Form, FieldArray } from "formik";
import { Switch } from "@chakra-ui/react";
import { challengeDraw } from "@vvv-interactive/nftanvil-tools/cjs/image.js";
import { createStandaloneToast } from "@chakra-ui/react";
import { theme } from "../theme.js";
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
  validateQuality,
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
} from "@vvv-interactive/nftanvil-tools/cjs/validate.js";
export const Mint = () => {
  return <MintForm />;
};

export const ProToggle = () => {
  const dispatch = useDispatch();
  const pro = useSelector((state) => state.user.pro);

  return (
    <FormControl w={"80px"} display="flex" alignItems="center">
      <FormLabel htmlFor="pro" mb="0">
        <Text fontSize="13px">PRO</Text>
      </FormLabel>
      <Switch
        id="pro"
        isChecked={pro}
        onChange={(e) => dispatch(proSet(e.target.checked))}
      />
    </FormControl>
  );
};

export const MintForm = () => {
  const { width, height } = useWindowSize();
  const isDesktop = width > 480;

  const dispatch = useDispatch();
  const pro = useSelector((state) => state.user.pro);

  const form2record = (v) => {
    let a = {
      name: v.name,
      lore: v.lore,
      use: v.use
        ? {
            [v.use]: {
              desc: v.use_desc,
              duration: parseInt(v.use_duration, 10),
              useId: v.use_id,
            },
          }
        : null,
      transfer: {
        [v.transfer]:
          v.transfer === "bindsDuration"
            ? parseInt(v.transfer_bind_duration, 10)
            : null,
      },
      hold: v.hold
        ? {
            [v.hold]: {
              desc: v.hold_desc,
              holdId: v.hold_id,
            },
          }
        : null,
      quality: parseInt(v.quality, 10),
      ttl: parseInt(v.ttl, 10),
      attributes: v.attributes.map((x) => [
        x.name.toLowerCase(),
        parseInt(x.change, 10),
      ]),

      content:
        v.content_storage === "internal" && v.content_internal?.url
          ? {
              internal: {
                url: v.content_internal.url,
                contentType: v.content_internal.type,
                size: v.content_internal.size,
              },
            }
          : v.content_storage === "external"
          ? {
              external: {
                idx: parseInt(v.content_external_idx, 10),
                contentType: v.content_external_type,
              },
            }
          : null,

      thumb:
        v.thumb_storage === "internal" && v.thumb_internal?.url
          ? {
              internal: {
                url: v.thumb_internal.url,
                contentType: v.thumb_internal.type,
                size: v.thumb_internal.size,
              },
            }
          : v.thumb_storage === "external"
          ? {
              external: {
                idx: parseInt(v.thumb_external_idx, 10),
                contentType: v.thumb_external_type,
              },
            }
          : null,
      extensionCanister: v.extensionCanister,
      secret: v.secret,
    };
    return a;
  };

  const record2request = (v) => {
    let a = {
      name: [v.name].filter(Boolean),
      lore: [v.lore].filter(Boolean),
      use: [v.use].filter(Boolean),
      transfer: v.transfer,
      hold: [v.hold].filter(Boolean),
      quality: v.quality,
      ttl: [v.ttl].filter(Boolean),
      attributes: v.attributes.filter(Boolean),
      content: [v.content].filter(Boolean),
      thumb: v.thumb,
      secret: v.secret,
      extensionCanister: [
        v.extensionCanister ? Principal.fromText(v.extensionCanister) : null,
      ].filter(Boolean),
    };

    return a;
  };

  const devGetRecord = (values) => {
    console.log(record2request(form2record(values)));
  };

  const boxColor = useColorModeValue("white", "gray.600");
  const boxHeadColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Formik
      validate={mintFormValidate}
      initialValues={{
        name: "",
        quality: 1,
        transfer: "unrestricted",
        use_duration: 30,
        use_id: "",
        hold_desc: "",
        hold_id: "",
        transfer_bind_duration: 1440,
        ttl: 0,
        maxChildren: 0,
        attributes: [],
        content_storage: "internal",
        content_external_idx: 0,
        thumb_storage: "internal",
        thumb_external_idx: 0,
        secret: false,
      }}
      onSubmit={(values, actions) => {
        // setInterval(() => {

        setTimeout(() => {
          actions.setSubmitting(false);
        }, 500);

        // console.log("FORM VALUES", values);
        // dispatch(mint());
        // }, 1000);

        dispatch(mint(record2request(form2record(values))));
        // dispatch(sendSolution(values.code));
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
                  <Text fontSize="28px" sx={{ fontFamily: "Greycliff" }}>
                    Mint
                  </Text>
                  <Spacer />
                  <ProToggle />
                </Flex>

                <Stack spacing={3}>
                  {/* {parentsAvailable.length ? (
                  <Field name="parentId">
                    {({ field, form }) => (
                      <FormControl>
                        <FormLabel htmlFor="sel">Parent</FormLabel>

                        <Select {...field} placeholder="None">
                          {parentsAvailable.map((x) => (
                            <option value={x.val}>{x.label}</option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>
                ) : (
                  ""
                )} */}

                  {pro ? (
                    <Field name="domain" validate={validateDomain}>
                      {({ field, form }) => (
                        <FormControl
                          isInvalid={form.errors.domain && form.touched.domain}
                        >
                          <FormLabel htmlFor="domain">
                            <FormTip text="Verify domain by placing /.well-known/nftanvil.json with [allowed minter principal ids]">
                              Verified domain
                            </FormTip>
                          </FormLabel>
                          <Input
                            {...field}
                            id="domain"
                            placeholder="yourdomain.com"
                          />
                          <FormErrorMessage>
                            {form.errors.domain}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  ) : null}
                  {pro ? (
                    <Field
                      name="extensionCanister"
                      validate={validateExtensionCanister}
                    >
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.extensionCanister}>
                          <FormLabel htmlFor="extensionCanister">
                            <FormTip text="Used by developers to extend the functionality and customize their tokens">
                              Extension canister
                            </FormTip>
                          </FormLabel>
                          <Input
                            {...field}
                            id="extensionCanister"
                            placeholder="acvs-efwe..."
                          />
                          <FormErrorMessage>
                            {form.errors.extensionCanister}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  ) : null}
                  <File
                    form={props}
                    name="content"
                    label="Content"
                    buttonLabel="Upload content image or video"
                    onChange={async (info) => {
                      if (info.type.indexOf("image/") !== -1) {
                        if (info.size > 1024 * 1024) {
                          let x = await resizeImage(info.url, 1280, 1280);
                          props.setFieldValue("content_internal", x);
                          const toast = createStandaloneToast({ theme });
                          toast({
                            title: "Image was too big",
                            description: "It was automatically resized",
                            status: "info",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                        let f = await resizeImage(info.url, 96, 96, true);
                        props.setFieldValue("thumb_internal", f);
                      }
                    }}
                    accept="image/*,video/*"
                    validateInternal={validateContentInternal}
                    validateExternal={validateExternal}
                    validateExternalType={validateExternalType}
                    pro={pro}
                  />
                  <Field name="secret">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.secret}
                        display="flex"
                        alignItems="center"
                      >
                        <FormLabel htmlFor="secret" mb="0">
                          <FormTip text="Content will be visible only to the owner. It's stored inside IC's private canister memory">
                            Secret content
                          </FormTip>
                        </FormLabel>
                        <Switch {...field} id="secret" />
                        <FormErrorMessage ml="10px" mt="-3px">
                          {form.errors.secret}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

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
                      console.log("III", info);
                      if (info.type.indexOf("image/") !== -1) {
                        if (info.size > 1024 * 128) {
                          let x = await resizeImage(info.url, 96, 96);
                          props.setFieldValue("thumb_internal", x);
                          const toast = createStandaloneToast({ theme });
                          toast({
                            title: "Thumb image was too big",
                            description: "It was automatically resized",
                            status: "info",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }
                    }}
                  />

                  <Field name="name" validate={validateName}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.name && form.touched.name}
                      >
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <Input {...field} id="name" placeholder="Excalibur" />
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
                                      errText =
                                        form.errors.attributes[index].name;
                                    } catch (e) {}

                                    return (
                                      <FormControl isInvalid={hasError}>
                                        <Input
                                          {...field}
                                          id={`attributes.${index}.name`}
                                          placeholder="Intellect"
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
                  {pro ? (
                    <Field name="quality" validate={validateQuality}>
                      {({ field, form }) => (
                        <FormControl
                          isInvalid={
                            form.errors.quality && form.touched.quality
                          }
                        >
                          <FormLabel htmlFor="quality">Quality</FormLabel>

                          <Select {...field} placeholder="Select option">
                            {itemQuality.map((x, idx) => (
                              <option key={idx} value={idx}>
                                {x.label}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>
                            {form.errors.quality}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  ) : null}
                  {pro ? (
                    <Text
                      fontSize="28px"
                      sx={{ paddingTop: "35px", fontFamily: "Greycliff" }}
                    >
                      Effects
                    </Text>
                  ) : null}
                  {pro ? (
                    <Box
                      {...(props.values.hold
                        ? {
                            borderWidth: "1px",
                            p: "3",
                            borderRadius: "10",
                            mt: "3",
                          }
                        : {})}
                    >
                      <Stack spacing="2">
                        <Field name="hold">
                          {({ field, form }) => (
                            <FormControl
                              isInvalid={form.errors.hold && form.touched.hold}
                            >
                              <FormLabel htmlFor="hold">
                                <FormTip text="External system or canister can check who is the holder at any moment and reward them">
                                  Hold
                                </FormTip>
                              </FormLabel>

                              <Select {...field} placeholder="None">
                                {itemHold.map((x) => (
                                  <option key={x.val} value={x.val}>
                                    {x.label}
                                  </option>
                                ))}
                              </Select>
                              <FormErrorMessage>
                                {form.errors.hold}
                              </FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>

                        {props.values.hold ? (
                          <Field
                            name="hold_desc"
                            validate={validateDescriptionOrNone}
                          >
                            {({ field, form }) => (
                              <FormControl
                                isInvalid={
                                  form.errors.hold_desc &&
                                  form.touched.hold_desc
                                }
                              >
                                <FormLabel htmlFor="hold_desc">
                                  Description
                                </FormLabel>
                                <Textarea
                                  {...field}
                                  resize="none"
                                  maxLength={256}
                                  id="hold_desc"
                                  placeholder="Holding it attracts airdrops"
                                />
                                <FormErrorMessage>
                                  {form.errors.hold_desc}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        ) : null}

                        {props.values.hold ? (
                          <Field name="hold_id" validate={validateHoldId}>
                            {({ field, form }) => (
                              <FormControl
                                isInvalid={
                                  form.errors.hold_id && form.touched.hold_id
                                }
                              >
                                <FormLabel htmlFor="hold_id">
                                  <FormTip text="Custom id used by the Extension canister">
                                    Hold Id
                                  </FormTip>
                                </FormLabel>
                                <Input
                                  {...field}
                                  id="hold_id"
                                  placeholder="myholdbonus"
                                />
                                <FormErrorMessage>
                                  {form.errors.hold_id}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        ) : null}
                      </Stack>
                    </Box>
                  ) : null}

                  {pro ? (
                    <Box
                      {...(props.values.use
                        ? {
                            borderWidth: "1px",
                            p: "3",
                            borderRadius: "10",
                            mt: "3",
                          }
                        : {})}
                    >
                      <Stack spacing="2">
                        <Field name="use">
                          {({ field, form }) => (
                            <FormControl
                              isInvalid={form.errors.use && form.touched.use}
                            >
                              <FormLabel htmlFor="use">
                                <FormTip text="When used, the item will send message to the Extension canister">
                                  Use
                                </FormTip>
                              </FormLabel>

                              <Select {...field} placeholder="None">
                                {itemUse.map((x) => (
                                  <option key={x.val} value={x.val}>
                                    {x.label}
                                  </option>
                                ))}
                              </Select>
                              <FormErrorMessage>
                                {form.errors.use}
                              </FormErrorMessage>
                            </FormControl>
                          )}
                        </Field>
                        {props.values.use ? (
                          <Field name="use_desc" validate={validateDescription}>
                            {({ field, form }) => (
                              <FormControl
                                isInvalid={
                                  form.errors.use_desc && form.touched.use_desc
                                }
                              >
                                <FormLabel htmlFor="use_desc">
                                  Effect description
                                </FormLabel>
                                <Textarea
                                  {...field}
                                  resize="none"
                                  maxLength={256}
                                  id="use_desc"
                                  placeholder="Makes you invincible"
                                />
                                <FormErrorMessage>
                                  {form.errors.use_desc}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        ) : null}
                        {props.values.use === "cooldown" ? (
                          <Field
                            name="use_duration"
                            validate={validateCooldown}
                          >
                            {({ field, form }) => (
                              <FormControl
                                isInvalid={
                                  form.errors.use_duration &&
                                  form.touched.use_duration
                                }
                              >
                                <FormLabel htmlFor="use_duration">
                                  Cooldown in minutes
                                </FormLabel>

                                <NumberInput
                                  {...field}
                                  onChange={(num) => {
                                    props.setFieldValue("use_duration", num);
                                  }}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                <FormErrorMessage>
                                  {form.errors.use_duration}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        ) : null}

                        {props.values.use ? (
                          <Field name="use_id" validate={validateUseId}>
                            {({ field, form }) => (
                              <FormControl
                                isInvalid={
                                  form.errors.use_id && form.touched.use_id
                                }
                              >
                                <FormLabel htmlFor="use_id">Use Id</FormLabel>
                                <Input
                                  {...field}
                                  id="use_id"
                                  placeholder="myeffect"
                                />
                                <FormErrorMessage>
                                  {form.errors.use_id}
                                </FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>
                        ) : null}
                      </Stack>
                    </Box>
                  ) : null}

                  {pro ? (
                    <Text
                      fontSize="28px"
                      sx={{ paddingTop: "35px", fontFamily: "Greycliff" }}
                    >
                      Flow
                    </Text>
                  ) : null}
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
                              <FormTip text="Note - the minter can always transfer their tokens">
                                Transfer
                              </FormTip>
                            </FormLabel>

                            <Select {...field} placeholder="Select option">
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

                  {pro ? (
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
                          <FormErrorMessage>{form.errors.ttl}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  ) : null}
                </Stack>

                <LoginRequired label="Authenticate to mint">
                  <Button
                    mt={4}
                    w={"100%"}
                    colorScheme="teal"
                    isLoading={props.isSubmitting}
                    type="submit"
                  >
                    Mint
                  </Button>
                </LoginRequired>
                {/* <Button
                mt={4}
                size="sm"
                onClick={() => devGetRecord(props.values)}
              >
                &lt;&gt;
              </Button> */}
              </Form>
            </Box>

            {props.dirty ? (
              <Box>
                <NFTPreview {...form2record(props.values)} />
              </Box>
            ) : null}
          </Stack>
        </>
      )}
    </Formik>
  );
};

const FormTip = ({ children, text }) => {
  return (
    <Tooltip placement="top-start" label={text}>
      <Text>
        {children}{" "}
        <InfoOutlineIcon color={"gray.500"} w={3} h={3} mt={"-3px"} />
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
  const keyStorage = name + "_storage";
  const keyInternal = name + "_internal";
  const keyExternal = name + "_external";

  return (
    <Box
      {...(pro
        ? {
            borderWidth: "1px",
            p: "3",
            borderRadius: "10",
            mt: "3",
          }
        : {})}
    >
      <Stack spacing="2">
        {pro ? <FormLabel htmlFor="ttl">{label}</FormLabel> : null}
        {pro ? (
          <Field name={keyStorage}>
            {({ field, form }) => (
              <RadioGroup
                {...field}
                onChange={(x) => {
                  form.setFieldValue(keyStorage, x);
                }}
              >
                <Stack spacing={1} direction="row">
                  <Radio size="sm" mr={"10px"} value={"internal"}>
                    <FormTip text="NFTAnvil will store all data">
                      Internal
                    </FormTip>
                  </Radio>
                  <Radio size="sm" value={"external"}>
                    <FormTip text="Extension canister is responsible for providing data">
                      External
                    </FormTip>
                  </Radio>
                </Stack>
              </RadioGroup>
            )}
          </Field>
        ) : null}

        {form.values[keyStorage] === "internal" ? (
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
        ) : null}

        {form.values[keyStorage] === "external" ? (
          <Field name={keyExternal + "_idx"} validate={validateExternal}>
            {({ field, form }) => (
              <FormControl
                isInvalid={
                  form.errors[keyExternal + "_idx"] &&
                  form.touched[keyExternal + "_idx"]
                }
              >
                <FormLabel htmlFor={keyExternal + "_idx"}>Index</FormLabel>
                <Input {...field} placeholder="5" id={keyExternal + "_idx"} />
                <FormErrorMessage>
                  {form.errors[keyExternal + "_idx"]}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
        ) : null}

        {form.values[keyStorage] === "external" ? (
          <Field name={keyExternal + "_type"} validate={validateExternalType}>
            {({ field, form }) => (
              <FormControl
                isInvalid={
                  form.errors[keyExternal + "_type"] &&
                  form.touched[keyExternal + "_type"]
                }
              >
                <FormLabel htmlFor={keyExternal + "_type"}>
                  Content type
                </FormLabel>
                <Input
                  {...field}
                  id={keyExternal + "_type"}
                  placeholder="image/jpeg"
                />
                <FormErrorMessage>
                  {form.errors[keyExternal + "_type"]}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
        ) : null}
      </Stack>
    </Box>
  );
};
