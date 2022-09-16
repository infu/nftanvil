import React from "react";
import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
  Button,
  Stack,
  Flex,
  ButtonGroup,
  Spacer,
  HStack,
  Text,
} from "@chakra-ui/react";

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
  useDisclosure,
} from "@chakra-ui/react";
import { saveDisclaimer } from "../reducers/user.js";

export function Disclaimer() {
  const disclaimer = useSelector((state) => state.user.disclaimer);
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onAgree = () => {
    dispatch(saveDisclaimer(true));
    onClose();
  };

  if (disclaimer !== false) return null;

  return (
    <Modal
      closeOnOverlayClick={false}
      size="xl"
      isOpen={disclaimer !== true}
      onClose={onAgree}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign={"center"} fontSize="22">
          NFTAnvil Disclaimer
        </ModalHeader>
        <ModalBody pr="10" pl="10" pb="4">
          <Text
            textAlign={"center"}
            fontSize="34px"
            lineHeight="34px"
            color="cyan.400"
            fontWeight="bold"
          >
            Acknowledgement of Terms & Conditions of access
          </Text>
          <Text textAlign={"center"} mt="5" fontWeight="bold">
            Use of the Anvil Protocol and NFTAnvil mint, marketplace, services,
            dapp or application is subject to the following terms and conditions
            and I hereby confirm that by proceeding and interacting with the
            protocol I am aware of these and accept them in full:
          </Text>

          <Text
            textAlign={"center"}
            color={"gray.400"}
            mt="5"
            fontWeight="bold"
          >
            NFTAnvil is a dapp and Anvil is a smart contract protocol, both in
            alpha state of launch, I understand the risks associated with using
            them and their associated functions.
          </Text>
          <Text
            textAlign={"center"}
            color={"gray.400"}
            mt="5"
            fontWeight="bold"
          >
            Any interactions that I have with the associated NFTAnvil & Anvil
            protocol apps, smart contracts or any related functions MAY place my
            funds at risk, and I hereby release NFTAnvil & the Anvil protocol
            and its contributors, team members, NFT sellers, NFT authors, and
            service providers from any and all liability associated with my use
            of the above-mentioned functions.
          </Text>
          <Text
            textAlign={"center"}
            color={"gray.400"}
            mt="5"
            fontWeight="bold"
          >
            I am lawfully permitted to access this site and use the NFTAnvil &
            Anvil protocol application functions, and I am not in contravention
            of any laws governing my jurisdiction of residence or citizenship.
          </Text>
          <Text textAlign="center" mt="5" mb="5">
            <Button
              colorScheme="blue"
              mr={3}
              onClick={onAgree}
              fontWeight="bold"
            >
              I understand the risks involved,
              <br /> proceed to the app
            </Button>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
