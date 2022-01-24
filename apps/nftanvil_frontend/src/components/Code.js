import styled from "@emotion/styled";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { Tooltip } from "@chakra-ui/react";
const Stx = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(117, 130, 149);
  b {
    color: rgb(110, 200, 170);
  }
`;

export const TX = ({ children }) => {
  return (
    <Stx>
      <b>TX</b>
      {children.slice(2)}
    </Stx>
  );
};

const Sacc = styled.span`
  font-family: Hexaframe;
  font-size: 80%;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgb(230, 240, 240);
  b {
    color: rgb(170, 255, 0);
  }
`;

const hexColors = {
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
};

export const ACC = ({ children, short = false }) => {
  let a = children
    .slice(0, 4)
    .toUpperCase()
    .split("")
    .map((x, idx) => (
      <span key={idx} style={{ color: hexColors[x] }}>
        {x}
      </span>
    ));
  let b = children.slice(4, -4);
  let c = children
    .slice(-4)
    .toUpperCase()
    .split("")
    .map((x, idx) => (
      <span key={idx} style={{ color: hexColors[x] }}>
        {x}
      </span>
    ));

  return (
    <Sacc>
      <b>{a}</b>
      {short ? "..." : b}
      <b>{c}</b>
    </Sacc>
  );
};

const Spri = styled.span`
  font-family: Hexaframe;
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

const Stid = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(117, 130, 149);
  b {
    color: rgb(250, 0, 120);
  }
`;

export const TID = ({ children }) => {
  return (
    <Stid>
      <b>NFT</b>
      {children.slice(3)}
    </Stid>
  );
};

const Spwr = styled.span`
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

export const PWR = ({ children }) => {
  if (!children)
    return (
      <Spwr>
        <b>PWR</b>
      </Spwr>
    );
  let val = AccountIdentifier.e8sToPwr(children);
  let [a, b] = val.toString().split(".");
  return (
    <Tooltip placement="top-start" label={children}>
      <Spwr>
        {a}.<span>{b}</span> <b>PWR</b>
      </Spwr>
    </Tooltip>
  );
};

const Sicp = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(120, 200, 255);
  span {
    color: rgb(60, 160, 230);
    vertical-align: super;
    font-size: 8px;
    position: relative;
    top: 0.1em;
  }
  b {
    color: rgb(0, 160, 250);
  }
`;

export const ICP = ({ children }) => {
  if (!children)
    return (
      <Sicp>
        <b>ICP</b>
      </Sicp>
    );
  let val = AccountIdentifier.e8sToIcp(children);
  let [a, b] = val.toString().split(".");
  return (
    <Tooltip placement="top-start" label={children + " e8s"}>
      <Sicp>
        {a}.<span>{b}</span> <b>ICP</b>
      </Sicp>
    </Tooltip>
  );
};

const Shash = styled.span`
  font-family: Hexaframe;
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgb(110, 200, 170);

  b {
    color: rgb(140, 240, 220);
  }
`;

export const HASH = ({ children }) => {
  let txt = children
    .split("")
    .map((x, idx) => (Math.floor(idx / 2) % 2 == 0 ? <b key={idx}>{x}</b> : x));
  return <Shash>{txt}</Shash>;
};
