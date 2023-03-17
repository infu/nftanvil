import React, { useState, useRef, useEffect } from "react";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  dex_pools,
  ft_fetch_meta,
  ft_all_tokens,
} from "./index";

export const useDexPools = (address) => {
  const pools = useSelector((s) => s.dex[address]?.pools);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!address) return;
    dispatch(dex_pools(address));

    const interval = setInterval(() => {
      dispatch(dex_pools(address));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, address]);

  return pools;
};

export const useFT = (id) => {
  const ft = useSelector((state) => state.ft[id]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (id && id[0]) dispatch(ft_fetch_meta(id[0]));
  }, [dispatch, id]);

  return ft;
};

export const useInventoryToken = (address, tid) => {
  const inv = useSelector((state) => state.inventory[address]?.content);

  let token =
    inv &&
    inv[
      Object.keys(inv).find(
        (k) => inv[k].id === tid || inv[k].id === Number(tid)
      )
    ];
  if (!token) token = { id: tid, bal: 0 };
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(ft_fetch_meta(id[0]));
  // }, [dispatch, id]);

  return token;
};
