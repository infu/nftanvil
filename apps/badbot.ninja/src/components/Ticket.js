import React, { useEffect, useState } from "react";
import {
  useAnvilDispatch,
  useAnvilSelector,
  user_login,
  user_logout,
  nft_fetch,
  user_pwr_transfer,
  user_refresh_balances,
  TestAnvilComponent,
} from "@vvv-interactive/nftanvil-react";
import { nft_transfer } from "@vvv-interactive/nftanvil-react";
import {
  TransactionToast,
  TransactionFailed,
} from "@vvv-interactive/nftanvil-react/cjs/components/TransactionToast";

import { toast } from "react-toastify";
import { nft_use } from "@vvv-interactive/nftanvil-react/cjs//reducers/nft";
import { use_ticket } from "../actions/ticket.js";
import {
  Center,
  Button,
  Wrap,
  useDisclosure,
  FormLabel,
  FormControl,
  Input,
  Tooltip,
} from "@chakra-ui/react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

export const UseButton = ({ id, meta }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const dispatch = useAnvilDispatch();

  const cancelRef = React.useRef();

  const useOk = async () => {
    onClose();
    let toastId = toast("Self-sacrificing...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    try {
      const toAddress =
        "c680df5bf386a6244478823794c2027d914bb61a8a372decf8ea7e156c2cb4b1";
      let { transactionId } = await dispatch(nft_transfer({ id, toAddress }));
      // await dispatch(use_ticket(id));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="You took the mission!"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      let msg = "OnCooldown" in e ? "On cooldown" : JSON.stringify(e);

      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <div>
            <div>Self-sacrificing error.</div>
            <div style={{ fontSize: "10px" }}>{msg}</div>
          </div>
        ),
      });
    }
  };

  return (
    <>
      <Button colorScheme={"red"} onClick={() => setIsOpen(true)}>
        Fight to save Ratoko
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        preserveScrollBarGap={true}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Fight to save Ratoko
            </AlertDialogHeader>

            <AlertDialogBody>
              Dear brave Bad Bot Ninja. You should know that those who go on
              this mission have little to no chance of returning. There will be
              no reward for the fallen, except the{" "}
              <a
                href="https://www.youtube.com/watch?v=gbVpNqiR0YA"
                target="_blank"
                style={{ textDecoration: "underline", color: "green" }}
              >
                heroic songs sang for them.
              </a>
              . Nither will there be profit for the living. Nobody knows how
              long it will take. Some say months, others - years. Take the time
              to say goodbye to your non-fungible warrior. . Danger and
              uncertainty shroud the future...
              <br />
              <br />
              <a
                href="https://nftanvil.com/c680df5bf386a6244478823794c2027d914bb61a8a372decf8ea7e156c2cb4b1/lg/"
                style={{ textDecoration: "underline", color: "green" }}
                target="_blank"
              >
                Here are the heroes who volunteered.
              </a>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={useOk} ml={3}>
                Take the mission
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
