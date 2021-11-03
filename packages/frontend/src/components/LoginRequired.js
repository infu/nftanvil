import Dfinity from "../assets/dfinity.svg";
import { login } from "../reducers/user";
import { useSelector, useDispatch } from "react-redux";

import { Button } from "@chakra-ui/react";

export function LoginRequired({ label, children }) {
  const anonymous = useSelector((state) => state.user.anonymous);
  const dispatch = useDispatch();

  return anonymous ? (
    <>
      <Button
        variant="solid"
        rightIcon={
          <img src={Dfinity} style={{ width: "40px", height: "40px" }} />
        }
        mt={4}
        w={"100%"}
        colorScheme="teal"
        size="lg"
        onClick={() => dispatch(login())}
      >
        {label ?? "Authenticate"}
      </Button>
    </>
  ) : (
    children
  );
}
