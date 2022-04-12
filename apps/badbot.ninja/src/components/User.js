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
export function User() {
  const dispatch = useAnvilDispatch();
  const addressInput = useRef(null);
  const amountInput = useRef(null);
  const address = useAnvilSelector((state) => state.user.address);
  const icp = AccountIdentifier.e8sToIcp(
    useAnvilSelector((state) => state.user.icp)
  );

  const sendIcp = () => {
    let to = addressInput.current.value;
    let amount = Math.floor(amountInput.current.value * 100000000) - 10000;
    dispatch(user_transfer_icp({ to, amount }));
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
          <div className="icp">{icp} ICP</div>
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
                <div className="modal-transfer-icp">
                  <div className="modal-title">Transfer ICP</div>
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
