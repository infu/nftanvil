import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useAnvilDispatch } from "@vvv-interactive/nftanvil-react";
import { NftThumb } from "./Nft";

import { buy, claim, get_mine, airdrop_use, stats } from "../actions/purchase";
import { ButtonModal } from "./Tools.js";
import nfts from "../nfts.json";

function Basket({ ids, onClose }) {
  let nftcut = nfts
    ? nfts.filter((x) => {
        return ids.indexOf(x[0]) !== -1;
      })
    : nfts;

  return (
    <div className="basket">
      <div className="inner">
        <div className="title">Congratulations!</div>
        <div className="subtitle">You just got {ids.length} NFTs</div>
        <div className="actions">
          <button onClick={() => onClose()}>OK</button>
        </div>
        <div className="collection">
          {nftcut.map((nft, idx) => {
            return <NftThumb nft={nft} key={nft[0]} />;
          })}
        </div>
        <div className="actions">
          <button onClick={() => onClose()}>OK</button>
        </div>
      </div>
    </div>
  );
}

function BuyButton({ price, className }) {
  const [confirm, setConfirm] = React.useState(false);
  const dispatch = useAnvilDispatch();
  const [working, setWorking] = React.useState(false);
  const [basket, setBasket] = React.useState(false);

  if (working) return <div className="buybutton">Purchasing...</div>;
  return (
    <div className="buybutton">
      {confirm ? (
        <div style={{ width: "100%", position: "absolute", top: "-23px" }}>
          confirm
        </div>
      ) : null}
      <button
        className={className}
        onClick={async () => {
          if (!confirm) setConfirm(true);
          else {
            setWorking(true);

            let basket = await dispatch(buy(price));

            setBasket(basket);
            setWorking(false);
            setConfirm(false);
          }
        }}
      >
        {confirm ? "Yes" : "Buy Now"}
      </button>
      {confirm ? (
        <button
          onClick={() => {
            setConfirm(false);
          }}
        >
          No
        </button>
      ) : null}
      {basket
        ? ReactDOM.createPortal(
            <Basket
              ids={basket}
              onClose={() => {
                setBasket(false);
              }}
            />,
            document.body
          )
        : null}
    </div>
  );
}

export function PriceOptions() {
  const dispatch = useAnvilDispatch();
  const codeInput = useRef(null);

  return (
    <div>
      <div className="priceOptions">
        <div className="priceBox">
          <div className="title">Shot</div>
          <div className="price">
            0<b>,27 ICP</b>
          </div>
          <div className="ftrs">
            <div className="feature">1 NFT</div>
          </div>
          <BuyButton className="attention" price={60000} />
        </div>

        <div className="priceBox attention">
          <div className="title">BFF</div>
          <div className="price">
            3<b>,37 ICP</b>
          </div>
          <div className="ftrs">
            <div className="feature">20 NFTs</div>
            <div className="feature">20% discount</div>
          </div>

          <BuyButton className="attention" price={80000} />
        </div>

        <div className="priceBox">
          <div className="title">Splash</div>
          <div className="price">
            1<b>,17 ICP</b>
          </div>
          <div className="ftrs">
            <div className="feature">5 NFTs</div>
            <div className="feature">10% discount</div>
          </div>
          <BuyButton className="attention" price={70000} />
        </div>
      </div>
      <div className="airdropOptions">
        <ButtonModal name="Use airdrop code">
          {({ setVisibility }) => (
            <div className="modal-airdrop-code">
              <div className="modal-title">Use airdrop code</div>
              <div>
                <label htmlFor="code">Code</label>
                <input ref={codeInput} type="text" id="code"></input>
              </div>

              <div className="modal-actions">
                <button onClick={() => setVisibility(false)}>Cancel</button>
                <button
                  className="attention"
                  onClick={() => {
                    dispatch(airdrop_use(codeInput.current.value));
                  }}
                >
                  Use
                </button>
              </div>
            </div>
          )}
        </ButtonModal>
      </div>
    </div>
  );
}

export function ProgressBar() {
  const [st, setStats] = React.useState(false);
  const [count, setCount] = useState(0);

  const dispatch = useAnvilDispatch();
  const load = async () => {
    setStats(await dispatch(stats()));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      load();
      setCount(count + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [count, dispatch]);

  if (!st) return null;

  let available = Math.min(Number(st.available), Number(st.purchase));
  let total = Number(st.total);

  let airdrop = Number(st.airdrop);
  // let purchase = Number(st.purchase);
  const perc = ((total - available) / total) * 100;
  //console.log(perc);
  return (
    <>
      <div className="pbar-shell">
        <div className="pbar-inner" style={{ width: perc + "%" }}></div>
      </div>
      <div className="pbar-info">
        {total} total | {available} left
      </div>
    </>
  );
}
