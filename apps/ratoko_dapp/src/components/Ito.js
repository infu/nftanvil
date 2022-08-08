import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  useAnvilSelector,
  useAnvilDispatch,
  user_refresh_balances,
} from "@vvv-interactive/nftanvil-react";
import { NftThumb } from "./Nft";

import {
  buy,
  claim,
  get_mine,
  airdrop_use,
  stats,
  provide_tx,
  msg,
} from "../actions/purchase";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import Confetti from "./Confetti.js";
import { ButtonModal } from "./Tools.js";
import nfts from "../nfts.json";
import ratoko_logo from "../assets/ratoko_logo.png";
import mframe from "../assets/mframe.png";
import { Wheel } from "./Wheel.js";
const UNAVAILABLE = false;
const SOLDOUT = false;

function Basket({ ids, onClose }) {
  let nftcut = nfts
    ? nfts.filter((x) => {
        return ids.indexOf(x[0]) !== -1;
      })
    : nfts;

  return (
    <div className="basket">
      <div className="inner">
        <img src={ratoko_logo} className="basket-logo" alt="Ratoko" />

        <Confetti />
        <div className="title">Squeak!</div>
        <div className="subtitle">
          You just minted {ids.length} {ids.length > 1 ? "Ratokos" : "Ratoko"}
        </div>
        <div className="actions">
          <button className="old" onClick={() => onClose()}>
            OK
          </button>
        </div>
        <div className="collection">
          {nftcut.map((nft, idx) => {
            return <NftThumb nft={nft} key={nft[0]} />;
          })}
        </div>
        <div className="actions">
          <button className="old" onClick={() => onClose()}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function BuyButton({ price, className, refreshMine, onBuy }) {
  const [confirm, setConfirm] = React.useState(false);
  const dispatch = useAnvilDispatch();

  return (
    <div className="old buybutton">
      <button
        className={"old " + className}
        onClick={async () => {
          if (!confirm) setConfirm(true);
          else {
            setConfirm(false);
            await onBuy(price);
          }
        }}
      >
        {confirm ? "Yes" : "Mint"}
      </button>
      {confirm ? (
        <button
          className="old"
          onClick={() => {
            setConfirm(false);
          }}
        >
          No
        </button>
      ) : null}
    </div>
  );
}

export function PriceOptions({ refreshMine }) {
  const dispatch = useAnvilDispatch();
  const [working, setWorking] = React.useState(false);
  // let testBasket = [1639540, 1310721, 1703939, 1508509, 1639537];
  const [basket, setBasket] = React.useState(false);
  const codeInput = useRef(null);
  const logged = useAnvilSelector((state) => state.user.address);

  const price_1 = 200000000;
  const price_2 = 1600000000;
  const price_3 = 360000000;

  const showPrice = (x) => {
    let p = (Math.round(AccountIdentifier.e8sToIcp(x) * 100) / 100)
      .toString()
      .split(/[\.\,]/);

    return (
      <span>
        {p[0]}
        <b>.{p[1]} ICP</b>
      </span>
    );
  };

  const onBuy = async (price) => {
    setWorking(true);
    let basket = false;
    try {
      basket = await dispatch(buy(price));
    } catch (e) {
      dispatch(msg(e.message));
      setWorking(false);
      return;
    }

    setBasket(basket);
    setWorking(false);

    dispatch(user_refresh_balances());
    await dispatch(claim());
    refreshMine();
  };

  const onAirdrop = async (code) => {
    setWorking(true);
    let basket = false;
    try {
      basket = await dispatch(airdrop_use(code));
    } catch (e) {
      dispatch(msg(e.message));
      setWorking(false);
      return;
    }

    setBasket(basket);
    setWorking(false);

    dispatch(user_refresh_balances());
    await dispatch(claim());
    refreshMine();
  };

  return (
    <div className={"pricewrapper " + (!logged ? "requiresLogin" : "")}>
      {/* <img src={mframe} className="mframe" alt="Mframe" /> */}

      {/* {SOLDOUT ? <div className="soldout">Sold out!</div> : null}
      <div className="priceOptions">
        <div
          className={
            "priceBox " +
            (working ? "working" : "") +
            (UNAVAILABLE ? " unavailable " : "")
          }
        >
          <div className="title">Single</div>
          <div className="price">{showPrice(price_1)}</div>
          <div className="ftrs">
            <div className="feature">1 NFT</div>
          </div>
          <BuyButton
            onBuy={onBuy}
            className="attention"
            price={price_1}
            refreshMine={refreshMine}
          />
        </div>

        <div
          className={
            "priceBox attention " +
            (working ? "working" : "") +
            (UNAVAILABLE ? " unavailable " : "")
          }
        >
          {working ? <Wheel /> : null}
          <div className="title">Royal Court</div>
          <div className="price">{showPrice(price_2)}</div>
          <div className="ftrs">
            <div className="feature">10 NFTs</div>
            <div className="feature">20% discount</div>
          </div>

          <BuyButton
            onBuy={onBuy}
            className="attention"
            price={price_2}
            refreshMine={refreshMine}
          />
        </div>

        <div
          className={
            "priceBox " +
            (working ? "working" : "") +
            (UNAVAILABLE ? " unavailable " : "")
          }
        >
          <div className="title">Couple</div>
          <div className="price">{showPrice(price_3)}</div>
          <div className="ftrs">
            <div className="feature">2 NFTs</div>
            <div className="feature">10% discount</div>
          </div>
          <BuyButton
            onBuy={onBuy}
            className="attention"
            price={price_3}
            refreshMine={refreshMine}
          />
        </div>
      </div> */}

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
                <button className="old" onClick={() => setVisibility(false)}>
                  Cancel
                </button>
                <button
                  className="old attention"
                  onClick={() => {
                    setVisibility(false);
                    onAirdrop(codeInput.current.value.trim());
                    codeInput.current.value = "";
                  }}
                >
                  Use
                </button>
              </div>
            </div>
          )}
        </ButtonModal>
      </div>

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

export function CenterSpinner() {
  return (
    <div className="spin-center">
      <Spinner />
    </div>
  );
}
export function Spinner() {
  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
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
    load();
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
