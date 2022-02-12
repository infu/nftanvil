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
  Heading,
} from "@chakra-ui/react";
import { Progress } from "@chakra-ui/react";

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

import { nft_stats, history_stats } from "../reducers/dashboard";

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
    <Box p="5" bg="gray.800" align="center" borderRadius="4">
      <Text fontSize="12px">{label}</Text>
      <Text fontSize="25px">{val}</Text>
      <Text fontSize="10px" color="gray.500">
        {metric}
      </Text>
    </Box>
  );
}

export const tc = (c) => (Number(c / 100000000000n) / 10).toFixed(2);

export function NftStats({ slot }) {
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  const load = async () => {
    setStats(await dispatch(nft_stats({ slot })));
  };

  useEffect(() => {
    load();
  }, [slot]);

  if (!stats) return null;

  console.log("STATS", stats);

  const mem_mb = Number(stats.rts_total_allocation / 1024n / 1024n);
  const max_mb = 1024; //1gb
  //- {stats.canister}
  return (
    <>
      <GridItem>{slot}</GridItem>
      <GridItem>{stats.minted}</GridItem>
      <GridItem>{stats.burned}</GridItem>
      <GridItem>{stats.transfers}</GridItem>
      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>
        {mem_mb}MB {(100 * (mem_mb / max_mb)).toFixed(0)}%
      </GridItem>
    </>
  );
}

export function HistoryStats({ slot }) {
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  const load = async () => {
    setStats(await dispatch(history_stats({ slot })));
  };

  useEffect(() => {
    load();
  }, [slot]);

  if (!stats) return null;

  const mem_mb = Number(stats.rts_total_allocation / 1024n / 1024n);
  const max_mb = 1024; //1gb
  return (
    <>
      <GridItem>{slot}</GridItem>
      <GridItem>{stats.transactions}</GridItem>
      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>
        {mem_mb}MB {(100 * (mem_mb / max_mb)).toFixed(0)}%
      </GridItem>
    </>
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
    focused ? 10000 : null
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

  let total_other = 4;

  let total_history = Number(info.map.history - info.map.history_range[0]) + 1;

  let nft_available = Number(info.map.nft[1] - info.map.nft[0]) + 1 - total_nft;
  let history_available =
    Number(info.map.history_range[1] - info.map.history_range[0]) +
    1 -
    total_history;

  return (
    <Center>
      <Stack mt="50px" spacing="3" maxW={"590px"}>
        <Box
          mt={8}
          w="100%"
          bg={"gray.900"}
          color={"gray.300"}
          p={5}
          fontSize="13px"
          borderRadius="4"
        >
          <Heading mb={3} size="md">
            Metrics
          </Heading>

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
              label="history"
              val={total_history}
              metric="canisters"
            />

            <MeterNumber
              label="nft available"
              val={nft_available}
              metric="canisters"
            />

            <MeterNumber
              label="history available"
              val={history_available}
              metric="canisters"
            />

            <Box> {}</Box>
          </Wrap>
        </Box>

        <Box
          w="100%"
          bg={"gray.900"}
          color={"gray.300"}
          p={5}
          fontSize="13px"
          borderRadius="4"
        >
          <Heading size="md">Nft</Heading>
          <Grid mt={3} templateColumns="repeat(7, 1fr)" gap={3}>
            <GridItem>Canister</GridItem>
            <GridItem>Minted</GridItem>
            <GridItem>Burned</GridItem>
            <GridItem>Transferred</GridItem>
            <GridItem>Balance</GridItem>
            <GridItem>Spent</GridItem>

            <GridItem>Memory</GridItem>

            {Array(total_nft)
              .fill(0)
              .map((_, idx) => {
                return (
                  <NftStats key={idx} slot={Number(info.map.nft[0]) + idx} />
                );
              })}
          </Grid>
        </Box>

        <Box
          w="100%"
          bg={"gray.900"}
          color={"gray.300"}
          p={5}
          fontSize="13px"
          borderRadius="4"
        >
          <Heading size="md">History</Heading>
          <Grid mt="3" templateColumns="repeat(5, 1fr)" gap={3}>
            <GridItem>Canister</GridItem>
            <GridItem>Transactions</GridItem>
            <GridItem>Balance</GridItem>
            <GridItem>Spent</GridItem>
            <GridItem>Memory</GridItem>

            {Array(total_history)
              .fill(0)
              .map((_, idx) => {
                return (
                  <HistoryStats
                    key={idx}
                    slot={Number(info.map.history_range[0]) + idx}
                  />
                );
              })}
          </Grid>
        </Box>

        {/* <CanisterInfo
            type="pwr"
            id={PrincipalFromSlot(info.map.space, info.map.pwr).toText()}
          />
          <CanisterInfo
            type="anv"
            id={PrincipalFromSlot(info.map.space, info.map.anv).toText()}
          />
          <CanisterInfo
            type="treasury"
            id={PrincipalFromSlot(info.map.space, info.map.treasury).toText()}
          /> */}

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
          w="100%"
          bg={"gray.900"}
          color={"gray.300"}
          p={5}
          fontSize="13px"
          borderRadius="4"
        >
          <Heading mb={3} size="md">
            Log
          </Heading>
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
