/* global BigInt */
import React from "react";
import {
  Box,
  Spinner,
  Button,
  Flex,
  ButtonGroup,
  Spacer,
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useInterval } from "react-use";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  history_load_info,
  history_load,
  HistoryEvent,
} from "@vvv-interactive/nftanvil-react";

import { PrincipalFromSlot } from "@vvv-interactive/nftanvil-tools/cjs/principal.js";

import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";

import { useNavigate, useParams, Link } from "react-router-dom";

const SHOW = 10; // max records shown on screen
const TAIL_INTERVAL = 1000; // every 1 sec

export const HistoryRedirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = async () => {
    let { total, canister } = await dispatch(history_load_info());
    let from = total - SHOW;
    if (from <= 0) from = 0;
    let to = total;
    navigate(`/history/${canister}/${from}/${to}`);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Center>
      <Box mt={"15"}>
        <Spinner />
      </Box>
    </Center>
  );
};

export const History = () => {
  const total = useSelector((state) => state.history.total);
  const events = useSelector((state) => state.history.events);
  const focused = useSelector((state) => state.user.focused);
  const navigate = useNavigate();

  let { canister, from, to } = useParams();

  from = parseInt(from, 10);
  if (from <= 0) from = 0;

  to = parseInt(to, 10);

  const [isTailing, setTailing] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    dispatch(history_load({ canister, from, to }));
  };

  useEffect(() => {
    load();
  }, [dispatch, from, to, canister]);

  useInterval(
    async () => {
      let { total, canister } = await dispatch(history_load_info());
      if (to !== total) {
        navigate(`/history/${canister}/${total - SHOW}/${total}`);
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
        showThumb={true}
        onClickTx={(tx) => navigate("/" + tx)}
        onClickAcc={(acc) => {
          console.log(acc);
          navigate("/" + acc);
        }}
        onClickNft={(id) => {
          console.log(id);
          navigate("/" + id);
        }}
      />
    );
  }

  return (
    <Center>
      <Box mt={8} maxW={"590px"} w="100%">
        <Flex>
          <ButtonGroup mb="2" variant="outline" size="sm" spacing="3">
            <Link
              to={`/history/${canister}/${from - SHOW}/${from}`}
              onClick={() => setTailing(false)}
            >
              <Button disabled={from <= 0} variant="solid">
                Prev
              </Button>
            </Link>
            <Link
              to={`/history/${canister}/${from + SHOW}/${from + SHOW * 2}`}
              onClick={() => setTailing(false)}
            >
              <Button disabled={total <= to} variant="solid">
                Next
              </Button>
            </Link>
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
    </Center>
  );
};

export const HistoryTx = () => {
  const { tx } = useParams();
  const total = useSelector((state) => state.history.total);
  const events = useSelector((state) => state.history.events);
  const space = useSelector((state) => state.ic.anvil.space);
  const navigate = useNavigate();
  const { slot, idx: from } = TransactionId.decode(TransactionId.fromText(tx));
  let canister = PrincipalFromSlot(space, slot).toText();

  const to = from + 1;

  const dispatch = useDispatch();

  const load = async () => {
    dispatch(history_load({ canister, from, to }));
  };

  useEffect(() => {
    load();
  }, [dispatch, from, to, canister]);

  if (!events || !events.length) return null;

  return (
    <Center>
      <Box mt={8} maxW={"590px"} w="100%">
        <ButtonGroup mb="2" variant="outline" size="sm" spacing="3">
          <Link to={`/history`}>
            <Button variant="solid">Back to history</Button>
          </Link>
        </ButtonGroup>
        {events.map((ev, idx) => (
          <HistoryEvent
            onClickTx={(tx) => navigate("/" + tx)}
            onClickAcc={(acc) => navigate("/" + acc)}
            onClickNft={(id) => {
              console.log(id);
              navigate("/" + id);
            }}
            key={idx}
            idx={idx + from}
            canister={canister}
            ev={ev[0]}
          />
        ))}
      </Box>
    </Center>
  );
};
