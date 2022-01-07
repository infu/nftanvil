import React from "react";
import {
  Box,
  Spinner,
  Wrap,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { NFT } from "./NFT";
import itemgrid from "../assets/itemgrid.png";
import itemgrid_light from "../assets/itemgrid_light.png";
import { useWindowSize } from "react-use";

import { useSelector, useDispatch } from "react-redux";
import { loadInfo, loadHistory } from "../reducers/history";
import styled from "@emotion/styled";
import { push } from "connected-react-router";

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

const NftMint = ({ created, info }) => {
  return <div>nft mint {info.token}</div>;
};

const HistoryEvent = ({ ev }) => {
  if (ev?.info?.nft?.mint)
    return <NftMint created={ev.created} info={ev.info.nft.mint} />;

  return <div>unknown event</div>;
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

  return (
    <div>
      <div>History canister: {canister} </div>
      <div>From {from} </div>
      <div>To {to} </div>
      <div>Total {total} </div>
      <div>
        {events.map((ev) => (
          <HistoryEvent ev={ev[0]} />
        ))}
      </div>
    </div>
  );
};
