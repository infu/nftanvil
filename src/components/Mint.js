import React from "react";
import moment from "moment";
import { mint } from "../reducers/nft";
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
import { challengeDraw } from "../purefunc/image";

import { itemQuality, itemTransfer, itemUse, itemHold } from "../item_config";
import { FileInput } from "./FileInput";
import { NFTPreview } from "./NFT";
import { resizeImage } from "../purefunc/image";
import { Principal } from "@dfinity/principal";

export const Mint = () => {
  const dispatch = useDispatch();

  return <MintForm />;
};

export const MintForm = () => {
  const dispatch = useDispatch();
  function validateName(value) {
    if (!value) return null;
    return !(value.length > 2 && value.length < 128)
      ? "Must be between 2 and 128 characters"
      : null;
  }

  function validateQuality(val) {
    if (val > 1) return "Currently 'common' is the maximum quality allowed";
    return null;
  }

  function validateDescription(val) {
    if (typeof val !== "string") return null;
    if (val.length < 10 || val.length > 256)
      return "Must be between 10 and 256 characters";
  }
  function validateThumbInternal(val) {
    if (!val) return;
    if (val.size > 1024 * 512) return "Maximum file size is 512 KB";
  }

  function validateContentInternal(val) {
    if (!val) return;
    if (val.size > 1024 * 1024 * 5) return "Maximum file size is 5 MB";
  }
  function validateExternal(val) {
    if (!val) return;
    if (isNaN(val)) return "If specified, it must be 32 bit natural number";
  }
  function validateExternalType(val) {
    if (!val) return "Must be specified";
    if (val.length < 3) return "Not a valid content type";
  }
  function validateDescriptionOrNone(val) {
    if (typeof val !== "string") return null;
    if (val.trim().length === 0) return null;
    if (val.length < 10 || val.length > 256)
      return "Must be none or between 10 and 256 characters";
  }

  function validateCooldown(val) {
    if (val < 1) return "Has to be at least one minute";
  }
  function validateAttributeName(val) {
    if (typeof val !== "string") return null;
    if (val.length < 3) return "Too short";
  }

  function validateAttributeChange(val) {
    if (parseInt(val, 10) === 0) return "Can't be zero";
  }

  const form2record = (v) => {
    let a = {
      name: v.name,
      lore: v.lore,
      use: v.use
        ? {
            [v.use]: {
              desc: v.use_desc,
              duration: v.use_duration,
              useId: v.use_id,
            },
          }
        : null,
      transfer: {
        [v.transfer]:
          v.transfer === "bindsDuration" ? v.transfer_bind_duration : null,
      },
      hold: v.hold
        ? {
            [v.hold]: {
              desc: v.hold_desc,
              holdId: v.hold_id,
            },
          }
        : null,
      quality: v.quality,
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
          : {
              external: {
                idx: parseInt(v.content_external_idx, 10),
                contentType: v.content_external_type,
              },
            },

      thumb:
        v.thumb_storage === "internal" && v.thumb_internal?.url
          ? {
              internal: {
                url: v.thumb_internal.url,
                contentType: v.thumb_internal.type,
                size: v.thumb_internal.size,
              },
            }
          : {
              external: {
                idx: parseInt(v.content_external_idx, 10),
                contentType: v.content_external_type,
              },
            },
      extensionCanister: v.extensionCanister,
      secret: v.secret,
    };
    console.log(a);
    return a;
  };

  const record2request = (v) => {
    // v = JSON.parse(JSON.stringify(v));
    // _.unset(v, "content.internal.url");
    // _.unset(v, "thumb.internal.url");

    // _.update(v, "use.cooldown.cannister", (x) => {
    //   return x ? Principal.fromText(x) : undefined;
    // });
    // _.update(v, "use.consumable.cannister", (x) => {
    //   return x ? Principal.fromText(x) : undefined;
    // });
    if (v?.content?.external)
      v.content.external.idx = [v.content.external.idx].filter(Boolean);
    if (v?.thumb?.external)
      v.thumb.external.idx = [v.thumb.external.idx].filter(Boolean);

    let a = {
      name: [v.name].filter(Boolean),
      lore: [v.lore].filter(Boolean),
      use: [v.use].filter(Boolean),
      transfer: [v.transfer].filter(Boolean),
      hold: [v.hold].filter(Boolean),
      quality: [v.quality].filter(Boolean),
      ttl: [v.ttl].filter(Boolean),
      attributes: v.attributes.filter(Boolean),
      content: [v.content].filter(Boolean),
      thumb: v.thumb,
      secret: v.secret,
      extensionCanister: [
        v.extensionCanister ? Principal.fromText(v.extensionCanister) : null,
      ].filter(Boolean),
    };

    console.log("req", a);
    return a;
  };
  const boxColor = useColorModeValue("white", "gray.600");
  return (
    <Formik
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
        thumb_storage: "internal",
        secret: false,
      }}
      onSubmit={(values, actions) => {
        // setInterval(() => {
        actions.setSubmitting(false);

        console.log("FORM VALUES", values);
        // dispatch(mint());
        // }, 1000);

        dispatch(mint(record2request(form2record(values))));
        // dispatch(sendSolution(values.code));
      }}
    >
      {(props) => (
        <Flex>
          <Box
            bg={boxColor}
            borderRadius="md"
            border={1}
            mt={"80px"}
            w={480}
            p={5}
          >
            <Form>
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

                <File
                  form={props}
                  name="content"
                  label="Content"
                  buttonLabel="Upload image / video"
                  onChange={async (info) => {
                    let f = await resizeImage(info.url, 96, 96, true);
                    // props.setFieldValue("thumb_storage", "internal");
                    props.setFieldValue("thumb_internal", f);
                  }}
                  accept="image/*,video/*"
                  validateInternal={validateContentInternal}
                  validateExternal={validateExternal}
                  validateExternalType={validateExternalType}
                />
                <Field name="secret">
                  {({ field, form }) => (
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="secret" mb="0">
                        Secret
                      </FormLabel>
                      <Switch {...field} id="secret" />
                    </FormControl>
                  )}
                </Field>

                <File
                  form={props}
                  label="Thumb"
                  name="thumb"
                  accept="image/*"
                  buttonLabel="Upload image"
                  validateInternal={validateThumbInternal}
                  validateExternal={validateExternal}
                  validateExternalType={validateExternalType}
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
                  {" "}
                  <Stack spacing="2">
                    <Field name="hold">
                      {({ field, form }) => (
                        <FormControl
                          isInvalid={form.errors.hold && form.touched.hold}
                        >
                          <FormLabel htmlFor="hold">Hold</FormLabel>

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
                              form.errors.hold_desc && form.touched.hold_desc
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
                      <Field name="hold_id">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.hold_id && form.touched.hold_id
                            }
                          >
                            <FormLabel htmlFor="hold_id">Hold Id</FormLabel>
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
                  {" "}
                  <Stack spacing="2">
                    <Field name="use">
                      {({ field, form }) => (
                        <FormControl
                          isInvalid={form.errors.use && form.touched.use}
                        >
                          <FormLabel htmlFor="use">Use</FormLabel>

                          <Select {...field} placeholder="None">
                            {itemUse.map((x) => (
                              <option key={x.val} value={x.val}>
                                {x.label}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>{form.errors.use}</FormErrorMessage>
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
                      <Field name="use_duration" validate={validateCooldown}>
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
                      <Field name="use_id">
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

                <Field name="extensionCanister">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={
                        form.errors.extensionCanister &&
                        form.touched.extensionCanister
                      }
                    >
                      <FormLabel htmlFor="extensionCanister">
                        Extension Canister
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
                  {" "}
                  <Stack spacing="2">
                    <Field name="transfer">
                      {({ field, form }) => (
                        <FormControl
                          isInvalid={
                            form.errors.transfer && form.touched.transfer
                          }
                        >
                          <FormLabel htmlFor="transfer">Transfer</FormLabel>

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
                <Field name="quality" validate={validateQuality}>
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.quality && form.touched.quality}
                    >
                      <FormLabel htmlFor="quality">Quality</FormLabel>

                      <Select {...field} placeholder="Select option">
                        {itemQuality.map((x, idx) => (
                          <option key={idx} value={idx}>
                            {x.label}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>{form.errors.quality}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="ttl">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.ttl && form.touched.ttl}
                    >
                      <FormLabel htmlFor="ttl">
                        Time to live in minutes
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

                {/* 
                <Field name="maxChildren">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={
                        form.errors.maxChildren && form.touched.maxChildren
                      }
                    >
                      <FormLabel htmlFor="maxChildren">
                        Maximum children
                      </FormLabel>

                      <NumberInput
                        {...field}
                        onChange={(num) => {
                          props.setFieldValue("maxChildren", num);
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>
                        {form.errors.maxChildren}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field> */}
              </Stack>
              <Button
                mt={4}
                w={"100%"}
                colorScheme="teal"
                isLoading={props.isSubmitting}
                type="submit"
              >
                Mint
              </Button>
            </Form>
          </Box>
          <Box>
            <Center>
              <NFTPreview {...form2record(props.values)} />
            </Center>
          </Box>
        </Flex>
      )}
    </Formik>
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
}) => {
  const keyStorage = name + "_storage";
  const keyInternal = name + "_internal";
  const keyExternal = name + "_external";

  return (
    <Box borderWidth="1px" p="3" borderRadius="10" mt="3">
      <Stack spacing="2">
        <FormLabel htmlFor="ttl">{label}</FormLabel>
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
                  Internal
                </Radio>
                <Radio size="sm" value={"external"}>
                  External
                </Radio>
              </Stack>
            </RadioGroup>
          )}
        </Field>

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
                {" "}
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
