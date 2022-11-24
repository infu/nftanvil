/* global BigInt */
import React, { useEffect, useState } from "react";

import { Button, Box } from "@chakra-ui/react";

import Dfinity from "../assets/dfinity.svg";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  user_login,
  user_login_ii,
  user_logout,
} from "../index.js";
import Athene from "../assets/athene.svg";
export function Auth() {
  const authenticated = useSelector((state) => state.user.authenticated);

  const dispatch = useDispatch();

  return !authenticated ? (
    <Button
      size="lg"
      variant="outline"
      rightIcon={
        <img src={Athene} style={{ width: "32px", height: "32px" }} alt="" />
      }
      colorScheme="gray"
      onClick={() => dispatch(user_login())}
    >
      Athena Identity
    </Button>
  ) : null;
}

export function AuthII() {
  const authenticated = useSelector((state) => state.user.authenticated_ii);

  const dispatch = useDispatch();

  return !authenticated ? (
    <Button
      variant="outline"
      size="lg"
      colorScheme="gray"
      onClick={() => dispatch(user_login_ii())}
      rightIcon={
        <img src={Dfinity} style={{ width: "32px", height: "32px" }} alt="" />
      }
    >
      Internet Identity
    </Button>
  ) : null;
}
