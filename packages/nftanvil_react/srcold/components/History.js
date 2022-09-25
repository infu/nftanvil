/* global BigInt */
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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { useTheme } from "@chakra-ui/react";
import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize, useInterval } from "react-use";
import moment from "moment";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";
import {
  loadInfo,
  loadHistory,
  tailHistory,
  loadNftHistory,
} from "../reducers/history";
import styled from "@emotion/styled";

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

import { NFTLarge } from "./NFT";

const SHOW = 10; // max records shown on screen
const TAIL_INTERVAL = 1000; // every 1 sec

export const HistoryRedirect = () => {
  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    setLoading(false);

    let { total, canister } = await dispatch(loadInfo());
    let from = total - SHOW;
    if (from <= 0) from = 0;
    let to = total;
    // dispatch(push(`/history/${canister}/${from}/${to}`));
  };

  useEffect(() => {
    load();
  }, [dispatch]);

  return (
    <Box mt={"15"}>
      <Spinner />
    </Box>
  );
};

const KeyVal = ({ k, v }) => {
  const dark = useColorModeValue(true, false);
  return (
    <Flex>
      <Key dark={dark}>{k}</Key>
      <Val>{v}</Val>
    </Flex>
  );
};

const Key = styled.div`
  text-transform: capitalize;
  color: ${(p) => (p.dark ? "gray.200" : "gray.900")};
  width: 130px;
  font-size: 12px;
  font-family: Verdana;
  text-transform: uppercase;
`;

const Val = styled.div`
  width: 100%;
  word-break: break-all;
  a {
    color: rgb(133, 200, 255);
  }

  font-size: 12px;
  font-weight: normal;
`;

const HistoryEvent = ({ ev, canister, idx, showThumb = true }) => {
  const boxColor = useColorModeValue("white", "gray.700");
  const space = useSelector((state) => state.user.map.space);

  if (!ev?.info) return null;
  let etype = Object.keys(ev.info)[0];
  let action = Object.keys(ev.info[etype])[0];
  let details = ev.info[etype][action];

  let transactionId = TransactionId.toText(
    TransactionId.encode(
      PrincipalToSlot(space, Principal.fromText(canister)),
      idx
    )
  );
  let timestamp = Number(BigInt(details.created) / 1000000n);
  //TODO: This is will be done in a better way

  const inner = (
    <Box bg={boxColor} borderRadius={"4"} border={1} p={3} mb={2}>
      <KeyVal k={"TX"} v={<TX>{transactionId}</TX>} />
      <KeyVal k={"Timestamp"} v={moment(timestamp).format("LLLL")} />

      <KeyVal k={"Type"} v={<b>{etype + "-" + action}</b>} />

      {Object.keys(details).map((key, idx) => {
        if (key === "created") return null;

        let val = details[key];
        if (val.length === 32) {
          val = AccountIdentifier.ArrayToText(val);
          val = <ACC short={true}>{val}</ACC>;
        }

        if (key === "token" || key === "socket" || key === "plug") {
          val = tokenToText(val); //tokenFromBlob(val);
          val = <NFTA>{val}</NFTA>;
        }

        if (key === "use") {
          val = JSON.stringify(val);
        }

        if (key === "memo") {
          val = toHexString(val);
        }

        if (key === "marketplace" || key === "affiliate" || key === "author") {
          if (!val || val.length === 0) return null;
          if (Array.isArray(val)) val = val[0];
          if (!val) return null;

          return (
            <div key={key}>
              <KeyVal
                key={idx + "addr"}
                k={key}
                v={
                  <HStack>
                    <ACC short={true}>
                      {AccountIdentifier.ArrayToText(val.address)}
                    </ACC>
                    <div>{val.share / 100 + "%"}</div>
                  </HStack>
                }
              />
            </div>
          );
        }

        if (key === "spender") {
          val = Principal.fromUint8Array(val._arr).toText();
        }

        if (key === "amount") {
          if (val.e8s) val = <ICP>{val.e8s}</ICP>;
          else val = <ICP>{val}</ICP>;
        }

        if (key === "pwr") {
          val = <ICP>{val}</ICP>;
        }

        if (key === "price") {
          val = (
            <HStack>
              <div>
                <ICP>{val.amount}</ICP>
              </div>
              {val.marketplace[0] ? (
                <div>
                  marketplace share{" "}
                  {(val.marketplace[0].share / 100).toFixed(2)}% -
                  <ACC short={true}>
                    {AccountIdentifier.ArrayToText(val.marketplace[0].address)}
                  </ACC>
                </div>
              ) : null}
            </HStack>
          );
        }

        return <KeyVal key={idx} k={key} v={val} />;
      })}
      <KeyVal k={"Hash"} v={<HASH>{toHexString(ev.hash)}</HASH>} />
    </Box>
  );

  if (!showThumb) return inner;

  return (
    <Stack direction="horizontal" spacing="0">
      {"token" in details ? (
        <Box w="250px" mb="7px" mr="7px">
          <NFTLarge id={tokenToText(details.token)} />
        </Box>
      ) : null}
      {inner}
    </Stack>
  );
};

