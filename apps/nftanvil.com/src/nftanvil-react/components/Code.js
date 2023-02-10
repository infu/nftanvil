/* global BigInt */
import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  ft_fetch_meta,
  useFT,
} from "../index.js";

import { Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";
const Stx = styled.span`
  font-family: Verdana;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(117, 130, 149);
  b {
    color: rgb(110, 200, 170);
  }
  cursor: pointer;
`;

export const TX = ({ children, onClick = () => {} }) => {
  return (
    <Stx onClick={onClick}>
      <b>TX</b>
      {children.slice(2)}
    </Stx>
  );
};

const Sacc = styled.span`
  font-family: Verdana;
  font-size: 80%;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${(props) =>
    props.mode === "light" ? "rgb(230, 240, 240)" : "rgb(90, 100, 100)"};
  b {
    color: rgb(170, 255, 0);
  }
  cursor: pointer;
`;

const hexColors = {
  light: {
    0: "#49fc32",
    1: "#a7ef15",
    2: "#e8dc16",
    3: "#ffbb33",
    4: "#ff906c",
    5: "#ff87b3",
    6: "#ff92ff",
    7: "#ffa9ff",
    8: "#c8c8ff",
    9: "#00e4ff",
    A: "#00f3ff",
    B: "#29f7db",
    C: "#c9e1bb",
    D: "#ffc8d1",
    E: "#e8cfff",
    F: "#cdd9fd",
  },
  dark: {
    0: "#219812",
    1: "#6f9f0d",
    2: "#8c8509",
    3: "#946507",
    4: "#902705",
    5: "#840835",
    6: "#8e088e",
    7: "#950b95",
    8: "#09098b",
    9: "#097b88",
    A: "#07757a",
    B: "#067969",
    C: "#38850b",
    D: "#a41d33",
    E: "#4e1187",
    F: "#153081",
  },
};

const Sicp = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;

  color: ${(props) => (props.mode === "light" ? "#37a4f1" : "#012f58")};
  span {
    color: ${(props) => (props.mode === "light" ? "#37a4f1" : "#012f58")};
    vertical-align: super;
    font-size: 8px;
    position: relative;
    top: 0.1em;
  }
  b {
    color: ${(props) => (props.mode === "light" ? "#37a4f1" : "#012f58")};
  }
`;

export const ICP = ({ children, mode = "light", digits = 4 }) => {
  // const icpCycles = BigInt(useSelector((state) => state.ic.oracle.icpCycles));

  if (!children)
    return (
      <Sicp mode={mode}>
        <b>ICP</b>
      </Sicp>
    );

  // const xdr = Number((BigInt(children) * icpCycles) / 10000000000n) / 100;

  let val = AccountIdentifier.e8sToIcp(children);
  let [a, b] = val.toString().split(".");
  b = b.substring(0, digits);
  return (
    // <Tooltip hasArrow placement="left" label={`${xdr.toFixed(2)} XDR`}>
    <Sicp mode={mode}>
      {a}.<span>{b}</span> <b>ICP</b>
    </Sicp>
    // </Tooltip>
  );
};

export const ACC = ({ children, short = false, onClick = () => {} }) => {
  const mode = useColorModeValue("dark", "light");
  const color = hexColors[mode];

  let a = children
    .slice(0, 5)
    .toUpperCase()
    .split("")
    .map((x, idx) => (
      <span key={idx} style={{ color: color[x] }}>
        {x}
      </span>
    ));
  let b = children.slice(5, -5);
  let c = children
    .slice(-5)
    .toUpperCase()
    .split("")
    .map((x, idx) => (
      <span key={idx} style={{ color: color[x] }}>
        {x}
      </span>
    ));

  return (
    <Sacc mode={mode} onClick={onClick}>
      <b>{a}</b>
      {short ? "..." : b}
      <b>{c}</b>
    </Sacc>
  );
};

const Sanv = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(220, 80, 255);
  span {
    color: rgb(160, 0, 255);
    vertical-align: super;
    font-size: 8px;
    position: relative;
    top: 0.1em;
  }
  b {
    color: rgb(160, 40, 250);
  }
`;

export const ANV = ({ children }) => {
  if (!children)
    return (
      <Sanv>
        <b>ANV</b>
      </Sanv>
    );
  let val = AccountIdentifier.eToAnv(children);
  let [a, b] = val.toString().split(".");
  return (
    <Sanv>
      {a}
      {b !== "0000" ? (
        <>
          .<span>{b}</span>
        </>
      ) : null}{" "}
      <b>ANV</b>
    </Sanv>
  );
};

const Sft = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(220, 80, 255);
  .fractions {
    color: rgb(160, 0, 255);
    vertical-align: super;
    font-size: 8px;
    position: relative;
    top: 0.1em;
  }
  b {
    color: rgb(160, 40, 250);
  }
  .idnum {
    font-size: 10px;
    color: rgb(160, 40, 250);
    opacity: 0.7;
  }
`;

export const FTI = ({ id, amount }) => {
  let meta = useFT(id);

  if (!meta)
    return (
      <Sanv>
        <b>...</b>
      </Sanv>
    );

  let { symbol, kind } = meta;

  if (!amount)
    return (
      <Sanv>
        <b>{symbol.toUpperCase()}</b>
      </Sanv>
    );
  if ("fractionless" in kind)
    return (
      <Sft>
        {amount} <b>{symbol.toUpperCase()}</b>{" "}
        <span className="idnum">#{id.padStart(4, 0)}</span>
      </Sft>
    );
  let val = AccountIdentifier.placeDecimal(amount, meta.decimals, 4);
  let [a, b] = val.toString().split(".");
  return (
    <Sft>
      {a}.<span className="fractions">{b}</span> <b>{symbol.toUpperCase()}</b>
    </Sft>
  );
};

const Spri = styled.span`
  font-family: Verdana;
  font-size: 80%;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgb(220, 220, 220);
  b {
    color: rgb(220, 220, 220);
  }
`;

export const PRI = ({ children }) => {
  let p = children.split("-");
  return (
    <Spri>
      {p.map((x, idx) => {
        return (
          <span key={idx}>
            {idx !== 0 ? "-" : null}
            <b>{x}</b>
          </span>
        );
      })}
    </Spri>
  );
};

const Snfta = styled.span`
  font-family: Verdana;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(117, 130, 149);
  b {
    color: rgb(250, 0, 120);
  }
  cursor: pointer;
`;

export const NFTA = ({ children, onClick = () => {} }) => {
  if (!children)
    return (
      <Snfta onClick={onClick}>
        <b>NFTA</b>
      </Snfta>
    );
  return (
    <Snfta onClick={onClick}>
      <b>NFTA</b>
      {children.slice(4)}
    </Snfta>
  );
};

const Shash = styled.span`
  font-family: Verdana;
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${(props) =>
    props.mode === "light" ? "#377a5f" : "rgb(110, 200, 170)"};

  b {
    color: ${(props) =>
      props.mode === "light" ? "#005e47" : "rgb(140, 240, 220)"};
  }
`;

export const HASH = ({ children, short = false }) => {
  const mode = useColorModeValue("light", "dark");
  let t = short
    ? (children = children.slice(0, 4) + ".." + children.slice(-4))
    : children;

  let txt = t
    .split("")
    .map((x, idx) => (Math.floor(idx / 2) % 2 == 0 ? <b key={idx}>{x}</b> : x));
  return <Shash mode={mode}>{txt}</Shash>;
};
