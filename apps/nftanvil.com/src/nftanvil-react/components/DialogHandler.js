/* global BigInt */

import React, { useEffect, useRef, useState } from "react";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import {
  calcRate,
  calcRateRev,
} from "@vvv-interactive/nftanvil-tools/cjs/dex.js";
import { err2text } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  Auth,
  AuthII,
  user_logout,
  FTAbstract,
  useDexPools,
  useInventoryToken,
  useFT,
  dex_swap,
} from "../index.js";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  HStack,
  Tag,
  Text,
  Stack,
  Wrap,
  Box,
  IconButton,
  Textarea,
} from "@chakra-ui/react";

import { LogOff } from "../icons";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";
import { AccountIcon } from "./AccountIcon";

import {
  Center,
  Button,
  useDisclosure,
  FormLabel,
  FormControl,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { dialogResult } from "../reducers/dialog";
import { FTImage } from "./FT";

import {
  ArrowForwardIcon,
  ArrowBackIcon,
  ArrowDownIcon,
} from "@chakra-ui/icons";
import { DEX_SWAP_FEE } from "../config";
import { task_start, task_end, task_run } from "../reducers/task";

import debounce from "lodash/debounce";
import { TaskButton } from "./TaskButton";

export const DialogHandler = () => {
  const dialogs = useSelector((state) => state.dialog);
  const dispatch = useDispatch();

  return Object.keys(dialogs).map((name) => {
    if (name === "transfer")
      return (
        <TransferModal
          key={name}
          {...dialogs[name]}
          onResult={(v) => dispatch(dialogResult({ name, result: v }))}
          onClose={() =>
            dispatch(dialogResult({ name, result: true, reject: true }))
          }
        />
      );
    else if (name === "confirm")
      return (
        <ConfirmModal
          key={name}
          {...dialogs[name]}
          onResult={(v) => dispatch(dialogResult({ name, result: v }))}
          onClose={() =>
            dispatch(dialogResult({ name, result: true, reject: true }))
          }
        />
      );
    else if (name === "select_account")
      return (
        <AccountSelectModal
          key={name}
          {...dialogs[name]}
          onResult={(v) => dispatch(dialogResult({ name, result: v }))}
          onClose={() =>
            dispatch(dialogResult({ name, result: true, reject: true }))
          }
        />
      );
    else if (name === "select_another_account")
      return (
        <AccountSelectAnotherModal
          key={name}
          {...dialogs[name]}
          onResult={(v) => dispatch(dialogResult({ name, result: v }))}
          onClose={() =>
            dispatch(dialogResult({ name, result: true, reject: true }))
          }
        />
      );
    if (name === "dex_add_liquidity")
      return (
        <AddLiquidityModal
          key={name}
          {...dialogs[name]}
          onResult={(v) => dispatch(dialogResult({ name, result: v }))}
          onClose={() =>
            dispatch(dialogResult({ name, result: true, reject: true }))
          }
        />
      );
    if (name === "dex_swap")
      return (
        <SwapModal
          key={name}
          {...dialogs[name]}
          onResult={(v) => dispatch(dialogResult({ name, result: v }))}
          onClose={() =>
            dispatch(dialogResult({ name, result: true, reject: true }))
          }
        />
      );
    else return null;
  });
};

export const AccountSelectModal = ({ title, onClose, onResult }) => {
  const accounts = useSelector((state) => state.user.accounts);
  const [customAccount, setCustomAccount] = React.useState("");
  const authenticated = useSelector((state) => state.user.authenticated);
  const authenticated_ii = useSelector((state) => state.user.authenticated_ii);
  const dispatch = useDispatch();

  const beta = window.localStorage.getItem("beta") || false;

  return (
    <Modal
      onClose={onClose}
      isOpen={true}
      isCentered
      size={"sm"}
      preserveScrollBarGap={true}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {authenticated || authenticated_ii
            ? title || "Select account"
            : "Select identity"}
        </ModalHeader>
        <ModalCloseButton />
        {authenticated || authenticated_ii ? (
          <IconButton
            size="sm"
            onClick={() => {
              dispatch(user_logout());
            }}
            icon={<LogOff width="1em" height="1em" />}
            bg={"transparent"}
            sx={{ position: "absolute", top: 2, right: 50 }}
          />
        ) : null}
        <ModalBody pb="10">
          <Center>
            <Stack justifyContent={"center"} textAlign="center" spacing="4">
              {beta && !authenticated ? (
                <>
                  {authenticated || authenticated_ii ? (
                    <Text fontSize="sm" color="gray.400" pt="8">
                      Add another identity
                    </Text>
                  ) : null}
                  <Auth />
                </>
              ) : (
                <DisplayAccounts
                  onResult={onResult}
                  accounts={accounts}
                  provider="vvv"
                />
              )}

              {!authenticated_ii ? (
                <>
                  {authenticated || authenticated_ii ? (
                    <Text fontSize="sm" color="gray.400" pt="8">
                      Add another identity
                    </Text>
                  ) : null}
                  <AuthII />
                </>
              ) : (
                <DisplayAccounts
                  onResult={onResult}
                  accounts={accounts}
                  provider="ii"
                />
              )}
            </Stack>
          </Center>

          {/* <Text mt={3} color="gray.500" textAlign="center">
            OR
          </Text>
          <HStack mt={4} mb={6} ml="5" mr="5">
            <Input
              placeholder="a00f..."
              onChange={(e) => setCustomAccount(e.target.value)}
            />
            {customAccount !== "" ? (
              <Button onClick={() => onResult(customAccount)}>Ok</Button>
            ) : null}
          </HStack> */}
        </ModalBody>
        {/* <ModalFooter>
          <HStack>
            <Button onClick={onClose}>Cancel</Button>
          </HStack>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export const AccountSelectAnotherModal = ({ title, onClose, onResult }) => {
  const [customAccount, setCustomAccount] = React.useState("");

  return (
    <Modal
      onClose={onClose}
      isOpen={true}
      isCentered
      size={"md"}
      preserveScrollBarGap={true}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select another account</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Textarea
            placeholder="a00f..."
            onChange={(e) => setCustomAccount(e.target.value)}
            resize="none"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={customAccount === ""}
            onClick={() => onResult(customAccount)}
          >
            Ok
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DisplayAccounts = ({ accounts, provider, onResult }) => {
  return (
    <Wrap spacing={4}>
      {Object.keys(accounts).map((address, idx) => {
        if (accounts[address].provider !== provider) return null;
        return (
          <Box
            sx={{ cursor: "pointer" }}
            onClick={() => onResult(address)}
            key={idx}
            border="1px"
            borderRadius="5"
            p={2}
            borderColor="gray.500"
          >
            <AccountIcon
              address={address}
              provider={accounts[address].provider}
            />
            <Text fontSize="xs" textAlign="center">
              {address.substring(0, 4) + "..." + address.slice(-4)}
            </Text>
          </Box>
        );
      })}
    </Wrap>
  );
};

export const ConfirmModal = ({ title, content, onClose, onResult }) => {
  return (
    <Modal onClose={onClose} isOpen={true} isCentered size={"sm"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{content}</ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            ml={3}
            onClick={() =>
              onResult({
                ok: true,
              })
            }
          >
            Ok
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const TransferModal = ({
  from_aid,
  to_aid,
  token,
  onClose,
  onResult,
}) => {
  const dispatch = useDispatch();

  const initialRef = React.useRef();
  const [amount_one, setAmountOne] = React.useState(0);
  const [textAmount, setTextAmount] = React.useState(0);

  const [showTooltip, setShowTooltip] = React.useState(false);

  const meta = useFT(token.id); //useSelector((state) => state.ft[token.id]);

  const max =
    "fractionless" in meta.kind
      ? token.bal // Math.round(token.bal / (100000000 - 500))
      : (BigInt(token.bal) - BigInt(meta.fee)).toString();

  // let whole = Math.round(dt / (100000000 - 500));
  // console.log(max, whole);

  const percentAmount = Number(
    (BigInt(100) * BigInt(amount_one)) / BigInt(max)
  );

  return (
    <Modal
      initialFocusRef={initialRef}
      onClose={onClose}
      isOpen={true}
      isCentered
      size={"sm"}
      preserveScrollBarGap={true}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Send</Text>
            <FTImage
              id={token.id}
              style={{ width: "32px", height: "32px", borderRadius: "5px" }}
            />
            <Text>{meta.symbol}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Center>
            <HStack>
              <AccountIcon address={from_aid} />
              <Box>
                <ArrowForwardIcon />
              </Box>
              <AccountIcon address={to_aid} />
            </HStack>
          </Center>
          <FormControl>
            <FormLabel>Amount</FormLabel>

            <Slider
              key="x"
              defaultValue={0}
              min={0}
              max={100}
              value={percentAmount}
              colorScheme="teal"
              focusThumbOnChange={false}
              onChange={(v) => {
                let dt = ((BigInt(v) * BigInt(max)) / BigInt(100)).toString();
                setAmountOne(dt);

                if ("fractionless" in meta.kind) {
                  setTextAmount(dt);
                } else
                  setTextAmount(
                    AccountIdentifier.placeDecimal(
                      dt,
                      meta.decimals,
                      meta.decimals
                    )
                  );
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
                25%
              </SliderMark>
              <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
                50%
              </SliderMark>
              <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
                75%
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg="teal.500"
                color="white"
                placement="top"
                isOpen={showTooltip}
                label={`${percentAmount.toFixed(0)}%`}
              >
                <SliderThumb />
              </Tooltip>
            </Slider>
            <HStack mt={8}>
              <Input
                ref={initialRef}
                key="v"
                value={textAmount}
                onChange={(e) => {
                  if ("fractionless" in meta.kind) {
                    setAmountOne(e.target.value);
                  } else {
                    let v = AccountIdentifier.removeDecimal(
                      e.target.value,
                      meta.decimals
                    );

                    if (v > BigInt(max)) v = BigInt(max);
                    setAmountOne(v.toString());
                  }

                  setTextAmount(e.target.value);
                }}
                type="number"
              />
              <Button
                onClick={() => {
                  setAmountOne(max);
                  if ("fractionless" in meta.kind) setTextAmount(max);
                  else
                    setTextAmount(
                      AccountIdentifier.placeDecimal(
                        max,
                        meta.decimals,
                        meta.decimals
                      )
                    );
                }}
              >
                Max
              </Button>
            </HStack>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            ml={3}
            onClick={() =>
              onResult({
                amount:
                  "fractionless" in meta.kind
                    ? amount_one // * 100000000
                    : amount_one,
              })
            }
          >
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const AddLiquidityModal = ({
  aid,
  token_one,
  token_two,
  rate,
  onClose,
  onResult,
}) => {
  const dispatch = useDispatch();

  const [digitalAmount, setDigitalAmount] = React.useState(0);
  const [textAmount, setTextAmount] = React.useState(0);

  const [amount_one, setAmountOne] = React.useState(false);
  const [amount_two, setAmountTwo] = React.useState(false);

  const meta_one = useFT(token_one.id);
  const meta_two = useFT(token_two.id);
  return (
    <Modal
      onClose={onClose}
      isOpen={true}
      isCentered
      size={"sm"}
      preserveScrollBarGap={true}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Add Liquidity</Text>
            <AccountIcon address={aid} />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <HStack>
              <FTAbstract id={token_one.id} />
              <Box>
                <Input
                  value={amount_one}
                  isDisabled={
                    (rate && "fractionless" in meta_two.kind) || false
                  }
                  onChange={(e) => {
                    setAmountOne(Number(e.target.value));
                    if (rate) setAmountTwo(Number(e.target.value) / rate);
                  }}
                  type="number"
                />
              </Box>
            </HStack>

            <HStack>
              <FTAbstract id={token_two.id} />
              <Box>
                <Input
                  value={amount_two}
                  isDisabled={
                    (rate && "fractionless" in meta_one.kind) || false
                  }
                  onChange={(e) => {
                    setAmountTwo(Number(e.target.value));
                    if (rate) setAmountOne(Number(e.target.value) * rate);
                  }}
                  type="number"
                />
              </Box>
            </HStack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            ml={3}
            onClick={() => {
              let one, two;

              if ("fractionless" in meta_one.kind) {
                one = BigInt(amount_one);
              } else {
                one = AccountIdentifier.removeDecimal(
                  amount_one,
                  meta_one.decimals
                );
              }
              if ("fractionless" in meta_two.kind) {
                two = BigInt(amount_two);
              } else {
                two = AccountIdentifier.removeDecimal(
                  amount_two,
                  meta_two.decimals
                );
              }

              onResult({
                amount_one: one.toString(),
                amount_two: two.toString(),
              });
            }}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const SwapModal = ({
  address,
  token_one_id,
  token_two_id,

  onClose,
  onResult,
}) => {
  const dispatch = useDispatch();

  const [tokens, setTokens] = useState({
    one: token_one_id,
    two: token_two_id,
  });
  const pools = useDexPools(address);

  let token_one = useInventoryToken(address, tokens.one);
  let token_two = useInventoryToken(address, tokens.two);

  //  const meta_one = useFT(token_one_id);
  //   const meta_two = useFT(token_two_id);

  let reverse = false;
  let pool = pools && pools[tokens.one + "-" + tokens.two];
  if (!pool) {
    if (pools && pools[tokens.two + "-" + tokens.one]) {
      let {
        id,
        total,
        token_one_decimals,
        token_two_decimals,
        balance,
        reserve_one,
        reserve_two,
      } = pools[tokens.two + "-" + tokens.one];
      pool = {
        id: [id[1], id[0]],
        total,
        token_one_decimals: token_two_decimals,
        token_two_decimals: token_one_decimals,
        balance,
        reserve_one: reserve_two,
        reserve_two: reserve_one,
      };
      reverse = true;
    }
  }

  if (!pool || !tokens.one || !tokens.two) return null;
  // let selected = await dispatch(
  //   dialog_open({
  //     name: "dex_swap",
  //     data: {
  //       info,
  //       aid: address,
  //       token_one: { id: token_one_id, bal: token_one?.bal || 0 },
  //       token_two: { id: token_two_id, bal: token_two?.bal || 0 },
  //     },
  //   })
  // );

  // console.log(selected);
  // let slippage = Math.ceil(selected.amount * 0.03);

  // dispatch(
  //   dex_swap(address, {
  //     token_one: token_one_id,
  //     token_two: token_two_id,
  //     amount: selected.amount + slippage,
  //     amount_required: selected.recieve,
  //     reverse: false,
  //   })
  // );

  return (
    <Modal
      onClose={onClose}
      isOpen={true}
      isCentered
      size={"sm"}
      preserveScrollBarGap={true}
    >
      <ModalOverlay />
      <ModalContent>
        <SwapModalInner
          key={token_one.id + "-" + token_two.id + "-" + (reverse ? "r" : "l")}
          address={address}
          onClose={onClose}
          onResult={onResult}
          token_one={token_one}
          token_two={token_two}
          setTokens={setTokens}
          {...pool}
          reverse={reverse}
        />
      </ModalContent>
    </Modal>
  );
};

export const SwapModalInner = ({
  address,
  setTokens,
  token_one,
  token_two,
  reserve_one,
  reserve_two,
  token_one_decimals,
  token_two_decimals,
  total,
  reverse,
  onClose,
  onResult,
}) => {
  const dispatch = useDispatch();
  const task_id = "swap" + token_one.id + "-" + token_two.id;
  const initialRef = React.useRef();

  const timeout = React.useRef();

  const [swapInfo, setSwapInfo] = React.useState({ give: 0, recieve: 0 });

  const debouncedCalc = (v, reverseSet = false) => {
    let one = { reserve: reserve_one, decimals: token_one_decimals };
    let two = { reserve: reserve_two, decimals: token_two_decimals };

    let swapInfo = reverseSet
      ? calcRateRev(v, {
          left: one,
          right: two,
          swap_fee: DEX_SWAP_FEE,
        })
      : calcRate(v, {
          left: one,
          right: two,
          swap_fee: DEX_SWAP_FEE,
        });

    setSwapInfo(swapInfo);
  };
  const makeSwap = async () => {
    let give = swapInfo.give_decimal;
    let recieve = swapInfo.recieve_decimal;
    if (token_one_decimals === 0 || token_two_decimals === 0) {
      if (token_one_decimals === 0) recieve -= recieve * 0.05; // slippage
      if (token_two_decimals === 0) {
        let added = give * 0.05;
        if (token_one.bal > give && token_one.bal < give + added)
          give = Number(token_one.bal) - 10000;
        else give += added; // slippage

        console.log({ give });
      }
    } else {
      recieve -= recieve * 0.05;
    }
    give = Math.round(give);
    recieve = Math.round(recieve);

    try {
      dispatch(task_start({ task_id }));

      let resp = await dispatch(
        dex_swap(address, {
          token_one: reverse ? token_two.id : token_one.id,
          token_two: reverse ? token_one.id : token_two.id,
          amount: give,
          amount_required: recieve,
          reverse,
        })
      );

      if (resp.err) throw resp.err;

      dispatch(task_end({ task_id }));

      if (resp.ok) onResult({ ok: true });
    } catch (e) {
      dispatch(
        task_end({
          task_id,
          result: { err: true, msg: err2text(e) },
        })
      );
    }
  };
  return (
    <>
      <ModalHeader>
        <HStack>
          <Text>Swap</Text>
        </HStack>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl>
          <HStack sx={{ position: "relative" }}>
            <Input
              name="vone"
              size="lg"
              h={"64px"}
              mr="-10px"
              bg={"gray.800"}
              ref={initialRef}
              value={swapInfo.give || 0}
              onChange={(e) => {
                let v = e.target.value;
                v = parseFloat(v).toString();

                setSwapInfo({ give: v, recieve: 0 });

                clearTimeout(timeout.current);
                timeout.current = setTimeout(
                  () => debouncedCalc(v, false),
                  2000
                );
              }}
              type="number"
            />

            <Box>
              <FTAbstract id={token_one.id} />
            </Box>
          </HStack>
          <Box
            textAlign="center"
            sx={{
              position: "absolute",
              top: "55px",
              left: "0px",
              right: "0px",
              zIndex: 100,
            }}
          >
            <IconButton
              size="sm"
              bg="gray.800"
              colorScheme={"gray"}
              variant="solid"
              _hover={{ background: "gray.600" }}
              border="2px"
              borderColor="gray.700"
              onClick={() => {
                setTokens({
                  one: token_two.id.toString(),
                  two: token_one.id.toString(),
                });
              }}
              icon={<ArrowDownIcon />}
            />
          </Box>
          <HStack>
            <Input
              name="vtwo"
              size="lg"
              h={"64px"}
              mr="-10px"
              bg={"gray.800"}
              value={swapInfo.recieve || 0}
              onChange={(e) => {
                let v = e.target.value;
                v = parseFloat(v).toString();

                setSwapInfo({ recieve: v, give: 0 });

                clearTimeout(timeout.current);
                timeout.current = setTimeout(
                  () => debouncedCalc(v, true),
                  2000
                );
              }}
              type="number"
            />

            <Box>
              <FTAbstract id={token_two.id} />
            </Box>
          </HStack>

          {swapInfo.price_change ? (
            <Box sx={{ color: 1 - swapInfo.price_change > 0.1 ? "red" : "" }}>
              price impact -{((1 - swapInfo.price_change) * 100).toFixed(1)}%
            </Box>
          ) : (
            <Box>&nbsp;</Box>
          )}
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Cancel</Button>
        <TaskButton
          ml={3}
          isDisabled={swapInfo.give === 0 || swapInfo.recieve === 0}
          task_id={task_id}
          onClick={makeSwap}

          //loadingText="Swap"
        >
          Swap
        </TaskButton>
      </ModalFooter>
    </>
  );
};
