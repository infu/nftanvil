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
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import { Progress } from "@chakra-ui/react";
import { BigIntToString } from "@vvv-interactive/nftanvil-tools/cjs/data.js";

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

import {
  nft_stats,
  history_stats,
  pwr_stats,
  account_stats,
  router_stats,
} from "../reducers/dashboard";

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
      {metric === "icp" ? (
        <Text>
          <ICP>{val}</ICP>
        </Text>
      ) : (
        <>
          <Text fontSize="25px">{val}</Text>
          <Text fontSize="10px" color="gray.500">
            {metric}
          </Text>
        </>
      )}
    </Box>
  );
}

export const tc = (c) => (Number(c / 100000000000n) / 10).toFixed(2);

export function AccountStats({ slot }) {
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  const load = async () => {
    setStats(await dispatch(account_stats({ slot })));
  };

  useEffect(() => {
    load();
  }, [slot]);

  if (!stats) return null;

  //const mem_mb = Number(stats.rts_total_allocation / 1024n / 1024n);
  const heap_mb = Number(stats.rts_heap_size / 1024n / 1024n);
  const mem_mb = Number(stats.rts_memory_size / 1024n / 1024n);

  return (
    <>
      <GridItem>
        <SLOT>{slot}</SLOT>
      </GridItem>
      <GridItem>{Number(stats.total_accounts)}</GridItem>

      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>{heap_mb}MB</GridItem>
      <GridItem>{mem_mb}MB</GridItem>
    </>
  );
}

export function PwrStats() {
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  const load = async () => {
    setStats(await dispatch(pwr_stats()));
  };

  useEffect(() => {
    load();
  }, []);

  if (!stats) return null;

  //const mem_mb = Number(stats.rts_total_allocation / 1024n / 1024n);
  const heap_mb = Number(stats.rts_heap_size / 1024n / 1024n);
  const mem_mb = Number(stats.rts_memory_size / 1024n / 1024n);

  return (
    <>
      <GridItem>{Number(stats.total_accounts)}</GridItem>

      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>{heap_mb}MB</GridItem>
      <GridItem>{mem_mb}MB</GridItem>
    </>
  );
}

export function RouterStats() {
  const dispatch = useDispatch();

  const [stats, setStats] = useState(null);

  const load = async () => {
    setStats(await dispatch(router_stats()));
  };

  useEffect(() => {
    load();
  }, []);

  if (!stats) return null;
  //const mem_mb = Number(stats.rts_total_allocation / 1024n / 1024n);
  const heap_mb = Number(stats.rts_heap_size / 1024n / 1024n);
  const mem_mb = Number(stats.rts_memory_size / 1024n / 1024n);

  return (
    <>
      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>{heap_mb}MB</GridItem>
      <GridItem>{mem_mb}MB</GridItem>
    </>
  );
}

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

  //const mem_mb = Number(stats.rts_total_allocation / 1024n / 1024n);
  const heap_mb = Number(stats.rts_heap_size / 1024n / 1024n);
  const mem_mb = Number(stats.rts_memory_size / 1024n / 1024n);

  //- {stats.canister}
  return (
    <>
      <GridItem>
        <SLOT>{slot}</SLOT>
      </GridItem>
      <GridItem>{stats.minted}</GridItem>
      <GridItem>{stats.burned}</GridItem>
      <GridItem>{stats.transfers}</GridItem>
      <GridItem>{stats.icall_errors.toString()}</GridItem>

      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>{heap_mb}MB</GridItem>
      <GridItem>{mem_mb}MB</GridItem>
    </>
  );
}

