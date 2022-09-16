import React, { useEffect, useState } from "react";

import { user_login } from "../reducers/user";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";
import { Button } from "@chakra-ui/react";
import Dfinity from "../assets/dfinity.svg";

export function LoginRequired({ anonymous = true, label, children }) {
  // const anonymous = useSelector((state) => state.user.anonymous);
  const dispatch = useDispatch();

  return anonymous ? (
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
