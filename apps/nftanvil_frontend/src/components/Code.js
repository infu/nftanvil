import styled from "@emotion/styled";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";

const Stx = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  b {
    color: rgb(170, 220, 0);
  }
`;

export const TX = ({ children }) => {
  return (
    <Stx>
      <b>TX</b>
      {children}
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

export const ACC = ({ children, short = false }) => {
  if (!short) {
    let a = children.slice(0, 4);
    let b = children.slice(4, -4);
    let c = children.slice(-4);

    return (
      <Sacc>
        <b>{a}</b>
        {b}
        <b>{c}</b>
      </Sacc>
    );
  } else {
    let a = children.slice(0, 2);
    let b = children.slice(2, 4);
    let c = children.slice(-4, -2);
    let d = children.slice(-2);

    return (
      <Sacc>
        <b>{a}</b>
        {b}....{c}
        <b>{d}</b>
      </Sacc>
    );
  }
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
          <>
            {idx !== 0 ? "-" : null}
            <b>{x}</b>
          </>
        );
      })}
    </Spri>
  );
};

const Stid = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  b {
    color: rgb(250, 0, 120);
  }
`;

export const TID = ({ children }) => {
  return (
    <Stid>
      <b>NFT</b>
      {children}
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
    <Spwr>
      {a}.<span>{b}</span> <b>PWR</b>
    </Spwr>
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
    <Sicp>
      {a}.<span>{b}</span> <b>ICP</b>
    </Sicp>
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
