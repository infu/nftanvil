import styled from "@emotion/styled";

const Stid = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  b {
    color: rgb(250, 0, 120);
  }
`;

const Stx = styled.span`
  font-family: Hexaframe;
  letter-spacing: 1px;
  text-transform: uppercase;
  b {
    color: rgb(170, 220, 0);
  }
`;

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

const Sacc = styled.span`
  font-family: Hexaframe;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgb(230, 240, 240);
  b {
    color: rgb(170, 255, 0);
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

export const ACC = ({ children }) => {
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
};

export const TID = ({ children }) => {
  return (
    <Stid>
      <b>NFT</b>
      {children}
    </Stid>
  );
};

export const HASH = ({ children }) => {
  let txt = children
    .split("")
    .map((x, idx) => (Math.floor(idx / 2) % 2 == 0 ? <b key={idx}>{x}</b> : x));
  return <Shash>{txt}</Shash>;
};