export const History = (p) => {
  const total = useSelector((state) => state.history.total);
  const events = useSelector((state) => state.history.events);
  const focused = useSelector((state) => state.user.focused);

  const canister = p.match.params.canister;
  let from = parseInt(p.match.params.from, 10);
  if (from <= 0) from = 0;

  const to = parseInt(p.match.params.to, 10);
  const [isLoading, setLoading] = useState(true);

  const [isTailing, setTailing] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    dispatch(loadHistory({ canister, from, to }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [dispatch, from, to, canister]);

  useInterval(
    async () => {
      let { total, canister } = await dispatch(loadInfo());
      if (to !== total) {
        // dispatch(push(`/history/${canister}/${total - SHOW}/${total}`));
      }
    },
    focused && isTailing ? TAIL_INTERVAL : null
  );

  if (!events || !events.length) return null;

  let evlist = [];
  for (let idx = events.length; idx >= 0; idx--) {
    evlist.push(
      <HistoryEvent
        key={idx}
        idx={idx + from}
        canister={canister}
        ev={events[idx] ? events[idx][0] : null}
        showThumb={false}
      />
    );
  }

  return (
    <Box mt={8} maxW={"590px"} w="100%">
      {/* <Box p={3}>
        <div>History canister: {canister} </div>
        <div>From {from} </div>
        <div>To {to} </div>
        <div>Total {total} </div>
      </Box> */}
      <Flex>
        <ButtonGroup mb="2" variant="outline" size="sm" spacing="3">
          <Button disabled={from <= 0} variant="solid">
            Prev
          </Button>

          <Button disabled={total <= to} variant="solid">
            Next
          </Button>
        </ButtonGroup>
        <Spacer />
        <Button
          size="sm"
          variant={isTailing ? "solid" : "outline"}
          colorScheme={isTailing ? "teal" : ""}
          onClick={() => setTailing(!isTailing)}
        >
          Tail
        </Button>
      </Flex>
      {evlist}
    </Box>
  );
};

export const HistoryTx = (p) => {
  const total = useSelector((state) => state.history.total);
  const events = useSelector((state) => state.history.events);
  const space = useSelector((state) => state.user.map.space);

  const tx = p.match.params.tx;

  const { slot, idx: from } = TransactionId.decode(TransactionId.fromText(tx));
  let canister = PrincipalFromSlot(space, slot).toText();
  //console.log({ canister, slot, from, space });
  // const from = parseInt(tx.substr(tx.lastIndexOf("-") + 1), 10);

  const to = from + 1;

  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    dispatch(loadHistory({ canister, from, to }));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [dispatch, from, to, canister]);

  if (!events || !events.length) return null;

  return (
    <Box mt={8}>
      <ButtonGroup mb="2" variant="outline" size="sm" spacing="3">
        <Button variant="solid">Back to history</Button>
      </ButtonGroup>
      {events.map((ev, idx) => (
        <HistoryEvent
          key={idx}
          idx={idx + from}
          canister={canister}
          ev={ev[0]}
        />
      ))}
    </Box>
  );
};

export const NftHistory = ({ transactions, showThumb }) => {
  const [events, setEvents] = useState([]);

  const dispatch = useDispatch();

  const load = async () => {
    let evs = await dispatch(loadNftHistory({ transactions }));
    setEvents(evs);
  };

  useEffect(() => {
    load();
  }, [dispatch, transactions]);

  if (!events || !events.length) return null;

  return (
    <Center>
      <Box mt={8} maxW={"590px"} w="100%">
        {events.map(({ idx, canister, data }, n) => (
          <HistoryEvent
            key={n}
            idx={idx}
            canister={canister}
            ev={data}
            showThumb={showThumb}
          />
        ))}
      </Box>
    </Center>
  );
};
