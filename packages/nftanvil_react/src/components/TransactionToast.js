import React, { useEffect, useState } from "react";

import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";
import { TX, ACC, NFTA, HASH } from "./Code";

export const TransactionToast = (props) => {
  const dispatch = useDispatch();

  return (
    <div>
      <div>{props.title}</div>
      {props.tokenId ? (
        <div style={{ fontSize: "10px" }}>
          <NFTA>{props.tokenId}</NFTA>
        </div>
      ) : null}
      {props.transactionId ? (
        <div style={{ fontSize: "10px" }}>
          <TX>{TransactionId.toText(props.transactionId)}</TX>
        </div>
      ) : null}
    </div>
  );
};

export const TransactionFailed = ({ title, message }) => {
  return (
    <div>
      <div>{title}</div>
      <div style={{ fontSize: "10px" }}>{message}</div>
    </div>
  );
};
