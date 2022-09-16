/* global BigInt */

import React, { useEffect, useState } from "react";
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
  Wrap,
  useDisclosure,
  FormLabel,
  FormControl,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { dialogResult } from "../reducers/dialog";

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
    else return null;
  });
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
  const [showTooltip, setShowTooltip] = React.useState(false);

  const max = token.bal;

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
        <ModalHeader>Send</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Center>
            <HStack>
              <AccountIcon address={from_aid} />
              <Box>&gt;</Box>
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
                setDigitalAmount(
                  ((BigInt(v) * BigInt(max)) / BigInt(100)).toString()
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
                value={Number(AccountIdentifier.e8sToIcp(digitalAmount)) || ""}
                onChange={(e) => {
                  let v = AccountIdentifier.icpToE8s(e.target.value);
                  if (v > BigInt(max)) v = BigInt(max);
                  console.log(">>>", AccountIdentifier.e8sToIcp(v.toString()));
                  setDigitalAmount(v.toString());
                }}
                type="number"
              />
              <Button onClick={() => setDigitalAmount(max)}>Max</Button>
            </HStack>
            <Text mt="2" fontSize="13px">
              0.01 transfer fee
            </Text>
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
