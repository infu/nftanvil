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

export function Auth() {
  const authenticated = useSelector((state) => state.user.authenticated);

  const dispatch = useDispatch();

  return !authenticated ? (
    <Button
      variant="solid"
      // rightIcon={
      //   <img src={Athene} style={{ width: "32px", height: "32px" }} alt="" />
      // }
      colorScheme="gray"
      onClick={() => dispatch(user_login())}
    >
      Authenticate
    </Button>
  ) : null;
}

export function AuthII() {
  const authenticated = useSelector((state) => state.user.authenticated_ii);

  const dispatch = useDispatch();

  return !authenticated ? (
    <Button
      variant="outline"
      size="sm"
      colorScheme="gray"
      onClick={() => dispatch(user_login_ii())}
    >
      Internet Identity
    </Button>
  ) : null;
}
