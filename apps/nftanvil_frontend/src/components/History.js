/* global BigInt */
import React from "react";
import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";
import moment from "moment";
import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { loadInfo, loadHistory } from "../reducers/history";
import styled from "@emotion/styled";
import { push } from "connected-react-router";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

export const HistoryRedirect = () => {
  const [isLoading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const load = async () => {
    setLoading(false);

    let { total, canister } = await dispatch(loadInfo());
    let from = total - 30;
    if (from <= 0) from = 0;
    let to = total;
    dispatch(push(`/history/${canister}/${from}/${to}`));
  };

  useEffect(() => {
    load();
  }, [dispatch]);

  return <div>Loading...</div>;
};
const KeyVal = ({ k, v }) => {
  return (
    <Flex>
      <Key>{k.capitalize()}</Key>
      <Val>{v}</Val>
    </Flex>
  );
};

const Key = styled.div`
  text-transform: capitalize;
  color: rgb(170, 174, 179);
  width: 130px;
`;

const Val = styled.div`
  a {
    color: rgb(133, 133, 255);
  }
`;

const HistoryEvent = ({ ev, canister, idx }) => {
  let etype = Object.keys(ev.info)[0];
  let action = Object.keys(ev.info[etype])[0];
  let details = ev.info[etype][action];
  let transactionId = canister + "-" + idx;
  let timestamp = Number(BigInt(ev.created) / 1000000n);

  const boxColor = useColorModeValue("white", "gray.600");

  return (
    <Box bg={boxColor} borderRadius={"4"} border={1} p={3} mb={2}>
      <KeyVal
        k={"Transaction ID"}
        v={<Link to={"/tx/" + transactionId}>{transactionId}</Link>}
      />
      <KeyVal k={"Timestamp"} v={moment(timestamp).format("LLLL")} />

      <KeyVal k={"Type"} v={<b>{etype + "-" + action}</b>} />

      {Object.keys(details).map((key, idx) => {
        let val = details[key];
        if (val.length === 32) {
          val = AccountIdentifier.ArrayToText(val);
          val = <Link to={"/address/0/" + val}>{val}</Link>;
        }

        if (key === "token" || key === "socket" || key === "plug")
          val = <Link to={"/nft/" + val}>{val}</Link>;

        return <KeyVal key={idx} k={key} v={val} />;
      })}
    </Box>
  );
};

export const History = (p) => {
  const total = useSelector((state) => state.history.total);
  const events = useSelector((state) => state.history.events);

  const canister = p.match.params.canister;
  const from = parseInt(p.match.params.from, 10);
  const to = parseInt(p.match.params.to, 10);

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
      {/* <Box p={3}>
        <div>History canister: {canister} </div>
        <div>From {from} </div>
        <div>To {to} </div>
        <div>Total {total} </div>
      </Box> */}
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

export const HistoryTx = (p) => {
  const total = useSelector((state) => state.history.total);
  const events = useSelector((state) => state.history.events);

  const tx = p.match.params.tx;

  const canister = tx.substr(0, tx.lastIndexOf("-"));
  const from = parseInt(tx.substr(tx.lastIndexOf("-") + 1), 10);
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
      {/* <Box p={3}>
          <div>History canister: {canister} </div>
          <div>From {from} </div>
          <div>To {to} </div>
          <div>Total {total} </div>
        </Box> */}
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
