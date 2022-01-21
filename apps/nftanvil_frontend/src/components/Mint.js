import React, { useEffect, useState } from "react";
import { mint, mint_quote } from "../reducers/nft";
import { proSet, setNftStorageModal } from "../reducers/user";
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
  useClipboard,
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
import { TX, ACC, TID, HASH, PWR, ICP } from "./Code";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { values } from "lodash";

export const Mint = () => {
  return <MintForm />;
};

export const ProToggle = () => {
  const dispatch = useDispatch();
  const pro = useSelector((state) => state.user.pro);

  return (
    <FormControl w={"110px"} ml="2px" display="inline-flex" alignItems="center">
      <FormLabel htmlFor="pro" mb="0">
        <Text fontSize="11px">ADVANCED</Text>
      </FormLabel>
      <Switch
        id="pro"
        isChecked={pro}
        onChange={(e) => dispatch(proSet(e.target.checked))}
      />
    </FormControl>
  );
};

export const PwrPrice = ({ record, valid }) => {
  const [pwrPrice, setPwrPrice] = useState(0);
  const dispatch = useDispatch();

  useDebounce(
    () => {
      if (!valid) return;
      setPwrPrice(0);
      dispatch(mint_quote(record2request(record))).then((re) => {
        setPwrPrice(re.transfer + re.ops + re.storage);
      });
    },
    1000,
    [record, valid, dispatch]
  );

  return (
    <Box p="1" ml="3" textAlign={"center"} fontSize="15px">
      {!pwrPrice ? (
        <Spinner
          thickness="2px"
          speed="0.85s"
          emptyColor="teal.200"
          color="teal.800"
          size="xs"
        />
      ) : (
        <>
          for <PWR>{pwrPrice}</PWR>
        </>
      )}
    </Box>
  );
};

