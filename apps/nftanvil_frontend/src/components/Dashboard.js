/* global BigInt */
import React from "react";
import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
  Button,
  Flex,
  ButtonGroup,
  Spacer,
  Text,
  Stack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { useWindowSize, useInterval } from "react-use";

import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import moment from "moment";
import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import {
  loadInfo,
  loadHistory,
  tailHistory,
  loadNftHistory,
} from "../reducers/history";
import styled from "@emotion/styled";
import { push } from "connected-react-router";

import {
  toHexString,
  bytesToBase58,
} from "@vvv-interactive/nftanvil-tools/cjs/data.js";
import {
  tokenFromBlob,
  tokenToText,
  decodeTokenId,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import {
  PrincipalFromSlot,
  PrincipalToIdx,
  PrincipalToSlot,
} from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import { TX, ACC, NFTA, HASH, PWR, ICP } from "./Code";

import { cluster_info } from "../reducers/history.js";
import { map } from "lodash";

function MeterNumber({ label, val, metric }) {
  return (
    <Box p="5" bg="gray.900" align="center" borderRadius="4">
      <Text fontSize="12px">{label}</Text>
      <Text fontSize="25px">{val}</Text>
      <Text fontSize="10px" color="gray.500">
        {metric}
      </Text>
    </Box>
  );
}

export function DashboardPage() {
  const [info, setInfo] = useState(null);

  const dispatch = useDispatch();

  const focused = useSelector((state) => state.user.focused);

  const load = async () => {
    let rez = await dispatch(cluster_info());
    rez.log.reverse();
    setInfo(rez);
  };

  useInterval(
    async () => {
      await load();
    },
    focused ? 2000 : null
  );

  useEffect(() => {
    load();
  }, [dispatch]);

  if (!info) return null;

  //info.map.space[0] = [BigInt(5000), BigInt(10000)];
  let total_range = Number(info.map.space[0][1] - info.map.space[0][0]) + 1;
  let total_nft =
    Number(
      info.map.nft_avail[info.map.nft_avail.length - 1] - info.map.nft[0]
    ) + 1;
  let total_account = Number(info.map.account[1] - info.map.account[0]) + 1;

  let total_other = 5;

  let total_available = total_range - total_nft - total_account - total_other;

  return (
    <Center>
      <Stack mt="50px">
        <Box>
          <Wrap>
            <MeterNumber label="total" val={total_range} metric="canisters" />
            <MeterNumber
              label="account"
              val={total_account}
              metric="canisters"
            />
            <MeterNumber label="nft" val={total_nft} metric="canisters" />
            <MeterNumber label="other" val={total_other} metric="canisters" />
            <MeterNumber
              label="available"
              val={total_available}
              metric="canisters"
            />

            <Box> {}</Box>
          </Wrap>
        </Box>
        {/* <Grid templateColumns="repeat(75, 1fr)" gap={"1px"}>
          {Array(Number(info.map.space[0][1] - info.map.space[0][0]))
            .fill(0)
            .map((_, idx) => {
              let c = info.map.space[0][0] + BigInt(idx);
              return (
                <GridItem key={idx} w="100%" h="2" bg="blue.500"></GridItem>
              );
            })}
        </Grid> */}
        <Box
          mt={8}
          maxW={"590px"}
          w="100%"
          bg={"gray.900"}
          color={"gray.300"}
          p={5}
          fontSize="13px"
          borderRadius="4"
        >
          {info.log.map((x, idx) => {
            return (
              <Stack key={idx} direction="row" spacing="3" mb="2">
                <Box w="160px" color="gray.500">
                  {moment(x.time * 1000).format("MM.DD.YY, HH:mm:ss")}
                </Box>
                <Box w="100%">{x.msg}</Box>
              </Stack>
            );
          })}
        </Box>
      </Stack>
    </Center>
  );
}
