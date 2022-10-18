import React from "react";
import anvillogo from "../assets/anvillogo.svg";

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
import { useSelector, useDispatch } from "react-redux";

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

export function Waiting() {
  return (
    <Modal closeOnOverlayClick={false} size="xl" isOpen={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody pr="10" pl="10" pb="7">
          <Box textAlign="center" mt="6">
            <img
              src={anvillogo}
              width="30px"
              style={{ display: "inline", marginLeft: "10px" }}
            />

            <br />
            <Text mt="7px" ml="10px" sx={{ fontFamily: "Greycliff" }}>
              NFT<b>ANVIL</b>
            </Text>
          </Box>

          <Text
            textAlign={"center"}
            fontSize="34px"
            lineHeight="34px"
            color="cyan.400"
            fontWeight="bold"
            mt="5"
          >
            Launching 15th of March
          </Text>
          <Text textAlign={"center"} mt="5" fontWeight="bold">
            The testnet dapp has been stopped to avoid confusion
          </Text>
          <Text textAlign={"center"} mt="5" fontWeight="bold">
            NFTAnvil is launching in production 15th of March. This means all
            NFTs will be permanent and other dapps can start minting,
            airdropping & selling NFTs. <br />
            <br />
            Nftanvil.com is the only decentralized non-custodial NFT marketplace
            on the Internet Computer. Curation will be done by the community. It
            is powered by the Anvil NFT protocol, which is the only
            decentralized permissionless protocol powering NFT dapps and
            marketplaces on IC. That level of decentralization + scalability was
            never attempted before on the IC or any other blockchain, so brace
            yourselves, there will be rough patches along the way.
          </Text>

          <Text
            textAlign={"center"}
            color={"gray.400"}
            mt="5"
            fontWeight="bold"
          >
            Meanwhile, you are welcome to join
            <br />{" "}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://discord.gg/apPegYBhBC"
              style={{ color: "#77f" }}
            >
              <img
                alt=""
                style={{ display: "inline", width: "20px", height: "20px" }}
                src="data:image/png;base64,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"
              />{" "}
              discord{" "}
            </a>{" "}
            &amp;
            <a
              rel="noreferrer"
              target="_blank"
              href="https://twitter.com/nftanvil"
              style={{ color: "#37f" }}
            >
              <img
                alt=""
                style={{ display: "inline", width: "20px", height: "20px" }}
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAE20lEQVRoge3YW2yTdRgG8Odta8GBzh3KoIOd7BzxiGICISCi3GDigQQmEYMYgk4JckEGKGAaTTSiaAwCTsF5gSEuiiEGvSIalwWIohciCE4YbMDKtnbrTh3t9z5ebMWNfB/raRsXfe6+Nf+3v6f/r/2WP5BOOumkk04SkbF408LdVx5UkRVULiRlGkAniYtUHlEba3xr8g5BhGZrsz6+VBBY574QvbYsULa/290XyvA3vCihVMFLqvyZYeVuQJeREBIACBJg/wVIgsRREa5qfm3Kyeja7O3NswXGJqr86690rx+2wN1fdX1BSuYpZ0Y5ysVIFj9tR4ubDjks4PR+sCV+4FraCW4leS+IRSQLSPjtevWelg3FzTcs4PmB45z+nlaAEwF8OSl/wuqfF0gkUXxR9bnxRui2WoAPx4aH2WsRIZa0VeYfHDzbZvaG4/w99w/gQXJlc2P3gZlVzEi0QKR34tok8d0gl9t49VjWtguvZL3X9DpIsSxAgXvwYIBPdo0P1pXtDZbFrffSIYINSeABsJHA9jAclwFZB/btin7JTQuIoZ3/L44Okhm083hpdXsFvDRdZ5Z8V+s8ErlJ4EFiOsmpAJoiEXkqsOnOjuh8U0jYbjQMxV8bNIHEbk9Bx6/F1f55sRQQG+9LEj/wd/7uIGd1vjH1zOD5pgXO/JPZAEiD+SCA5ENiyC/FewK1hZ8FFqOGdqsCpM2VPB5nx4nzkdaNBZeun29+K3hFCe658ScHgJwr4IHCQNvloqq2qsJPrzxRsKs9a/AoobYmiQfJdl/l5G4zquVzwLOv7XZbxPEHiRJTvEUxgCRxhorTAjYaQB7IJYnjAYJ1wY0Fc82cDqsC9c/nBD3VHctBHgaQESMe7H/ClkFYpkR0QeL4/teCVk7TW6i0uuO5u6qDNYDhAvACSV+M+GR+Kq3wAHntf5/rY7EDbFFyKWBbGscnPzJ4EArWWxUw3QGbho8CCN8MeBIQ4nhcBU6vcnWS+t3NgCcZ7go7j8VVAADE4Fsk+sYYDwhq4XX3xF2g/qWcvwCuH1M8ACq+tTLesAAAnFudvZPK9QAiY4In+2yRyDcJFwCA8xU5H0Iwn2TdKOMBYH+X13MlqQKFVS1TDDXuEOhGAl4q/KOBJ6E2MbYP57N8Ekdjh71HaXytlIkkABkVPATY17XZc2I437A7cPbl7A6lvDNat80APkgxtgxni6kAAFzMzdkG8NBo4AFAicreLZ7GlBVAuRiRHn1Wge9HGg/yYGhr0ecxuWIuAMBXObm7eY3raSVXkWgYCTzJU71qrLA61DJLYidzNbS7mi7PgU3mULkMwIwU4M9D5dGQt7ghHkrMOzAk5WKEpe9PKksBPJAavP2xePFAAjvg/uBSbtiBCirWApiUAvwRux2LuzeX+OK1xFwg7yNfCYQLCH2clGdI3joUkhBeobqjl7ZN8BYnfP46tAApU3e2LIoAFSBzQbpITCajp3Sp+cIScgLUV0NvltQmCjcvMJD8T5pyIoZjM4DVKcVD6qn6dkiL98ErmizeskA0ee83T1Anl0CxkuR8AJIAPqDKHwnZG9pS+FM8P5FJFxiczHfPZ9lucc4W6iwRzlQin2Q2BDlUjCfZSSIA0KeUk4D+rWBtr6fot1Qcz6eTTjrppDMi+Q8fgF/hmeYFBwAAAABJRU5ErkJggg=="
              />{" "}
              twitter
            </a>
            .
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
