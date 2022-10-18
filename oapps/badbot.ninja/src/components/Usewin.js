import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  useAnvilSelector,
  useAnvilDispatch,
  user_refresh_balances,
  nft_transfer,
} from "@vvv-interactive/nftanvil-react";
import { NftSingle } from "./Nft";

import { buy, claim, get_mine, stats, usewin, msg } from "../actions/usewin";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import Confetti from "./Confetti.js";
import { ButtonModal } from "./Tools.js";
import nfts from "../nfts.json";
import { Button, Center, Box, Text } from "@chakra-ui/react";
import {
  encodeTokenId,
  decodeTokenId,
  tokenUrl,
  ipfsTokenUrl,
  tokenToText,
  tokenFromText,
} from "@vvv-interactive/nftanvil-tools/cjs/token.js";

function Basket({ ids, onClose }) {
  return (
    <div className="basket">
      <div className="inner">
        <Confetti />
        <div className="title">Congratulations!</div>
        <div className="subtitle">You win</div>
        {ids.length > 3 ? (
          <div className="actions">
            <button className="old" onClick={() => onClose()}>
              OK
            </button>
          </div>
        ) : null}
        <div className="collection">
          {ids.map((id, idx) => {
            return <NftSingle id={tokenToText(id)} key={idx} />;
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
      {confirm ? (
        <div style={{ width: "100%", position: "absolute", top: "-23px" }}>
          confirm
        </div>
      ) : null}
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
        {confirm ? "Yes" : "Buy Now"}
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

export function UseWinGame({ refreshMine, nfts }) {
  const dispatch = useAnvilDispatch();
  const [working, setWorking] = React.useState(false);
  const [basket, setBasket] = React.useState(false); // tokenFromText("nftaad6cgztcvnra0tkp"),
  const logged = useAnvilSelector((state) => state.user.address);
  const [log, setLog] = React.useState([]); // tokenFromText("nftaad6cgztcvnra0tkp"),

  const onUse = async (price) => {
    setWorking(true);

    let allmine = await dispatch(get_mine());
    let mine = nfts
      .filter(([id]) => {
        return allmine.indexOf(id) !== -1;
      })
      .map((x) => x[0]);

    // FOR TESTING PURPOSES
    // let notmine = allmine.filter((id) => {
    //   return mine.indexOf(id) == -1;
    // });

    // for (let n of notmine) {
    //   await dispatch(
    //     nft_transfer({
    //       id: tokenToText(n),
    //       toAddress:
    //         "c680df5bf386a6244478823794c2027d914bb61a8a372decf8ea7e156c2cb4b1",
    //     })
    //   );
    // }

    let basket = false;
    let tmplog = [];
    const logme = (a) => {
      tmplog.push(a);
      setLog(tmplog);
    };
    logme("You have " + mine.length + " fighters");
    for (let id of mine) {
      let data = nfts.find((x) => x[0] === id);
      let name = data[2];
      try {
        logme("'" + name + "' attacks the mighty boss...");
        basket = await dispatch(usewin({ id: tokenToText(id) }));
        if (!basket || !basket.length) logme("'" + name + "' fails");
        else logme("'" + name + "' wins!");
      } catch (e) {
        console.log(e);
        if (e.message === "cooldown") {
          logme("'" + name + "' is cooling down and can't fight");
        } else {
          dispatch(msg(JSON.stringify(e.message)));
        }
      }

      if (basket.length) {
        setBasket(basket);
        await dispatch(claim());
      }
    }
    setWorking(false);

    dispatch(user_refresh_balances());
    await dispatch(claim());
    refreshMine();
  };

  return (
    <div className={!logged ? "requiresLogin" : ""}>
      <Box mt={3}>
        <Box>
          <Text
            align="center"
            mt="10"
            mb="5"
            maxWidth="400px"
            ml="auto"
            mr="auto"
          >
            This is just a little silly game for you to play with while we are
            developing the real thing. A{" "}
            <a
              href="https://github.com/infu/nftanvil/blob/main/apps/badbot.ninja/mo/usewin.mo"
              target="_blank"
              style={{ color: "cyan", textDecoration: "underline" }}
            >
              smart contract
            </a>{" "}
            is loaded with{" "}
            <a
              href="https://nftanvil.com/c680df5bf386a6244478823794c2027d914bb61a8a372decf8ea7e156c2cb4b1"
              target="_blank"
              style={{ color: "cyan", textDecoration: "underline" }}
            >
              NFT loot
            </a>
            . You can fight for a piece of it with your Bad Bot Ninja army once
            every 7 days.
          </Text>
        </Box>
        <Center>
          <Button
            onClick={onUse}
            isLoading={working}
            loadingText="Fighting"
            colorScheme={"red"}
            size="lg"
          >
            Boss fight
          </Button>
        </Center>
      </Box>

      <Center>
        <Box mw={"500px"} mt="3" mb="3">
          {log.map((x, idx) => (
            <Text key={idx}>{x}</Text>
          ))}
        </Box>
      </Center>
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
