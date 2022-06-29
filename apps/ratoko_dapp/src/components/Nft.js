import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import {
  useAnvilDispatch,
  useAnvilSelector,
  nft_fetch,
  nft_transfer,
  nft_set_price,
  nft_purchase,
} from "@vvv-interactive/nftanvil-react";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import {
  MARKETPLACE_AID,
  MARKETPLACE_SHARE,
  ANVIL_SHARE,
  AUTHOR_SHARE,
} from "../config.js";

import { ButtonModal } from "./Tools.js";
import { msg } from "../actions/purchase.js";
import { toast } from "react-toastify";
import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";

export function NftSingle({ id }) {
  const meta = useAnvilSelector((state) => state.nft[id]);

  const dispatch = useAnvilDispatch();

  useEffect(() => {
    dispatch(nft_fetch(id));
  }, [id, dispatch]);
  if (!meta) return null;

  let nft = [
    tokenFromText(id),
    meta.quality,
    meta.name,
    meta.lore,
    meta.attributes,
    meta.tags,
  ];

  return (
    <div>
      <NftThumb nft={nft} meta={meta} />
    </div>
  );
}

function NftTransfer({ id }) {
  const [working, setWorking] = useState(false);
  const addressInput = useRef(null);
  const dispatch = useAnvilDispatch();

  const sendNft = async () => {
    let toAddress = addressInput.current.value;

    console.log("id", id, "toAddress", toAddress);

    setWorking(true);
    try {
      await dispatch(nft_transfer({ id, toAddress }));
      dispatch(msg("Transfer complete"));
    } catch (e) {
      dispatch(msg(e.message, toast.TYPE.ERROR));
    }
    setWorking(false);

    addressInput.current.value = "";
  };

  return (
    <ButtonModal name="Transfer">
      {({ setVisibility }) => (
        <div className={"modal-nftbox " + (working ? "working" : "")}>
          <div className="modal-title">Transfer NFT</div>
          {working ? (
            <div style={{ textAlign: "center" }}>Transferring...</div>
          ) : null}

          <div>
            <label htmlFor="address">To Address</label>
            <input ref={addressInput} type="text" id="address"></input>
          </div>
          <div className="modal-actions">
            <button className="old" onClick={() => setVisibility(false)}>
              Cancel
            </button>
            <button
              className="old attention"
              onClick={() => sendNft().then(() => setVisibility(false))}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </ButtonModal>
  );
}

function NftSell({ id, myprice }) {
  const [working, setWorking] = useState(false);
  const amountInput = useRef(null);
  const dispatch = useAnvilDispatch();

  const sellNft = async () => {
    setWorking(true);

    let priceval = parseFloat(amountInput.current.value);

    let amount = AccountIdentifier.icpToE8s(
      priceval / (1 - (MARKETPLACE_SHARE + ANVIL_SHARE + AUTHOR_SHARE) / 10000)
    );

    let price = {
      amount,
      marketplace: [
        // {
        //   address: AccountIdentifier.TextToArray(MARKETPLACE_AID),
        //   share: MARKETPLACE_SHARE,
        // },
      ],
    };

    try {
      await dispatch(nft_set_price({ id, price }));
      dispatch(msg("Price set"));
    } catch (e) {
      dispatch(msg(e.message, toast.TYPE.ERROR));
    }

    setWorking(false);
  };

  const removeSaleNft = async () => {
    setWorking(true);

    let amount = 0;

    let price = {
      amount,
      marketplace: [
        // {
        //   address: AccountIdentifier.TextToArray(MARKETPLACE_AID),
        //   share: MARKETPLACE_SHARE,
        // },
      ],
    };

    try {
      await dispatch(nft_set_price({ id, price }));
      dispatch(msg("Price removed"));
    } catch (e) {
      dispatch(msg(e.message, toast.TYPE.ERROR));
    }

    setWorking(false);
  };

  return (
    <ButtonModal
      name={
        !myprice
          ? "Sell"
          : "Selling for " + AccountIdentifier.e8sToIcp(myprice) + " ICP"
      }
    >
      {({ setVisibility }) => (
        <div className={"modal-nftbox " + (working ? "working" : "")}>
          <div className="modal-title">Sell NFT</div>
          {working ? (
            <div style={{ textAlign: "center" }}>Setting price...</div>
          ) : null}

          <div>
            <label htmlFor="amount">Amount (ICP)</label>
            <input ref={amountInput} type="number" id="amount"></input>
          </div>
          <div className="modal-actions">
            <button
              className="old"
              onClick={() => removeSaleNft().then(() => setVisibility(false))}
            >
              Don't sell
            </button>
            <button className="old" onClick={() => setVisibility(false)}>
              Cancel
            </button>
            <button
              className="old attention"
              onClick={() => sellNft().then(() => setVisibility(false))}
            >
              Set
            </button>
          </div>
          <br />
          <div className="sellfee">+0.5% protocol fee</div>
          <div className="sellfee">+1.0% author royalty</div>
        </div>
      )}
    </ButtonModal>
  );
}

function NftBuy({ className, refreshMine, id, price }) {
  const [working, setWorking] = useState(false);

  const [confirm, setConfirm] = React.useState(false);
  const dispatch = useAnvilDispatch();

  const onBuy = async () => {
    let amount = price;
    setWorking(true);

    try {
      await dispatch(nft_purchase({ id, amount }));
      dispatch(msg("Purchase complete"));
    } catch (e) {
      dispatch(msg(e.message, toast.TYPE.ERROR));
    }
    setWorking(false);
  };

  if (!price) return null;
  return (
    <>
      {working ? (
        <div className="buyproc">Buying...</div>
      ) : (
        <>
          {confirm ? (
            <div style={{ width: "100%", position: "absolute", top: "-23px" }}>
              confirm
            </div>
          ) : null}
          <button
            className={confirm ? "old confirmbuy" : "old buybut"}
            onClick={async () => {
              if (!confirm) setConfirm(true);
              else {
                setConfirm(false);
                await onBuy();
              }
            }}
          >
            {confirm
              ? "Yes Buy"
              : "Buy for " + AccountIdentifier.e8sToIcp(price) + " ICP"}
          </button>
          {confirm ? (
            <button
              className={confirm ? "old confirmbuy" : "old"}
              onClick={() => {
                setConfirm(false);
              }}
            >
              No
            </button>
          ) : null}
        </>
      )}
    </>
  );
}

function FullView({ url, onClose }) {
  return (
    <div className="fullbg" onClick={onClose}>
      <img src={url} />
    </div>
  );
}

export function NftThumb({ nft, owner = false, mine }) {
  let [id, quality, name, lore, attributes, tags, price] = nft;
  const idt = tokenToText(id);
  const [full, setFull] = useState(false);

  const meta = useAnvilSelector((state) => state.nft[idt]);

  // attributes = [
  //   ["attack", 30],
  //   ["defence", 100],
  //   ["harvest", 40],
  //   ["airdrops", 40],
  // ]; //qweqwe

  const dispatch = useAnvilDispatch();
  const map = useAnvilSelector((state) => state.user.map);

  useEffect(() => {
    dispatch(nft_fetch(idt));
  }, [idt, dispatch]);

  // console.log("meta", meta);
  const empty = <div className="nft-sm"></div>;

  if (!meta) return empty;

  if (!map.history) return empty;
  let url = meta?.thumb?.external;

  let qa = itemQuality.dark[quality];

  const is_mine = mine ? mine.indexOf(id) !== -1 : false;

  return (
    <div className="nft-sm">
      {full
        ? ReactDOM.createPortal(
            <FullView
              onClose={() => {
                setFull(false);
              }}
              url={url}
            />,
            document.body
          )
        : null}
      <div className="nft-img" onClick={() => setFull(true)}>
        <img src={url} alt="nft" />
        <div className="nft-info">
          <div className="nft-quality">{qa.label}</div>
          {/* {is_mine ? (
            <div className="actions">
              <NftTransfer id={idt}></NftTransfer>
              <NftSell id={idt} myprice={price}></NftSell>
            </div>
          ) : (
            <div className="actions">
              <NftBuy id={idt} price={price} />
            </div>
          )} */}
        </div>
      </div>
      {/* <div className="nft-info">
        <div className="nft-name" style={{ color: qa.color }}>
          {name}
        </div>
        <div className="nft-quality">{qa.label}</div>
        <div className="nft-lore">{lore}</div>
        {is_mine ? (
          <div className="actions">
            <NftTransfer id={idt}></NftTransfer>
            <NftSell id={idt} myprice={price}></NftSell>
          </div>
        ) : (
          <div className="actions">
            <NftBuy id={idt} price={price} />
          </div>
        )}
      </div> */}
      {/* {!attributes.length ? null : (
        <div className="nft-attr-box">
          {attributes.map((attr, idx) => (
            <div className="nft-attr" key={idx}>
              <span className="label">{attr[0]}</span>{" "}
              <span className="val">+{attr[1]}</span>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