export function SLOT({ children }) {
  const map = useSelector((state) => state.user.map);
  let p = PrincipalFromSlot(map.space, children).toText();

  const { onCopy } = useClipboard(p);

  return (
    <Tooltip placement="top-start" label={p}>
      <div onClick={() => onCopy()}>{children}</div>
    </Tooltip>
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

  const heap_mb = Number(stats.rts_heap_size / 1024n / 1024n);
  const mem_mb = Number(stats.rts_memory_size / 1024n / 1024n);

  return (
    <>
      <GridItem>
        <SLOT>{slot}</SLOT>
      </GridItem>
      <GridItem>{stats.transactions}</GridItem>
      <GridItem>{tc(stats.cycles)} TC</GridItem>
      <GridItem>{tc(stats.cycles_recieved - stats.cycles)} TC</GridItem>

      <GridItem>{heap_mb}MB</GridItem>
      <GridItem>{mem_mb}MB</GridItem>
    </>
  );
}

export function Orchestration() {
  const [info, setInfo] = useState(null);

  const dispatch = useDispatch();

  const load = async () => {
    setInfo(BigIntToString(await dispatch(router_stats())));
  };

  useEffect(() => {
    load();
  }, [dispatch]);
  if (!info) return null;

  return (
    <Center>
      <Box
        w="100%"
        bg={"gray.900"}
        color={"gray.300"}
        p={5}
        fontSize="13px"
        borderRadius="4"
      >
        <Heading mb={3} size="md">
          Orchestration
        </Heading>

        <Wrap>
          <MeterNumber
            label="refuel"
            val={(Number(BigInt(info.refuel) / 10000000000n) / 100).toFixed(2)}
            metric="trillion cycles"
          />
          <MeterNumber
            label="jobs succeeded"
            val={info.jobs_success}
            metric="jobs"
          />
          <MeterNumber label="jobs failed" val={info.jobs_fail} metric="jobs" />
        </Wrap>
      </Box>
    </Center>
  );
}

export function Financial() {
  const [info, setInfo] = useState(null);

  const dispatch = useDispatch();

  const load = async () => {
    setInfo(BigIntToString(await dispatch(pwr_stats())));
  };

  useEffect(() => {
    load();
  }, [dispatch]);
  if (!info) return null;

  return (
    <Center>
      <Box
        w="100%"
        bg={"gray.900"}
        color={"gray.300"}
        p={5}
        fontSize="13px"
        borderRadius="4"
      >
        <Heading mb={3} size="md">
          Financial
        </Heading>

        <Wrap>
          <MeterNumber
            label="recharges accumulated"
            val={info.recharge_accumulated}
            metric="icp"
          />
          <MeterNumber
            label="mint accumulated"
            val={info.mint_accumulated}
            metric="icp"
          />
          <MeterNumber
            label="purchases accumulated"
            val={info.purchases_accumulated}
            metric="icp"
          />
          <MeterNumber
            label="fees charged"
            val={info.fees_charged}
            metric="icp"
          />
          <MeterNumber
            label="deposited"
            val={info.icp_deposited}
            metric="icp"
          />
          <MeterNumber
            label="withdrawn"
            val={info.icp_withdrawn}
            metric="icp"
          />
          <MeterNumber
            label="distributed seller"
            val={info.distributed_seller}
            metric="icp"
          />
          <MeterNumber
            label="distributed affiliate"
            val={info.distributed_affiliate}
            metric="icp"
          />
          <MeterNumber
            label="distributed marketplace"
            val={info.distributed_marketplace}
            metric="icp"
          />
          <MeterNumber
            label="distributed author"
            val={info.distributed_author}
            metric="icp"
          />
          <MeterNumber
            label="distributed anvil"
            val={info.distributed_anvil}
            metric="icp"
          />
        </Wrap>
      </Box>
    </Center>
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
  console.log("CINFO", info);
  //info.map.space[0] = [BigInt(5000), BigInt(10000)];
  let total_range = Number(info.map.space[0][1] - info.map.space[0][0]) + 1;
  let total_nft =
    Number(info.map.nft_avail[info.map.nft_avail.length - 1]) -
    Number(info.map.nft[0]) +
    1;
  let total_account = Number(info.map.account[1] - info.map.account[0]) + 1;

  let total_other = 2;

  let total_history = Number(info.map.history - info.map.history_range[0]) + 1;

  let nft_available = Number(info.map.nft[1] - info.map.nft[0]) + 1 - total_nft;
  let history_available =
    Number(info.map.history_range[1] - info.map.history_range[0]) +
    1 -
    total_history;

  return (
    <Center>
      <Wrap mt={"80px"} justify="center">
        <Stack mt="50px" spacing="3" maxW={"590px"} w="100%">
          <Financial />
          <Orchestration />
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
              Cluster
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
        </Stack>
        <Stack mt="50px" spacing="3" maxW={"590px"} w="100%">
          <Box
            w="100%"
            bg={"gray.900"}
            color={"gray.300"}
            p={5}
            fontSize="13px"
            borderRadius="4"
          >
            <Heading size="md">Nft</Heading>
            <Grid mt={3} templateColumns="repeat(9, 1fr)" gap={3}>
              <GridItem>Canister</GridItem>
              <GridItem>Minted</GridItem>
              <GridItem>Burned</GridItem>
              <GridItem>Transferred</GridItem>
              <GridItem>ICE</GridItem>
              <GridItem>Balance</GridItem>
              <GridItem>Spent</GridItem>
              <GridItem>Heap</GridItem>
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
            <Heading size="md">Account</Heading>
            <Grid mt={3} templateColumns="repeat(6, 1fr)" gap={3}>
              <GridItem>Canister</GridItem>
              <GridItem>Accounts</GridItem>

              <GridItem>Balance</GridItem>
              <GridItem>Spent</GridItem>
              <GridItem>Heap</GridItem>
              <GridItem>Memory</GridItem>

              {Array(total_account)
                .fill(0)
                .map((_, idx) => {
                  return (
                    <AccountStats
                      key={idx}
                      slot={Number(info.map.account[0]) + idx}
                    />
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
            <Heading size="md">Pwr</Heading>
            <Grid mt={3} templateColumns="repeat(5, 1fr)" gap={3}>
              <GridItem>Accounts</GridItem>
              <GridItem>Balance</GridItem>
              <GridItem>Spent</GridItem>
              <GridItem>Heap</GridItem>
              <GridItem>Memory</GridItem>

              <PwrStats />
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
            <Heading size="md">Router</Heading>
            <Grid mt={3} templateColumns="repeat(4, 1fr)" gap={3}>
              <GridItem>Balance</GridItem>
              <GridItem>Spent</GridItem>
              <GridItem>Heap</GridItem>
              <GridItem>Memory</GridItem>

              <RouterStats />
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
            <Grid mt="3" templateColumns="repeat(6, 1fr)" gap={3}>
              <GridItem>Canister</GridItem>
              <GridItem>Transactions</GridItem>
              <GridItem>Balance</GridItem>
              <GridItem>Spent</GridItem>
              <GridItem>Heap</GridItem>
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
      </Wrap>
    </Center>
  );
}
