import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { useDispatch } from "react-redux";
import { push } from "connected-react-router";
import { TX, ACC, TID, HASH } from "./Code";

export const TransactionToast = (props) => {
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => {
        if (props.tokenId) dispatch(push(props.tokenId));
        else if (props.transactionId)
          dispatch(push("/" + TransactionId.toText(props.transactionId)));
      }}
    >
      <div>{props.title}</div>
      {props.tokenId ? (
        <div style={{ fontSize: "10px" }}>
          <TID>{props.tokenId}</TID>
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
