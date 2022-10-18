import React, { useEffect, useState, useRef } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

export default function Conf() {
  const { width, height } = useWindowSize();
  return <Confetti width={width} height={height} />;
}
