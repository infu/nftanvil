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
    let toastId = toast("Using...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    try {
      let { transactionId } = await dispatch(use_ticket(id));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Use successfull"
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
            <div>Using error.</div>
            <div style={{ fontSize: "10px" }}>{msg}</div>
          </div>
        ),
      });
    }
  };

  return (
    <>
      <Button colorScheme={"red"} onClick={() => setIsOpen(true)}>
        Use Ticket
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
              Use NFT
            </AlertDialogHeader>

            <AlertDialogBody>
              Using this ticket will place 1 year cooldown on it and give you a
              random Ratoko NFT. Once you get the Ratoko, you can burn this
              ticket.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={useOk} ml={3}>
                Use
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
