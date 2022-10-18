import React, { useEffect, useState } from "react";

import { user_login } from "../reducers/user";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";
import { Button } from "@chakra-ui/react";
import Dfinity from "../assets/dfinity.svg";

export function LoginRequired({ label, children }) {
  const authenticated = useSelector((state) => state.user.authenticated);

  const dispatch = useDispatch();

  return !authenticated ? (
    <>
      <Button
        variant="solid"
        rightIcon={
          <img alt="" src={Dfinity} style={{ width: "40px", height: "40px" }} />
        }
        mt={4}
        w={"100%"}
        colorScheme="teal"
        size="lg"
        onClick={() => dispatch(user_login())}
      >
        {label || "Authenticate"}
      </Button>
    </>
  ) : (
    children
  );
}
