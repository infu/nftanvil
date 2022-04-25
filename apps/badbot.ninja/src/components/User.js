import React, { useEffect, useState, useRef } from "react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import {
  TestAnvilComponent,
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
  user_transfer_icp,
} from "@vvv-interactive/nftanvil-react";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { ButtonModal } from "./Tools.js";
import { msg } from "../actions/purchase.js";
import { toast } from "react-toastify";

export function User() {
  const dispatch = useAnvilDispatch();
  const addressInput = useRef(null);
  const amountInput = useRef(null);
  const [working, setWorking] = useState(false);

  const address = useAnvilSelector((state) => state.user.address);
  const e8s = useAnvilSelector((state) => state.user.icp);
  const icp = AccountIdentifier.e8sToIcp(e8s);

  const sendIcp = async () => {
    let to = addressInput.current.value;
    let amount = Math.floor(amountInput.current.value * 100000000) - 10000;
    setWorking(true);
    try {
      await dispatch(user_transfer_icp({ to, amount }));
      dispatch(msg("Transfer complete"));
    } catch (e) {
      dispatch(msg(e.message, toast.TYPE.ERROR));
    }
    setWorking(false);

    amountInput.current.value = "";
    console.log({ to, amount });
  };

  return (
    <div className="user">
      {address ? (
        <>
          <div className="address">
            <div className="title">your address</div>
            <div className="val">{address}</div>
          </div>{" "}
          <div className="icp">
            {icp} ICP <span className="e8s">({e8s} e8s)</span>
          </div>
        </>
      ) : null}
      <div className="actions">
        {address ? (
          <div>
            <button
              onClick={() => {
                dispatch(user_logout());
              }}
            >
              Logout
            </button>
            <ButtonModal name="Transfer">
              {({ setVisibility }) => (
                <div
                  className={"modal-transfer-icp " + (working ? "working" : "")}
                >
                  <div className="modal-title">Transfer ICP</div>
                  {working ? (
                    <div style={{ textAlign: "center" }}>Transferring...</div>
                  ) : null}

                  <div>
                    <label htmlFor="address">To Address</label>
                    <input ref={addressInput} type="text" id="address"></input>
                  </div>
                  <div>
                    <label htmlFor="amount">Amount</label>
                    <input ref={amountInput} type="number" id="amount"></input>
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => setVisibility(false)}>Cancel</button>
                    <button className="attention" onClick={() => sendIcp()}>
                      Send
                    </button>
                  </div>
                  <div className="smalltxt">
                    ICP transfer fee 0.0001{" "}
                    <span className="e8s">(10000 e8s)</span>
                  </div>
                </div>
              )}
            </ButtonModal>
          </div>
        ) : (
          <button
            className="attention"
            onClick={() => {
              dispatch(user_login());
            }}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
