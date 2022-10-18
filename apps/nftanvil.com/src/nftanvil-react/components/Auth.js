/* global BigInt */
import React, { useEffect, useState } from "react";

import { Button, Box } from "@chakra-ui/react";

import Dfinity from "../assets/dfinity.svg";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  user_login,
  user_logout,
} from "../index.js";

export function Auth() {
  const authenticated = useSelector((state) => state.user.authenticated);

  const dispatch = useDispatch();

  return (
    <Box>
      {!authenticated ? (
        <Button
          variant="solid"
          rightIcon={
            <img
              src={Dfinity}
              style={{ width: "40px", height: "40px" }}
              alt=""
            />
          }
          colorScheme="gray"
          onClick={() => dispatch(user_login())}
        >
          Authenticate
        </Button>
      ) : (
        <Button onClick={() => dispatch(user_logout())}>Logout</Button>
      )}
    </Box>
  );
}
