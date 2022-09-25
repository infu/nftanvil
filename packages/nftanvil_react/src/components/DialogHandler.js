/* global BigInt */

import React, { useEffect, useRef, useState } from "react";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
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
} from "@chakra-ui/react";

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
import { ArrowForwardIcon } from "@chakra-ui/icons";

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
    else return null;
  });
};

export const AccountSelectModal = ({ title, onClose, onResult }) => {
  const accounts = useSelector((state) => state.user.accounts);
  const [customAccount, setCustomAccount] = React.useState("");

  return (
    <Modal onClose={onClose} isOpen={true} isCentered size={"sm"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title || "Select account"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Center>
            <Wrap spacing={4}>
              {Object.keys(accounts).map((address) => (
                <Box
                  sx={{ cursor: "pointer" }}
                  onClick={() => onResult(address)}
                  key={address}
                  border="1px"
                  borderRadius="5"
                  p={2}
                  borderColor="gray.500"
                >
                  <AccountIcon address={address} />
                  <Text fontSize="xs" textAlign="center">
                    {address.substring(0, 4) + "..." + address.slice(-4)}
                  </Text>
                </Box>
              ))}
            </Wrap>
          </Center>
          <Text mt={3} color="gray.500" textAlign="center">
            OR
          </Text>
          <HStack mt={4} mb={6}>
            <Input
              placeholder="a00f..."
              onChange={(e) => setCustomAccount(e.target.value)}
            />
            {customAccount !== "" ? (
              <Button onClick={() => onResult(customAccount)}>Ok</Button>
            ) : null}
          </HStack>
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
  const [digitalAmount, setDigitalAmount] = React.useState(0);
  const [textAmount, setTextAmount] = React.useState(0);

  const [showTooltip, setShowTooltip] = React.useState(false);

  const meta = useSelector((state) => state.ft[token.id]);

  const max = (BigInt(token.bal) - BigInt(meta.fee)).toString();

  const percentAmount = Number(
    (BigInt(100) * BigInt(digitalAmount)) / BigInt(max)
  );

  return (
    <Modal
      initialFocusRef={initialRef}
      onClose={onClose}
      isOpen={true}
      isCentered
      size={"sm"}
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
                setDigitalAmount(dt);

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
                  let v = AccountIdentifier.removeDecimal(
                    e.target.value,
                    meta.decimals
                  );

                  if (v > BigInt(max)) v = BigInt(max);
                  setDigitalAmount(v.toString());

                  setTextAmount(e.target.value);
                }}
                type="number"
              />
              <Button
                onClick={() => {
                  setDigitalAmount(max);
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
            {meta.fee !== "0" ? (
              <Text mt="2" fontSize="13px">
                {AccountIdentifier.placeDecimal(
                  meta.fee,
                  meta.decimals,
                  meta.decimals - meta.fee.length + 2
                )}{" "}
                fee
              </Text>
            ) : null}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            ml={3}
            onClick={() =>
              onResult({
                amount: digitalAmount,
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