const form2record = (v) => {
  let a = {
    domain: v.domain,
    author: [], // not sent to minting, temporary here for the preview
    price: {
      amount: AccountIdentifier.icpToE8s(v.price),
      marketplace: [],
      affiliate: [],
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
    ttl: parseInt(v.ttl, 10),
    attributes: v.attributes.map((x) => [
      x.name.toLowerCase(),
      parseInt(x.change, 10),
    ]),
    tags: v.tags.map((x) => x.toLowerCase()),
    content:
      v.content_storage === "internal" && v.content_internal?.url
        ? {
            internal: {
              url: v.content_internal.url,
              contentType: v.content_internal.type,
              size: v.content_internal.size,
            },
          }
        : v.content_storage === "ipfs" && v.content_ipfs?.url
        ? {
            ipfs: {
              url: v.content_ipfs.url,
              contentType: v.content_ipfs.type,
              size: v.content_ipfs.size,
            },
          }
        : v.content_storage === "external"
        ? {
            external: null,
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
        : v.thumb_storage === "ipfs" && v.thumb_ipfs?.url
        ? {
            ipfs: {
              url: v.thumb_ipfs.url,
              contentType: v.thumb_ipfs.type,
              size: v.thumb_ipfs.size,
            },
          }
        : v.thumb_storage === "external"
        ? {
            external: null,
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
    collectionId: v.collectionId ? v.collectionId : [],
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
  };
  return a;
};

export const MintForm = () => {
  const { width, height } = useWindowSize();
  const isDesktop = width > 480;
  const address = useSelector((state) => state.user.address);

  const dispatch = useDispatch();
  const pro = useSelector((state) => state.user.pro);
  const NFTStorageAPIKey = useSelector((state) => state.user.key_nftstorage);

  const devGetRecord = (values) => {
    let s = record2request(form2record(values));
    console.log(s);
  };

  const boxColor = useColorModeValue("white", "gray.600");
  const boxHeadColor = useColorModeValue("gray.200", "gray.700");

  return (
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
        ttl: 0,
        maxChildren: 0,
        attributes: [],
        content_storage: "internal",
        thumb_storage: "internal",
        secret: false,
        tags: [],
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
      {(props) => {
        let record = form2record(props.values);
        return (
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

                    <File
                      form={props}
                      name="content"
                      label="Content"
                      buttonLabel="Upload content image or video"
                      onChange={async (info) => {
                        if (info.type.indexOf("image/") !== -1) {
                          if (info.size > 1024 * 1024) {
                            let x = await resizeImage(info.url, 1280, 1280);
                            props.setFieldValue(
                              "content_" + props.values.content_storage,
                              x
                            );

                            toast.info(
                              "Image was too big. Resizing automatically",
                              { position: "bottom-center" }
                            );
                          }
                          let f = await resizeImage(info.url, 124, 124, true);
                          props.setFieldValue(
                            "thumb_" + props.values.thumb_storage,
                            f
                          );
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
                        if (info.type.indexOf("image/") !== -1) {
                          if (info.size > 1024 * 128) {
                            let x = await resizeImage(info.url, 124, 124);
                            props.setFieldValue(
                              "thumb_" + props.values.thumb_storage,
                              x
                            );
                            toast.info(
                              "Image was too big. Resizing automatically",
                              { position: "bottom-center" }
                            );
                          }
                        }
                      }}
                    />

                    {pro ? (
                      <Field name="domain" validate={validateDomain}>
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.domain && form.touched.domain
                            }
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
                          <FormErrorMessage>
                            {form.errors.name}
                          </FormErrorMessage>
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
                          <FormErrorMessage>
                            {form.errors.lore}
                          </FormErrorMessage>
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
                                          form.errors.attributes[index]
                                            .change &&
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
                                        errText =
                                          form.errors.attributes[index].name;
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

                          <Button
                            onClick={() => push({ name: "", change: "5" })}
                          >
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
                            isInvalid={
                              form.errors.quality && form.touched.quality
                            }
                          >
                            <FormLabel htmlFor="quality">Quality</FormLabel>

                            <Select
                              {...field}
                              //placeholder="Select option"
                              variant="filled"
                            >
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
                        sx={{
                          fontWeight: "bold",
                          paddingTop: "35px",
                          fontFamily: "Greycliff",
                        }}
                      >
                        Pricing
                      </Text>
                    ) : null}

                    {pro ? (
                      <Field name="authorShare">
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors.authorShare &&
                              form.touched.authorShare
                            }
                          >
                            <FormLabel htmlFor="authorShare">
                              <FormTip text="The % of subsequent sales the author recieves">
                                Subsequent sales share
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

                    {pro ? (
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

                            <FormErrorMessage>
                              {form.errors.price}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    ) : null}

                    {pro ? (
                      <Text
                        fontSize="28px"
                        sx={{
                          fontWeight: "bold",
                          paddingTop: "35px",
                          fontFamily: "Greycliff",
                        }}
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
                    ) : null}
                  </Stack>

                  {props.values.content_storage === "ipfs" ||
                  props.values.thumb_storage === "ipfs" ? (
                    <Button
                      mt={4}
                      w={"100%"}
                      size="sm"
                      {...(NFTStorageAPIKey?.length
                        ? {
                            rightIcon: <CheckIcon color="teal.200" />,
                          }
                        : {
                            colorScheme: "orange",
                          })}
                      onClick={() => {
                        dispatch(setNftStorageModal(true));
                      }}
                    >
                      {NFTStorageAPIKey?.length
                        ? "NFT.Storage API Key"
                        : "You need to set NFT.Storage API Key"}
                    </Button>
                  ) : null}

                  <LoginRequired label="Authenticate to mint">
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
                      Mint
                      {props.dirty && props.isValid ? (
                        <PwrPrice
                          record={record}
                          valid={
                            !props.isValidating && props.dirty && props.isValid
                          }
                        />
                      ) : null}
                    </Button>
                  </LoginRequired>
                  {!pro ? (
                    <Box fontSize="11px" align="center" mt="16px">
                      For more options turn on <ProToggle />
                    </Box>
                  ) : null}

                  {pro ? (
                    <Button
                      mt={4}
                      size="xs"
                      onClick={() => devGetRecord(props.values)}
                    >
                      Print structure in console
                    </Button>
                  ) : null}
                </Form>
              </Box>

              {props.dirty ? (
                <Box>
                  <NFTPreview {...record} />
                </Box>
              ) : null}
            </Stack>
          </>
        );
      }}
    </Formik>
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
  const keyStorage = name + "_storage";
  const keyInternal = name + "_internal";
  const keyIpfs = name + "_ipfs";
  const keyExternal = name + "_external";
  const showpro = form.values[keyStorage] === "external" || pro;
  return (
    <Box
      {...(showpro
        ? {
            borderWidth: "1px",
            p: "3",
            borderRadius: "10",
            mt: "3",
          }
        : {})}
    >
      <Stack spacing="2">
        {showpro ? <FormLabel htmlFor="ttl">{label}</FormLabel> : null}
        {showpro ? (
          <Field name={keyStorage}>
            {({ field, form }) => (
              <RadioGroup
                {...field}
                onChange={(x) => {
                  form.setFieldValue(keyStorage, x);
                }}
              >
                <Stack spacing={6} direction="row">
                  <Radio size="sm" value={"internal"}>
                    <FormTip text="Stored on Internet Computer">IC</FormTip>
                  </Radio>
                  <Radio size="sm" value={"ipfs"}>
                    <FormTip text="Stored on IPFS">IPFS</FormTip>
                  </Radio>

                  {/* <Radio size="sm" value={"external"}>
                    <FormTip text="Collection settings point to a renderer">
                      External
                    </FormTip>
                  </Radio> */}
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

        {form.values[keyStorage] === "ipfs" ? (
          <Field name={keyIpfs} validate={validateInternal}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors[keyIpfs]}>
                <FileInput
                  label={buttonLabel}
                  button={{ w: "100%" }}
                  {...field}
                  accept={accept}
                  onChange={(f) => {
                    form.setFieldValue(keyIpfs, f, true);
                    if (onChange) onChange(f);
                  }}
                />
                <FormErrorMessage>{form.errors[keyIpfs]}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
        ) : null}
      </Stack>
    </Box>
  );
};
