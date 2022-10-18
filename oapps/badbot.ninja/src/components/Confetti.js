import React, { useEffect, useState, useRef } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import useTimeout from "react-use/lib/useTimeout";
import Confetti from "react-confetti";

export default function Conf() {
  const [isReady, cancel] = useTimeout(10000);
  const { width, height } = useWindowSize();
  if (isReady()) return null;
  return <Confetti width={width} height={height} />;
}
