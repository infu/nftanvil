import React, { useEffect, useState } from "react";

import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
  dialog_open,
  user_set_main_account,
} from "../index.js";
import { Button } from "@chakra-ui/react";
import Dfinity from "../assets/dfinity.svg";

export function LoginRequired({ label, children }) {
  const dispatch = useDispatch();

  const main_account = useSelector((s) => s.user.main_account);

  const auth = () => {
    dispatch(
      dialog_open({
        name: "select_account",
      })
    ).then((address) => {
      dispatch(user_set_main_account(address));
    });
  };

  return !main_account ? (
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
        onClick={auth}
      >
        {label || "Authenticate"}
      </Button>
    </>
  ) : (
    children
  );
}
