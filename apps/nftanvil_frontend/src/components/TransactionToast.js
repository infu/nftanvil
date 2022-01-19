import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { useDispatch } from "react-redux";
import { push } from "connected-react-router";

export const TransactionToast = (props) => {
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => {
        if (props.tokenId) dispatch(push("/nft/" + props.tokenId));
        if (props.transactionId)
          dispatch(push("/tx/" + TransactionId.toText(props.transactionId)));
      }}
    >
      <div>{props.title}</div>
      {props.tokenId ? (
        <div style={{ fontSize: "10px" }}>TokenId: {props.tokenId}</div>
      ) : null}
      {props.transactionId ? (
        <div style={{ fontSize: "10px", color: "green" }}>
          TransactionId: {TransactionId.toText(props.transactionId)}
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
