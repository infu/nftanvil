import {
  Text,
  Stack,
  Box,
  useColorModeValue,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { itemQuality } from "@vvv-interactive/nftanvil-tools/cjs/items.js";
import React, { useEffect, useState } from "react";
import {
  nftFetch,
  nftEnterCode,
  burn,
  transfer,
  use,
  transfer_link,
  claim_link,
  plug,
  unsocket,
  approve,
  set_price,
  buy,
  purchase_intent,
} from "../reducers/nft";
import { Spinner } from "@chakra-ui/react";
import { push } from "connected-react-router";
import Confetti from "./Confetti";
import { LoginRequired } from "./LoginRequired";
import { toast } from "react-toastify";
import lodash from "lodash";
import { tokenFromText } from "@vvv-interactive/nftanvil-tools/cjs/token.js";
import { useSelector, useDispatch } from "react-redux";
import {
  Center,
  Button,
  Wrap,
  useDisclosure,
  FormLabel,
  FormControl,
  Input,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  HStack,
  Tag,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { VerifiedIcon } from "../icons";
import moment from "moment";
import styled from "@emotion/styled";
import thumb_bg from "../assets/default.png";
import thumb_over from "../assets/over.png";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import * as TransactionId from "@vvv-interactive/nftanvil-tools/cjs/transactionid.js";
import { Principal } from "@dfinity/principal";
import {
  TransactionToast,
  TransactionFailed,
} from "../components/TransactionToast";
import { TX, ACC, TID, HASH } from "./Code";

const ContentBox = styled.div`
  margin: 12px 0px;

  video,
  img {
    max-width: 600px;
    max-height: 500px;
    border-radius: 6px;
  }
`;

const Thumb = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 6px;
  position: relative;
  box-overflow: hidden;

  .border {
    top: 0px;
    left: 0px;
    position: absolute;
    background: url(${thumb_bg});
    background-size: 72px 72px;
    width: 72px;
    height: 72px;

    &:hover {
      background-image: url(${thumb_over});
    }
  }
  .custom {
    top: 0px;
    left: 0px;
    position: absolute;
    margin: 4px 4px;
    object-fit: cover;
    object-position: center center;
    height: 64px;
    width: 64px;
    border-radius: 5px;
  }
`;

export const NFTMenu = ({ id, meta, owner }) => {
  return (
    <Box p={3}>
      {owner ? (
        <Wrap spacing="3">
          <UseButton id={id} meta={meta} />
          <TransferButton id={id} meta={meta} />
          <ApproveButton id={id} meta={meta} />

          <TransferLinkButton id={id} meta={meta} />
          <SetPriceButton id={id} meta={meta} />

          <BurnButton id={id} meta={meta} />
          <SocketButton id={id} meta={meta} />
          <UnsocketButton id={id} meta={meta} />
        </Wrap>
      ) : (
        <Wrap>
          {meta.transferable && meta.price.amount !== "0" ? (
            <LoginRequired label="Authenticate to buy">
              <BuyButton id={id} meta={meta} />
            </LoginRequired>
          ) : null}
        </Wrap>
      )}
    </Box>
  );
};

function SetPriceButton({ id }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const address = useSelector((state) => state.user.address);

  const initialRef = React.useRef();

  const setPriceOk = async () => {
    let price = {
      amount: AccountIdentifier.icpToE8s(parseFloat(initialRef.current.value)),
      marketplace: [],
      affiliate: [],
    };

    onClose();
    let toastId = toast("Setting price...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    try {
      await dispatch(set_price({ id, price }));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <div>
            <div>Setting price successfull.</div>
          </div>
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      console.error("SetPrice error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed title="Setting price failed" message={e.message} />
        ),
      });
    }
  };

  return (
    <>
      <Button onClick={onOpen}>Set Price</Button>

      <Modal
        initialFocusRef={initialRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Price</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Price</FormLabel>
              <Input ref={initialRef} placeholder="0.001" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button ml={3} onClick={setPriceOk}>
              Set
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function TransferButton({ id, meta }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const initialRef = React.useRef();

  const transferOk = async () => {
    let toAddress = initialRef.current.value.toUpperCase();
    onClose();

    await dispatch(transfer({ id, toAddress }));
  };

  return (
    <>
      <Button onClick={onOpen} isDisabled={!meta.transferable}>
        Transfer
      </Button>

      <Modal
        initialFocusRef={initialRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send NFT</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>To Address</FormLabel>
              <Input ref={initialRef} placeholder="50e3df3..." />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button ml={3} onClick={transferOk}>
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function ApproveButton({ id, meta }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const initialRef = React.useRef();

  const approveOk = async () => {
    let spender = Principal.fromText(initialRef.current.value);

    onClose();
    let toastId = toast("Approving...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    try {
      let { transactionId } = await dispatch(approve({ id, spender }));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Approve successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      console.error("Transfer error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed title="Approve failed" message={e.message} />
        ),
      });
    }
  };

  return (
    <>
      <Button onClick={onOpen} isDisabled={!meta.transferable}>
        Approve
      </Button>

      <Modal
        initialFocusRef={initialRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Approve</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>
              This will allow a principal to transfer, socket, unsocket and use
              this NFT. Setting one clears the previous.
            </Text>
            <FormControl>
              <FormLabel>Principal</FormLabel>
              <Input ref={initialRef} placeholder="aaaaa-aa..." />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button ml={3} onClick={approveOk}>
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function UnsocketButton({ id }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const initialRef = React.useRef();

  const transferOk = async () => {
    let plug_id = initialRef.current.value;
    onClose();
    let toastId = toast("Unplugging...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    try {
      let { transactionId } = await dispatch(
        unsocket({ socket_id: id, plug_id })
      );

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Unplugging successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      console.error("Unplugging error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed title="Unplugging failed" message={e.message} />
        ),
      });
    }
  };
  return (
    <>
      <Button onClick={onOpen}>Unplug from Socket</Button>

      <Modal
        initialFocusRef={initialRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unplug NFT from socket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Target plug token identifier</FormLabel>
              <Input ref={initialRef} placeholder="u2jxv-3qkor..." />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button ml={3} onClick={transferOk}>
              Unplug
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function SocketButton({ id }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const initialRef = React.useRef();

  const transferOk = async () => {
    let socket_id = initialRef.current.value;
    onClose();
    let toastId = toast("Plugging...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });
    try {
      let { transactionId } = await dispatch(plug({ plug_id: id, socket_id }));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Plugging successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      console.error("Plugging error", e);
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: <TransactionFailed title="Socket failed" message={e.message} />,
      });
    }
  };
  return (
    <>
      <Button onClick={onOpen}>Plug In Socket</Button>

      <Modal
        initialFocusRef={initialRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Plug NFT into socket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Target socket token identifier</FormLabel>
              <Input ref={initialRef} placeholder="u2jxv-3qkor..." />
              <Text p={1} mt={1}>
                Both the plug and the socket need to be owned by the same
                account
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button ml={3} onClick={transferOk}>
              Plug
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export const UseButton = ({ id, meta }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const dispatch = useDispatch();

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
      let useData = { cooldown: 2 };
      let memo = [12, 10, 5, 0, 0, 1, 7];
      let { transactionId } = await dispatch(use({ id, use: useData, memo }));

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
      <Button onClick={() => setIsOpen(true)}>Use</Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Use NFT
            </AlertDialogHeader>

            <AlertDialogBody>
              This use is for demo purposes. Once used, the NFT will have 2 min
              cooldown.
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

export const TransferLinkButton = ({ id, meta }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [creatingLink, setCreateLink] = React.useState(false);

  const onClose = () => setIsOpen(false);
  const dispatch = useDispatch();

  const cancelRef = React.useRef();

  const transferOk = async () => {
    setCreateLink(true);
    let code = await dispatch(transfer_link({ id }));
    setCreateLink(false);

    setLink("https://nftanvil.com/" + code);
  };

  const [link, setLink] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} isDisabled={!meta.transferable}>
        Create Transfer Link
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            {!link ? (
              <>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Transfer with link
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure? Anyone with the link will be able to claim the
                  NFT.
                </AlertDialogBody>

                <AlertDialogFooter>
                  {!creatingLink ? (
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                  ) : null}
                  <Button
                    isLoading={creatingLink}
                    colorScheme="red"
                    onClick={transferOk}
                    ml={3}
                  >
                    Create link
                  </Button>
                </AlertDialogFooter>
              </>
            ) : (
              <>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Link to claim NFT
                </AlertDialogHeader>

                <AlertDialogBody>{link}</AlertDialogBody>

                <AlertDialogFooter>
                  <Button onClick={onClose} ml={3}>
                    Ok
                  </Button>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const BuyButton = ({ id, meta }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const dispatch = useDispatch();

  const cancelRef = React.useRef();

  const [purchaseIntent, setPurchaseIntent] = useState(null);

  const buyOk = () => {
    onClose();
    dispatch(buy({ id, intent: purchaseIntent }));
  };

  return (
    <>
      <Button
        onClick={async () => {
          let intent = await dispatch(purchase_intent({ id }));
          setPurchaseIntent(intent);
          setIsOpen(true);
        }}
      >
        Buy
      </Button>

      {purchaseIntent ? (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Buy NFT
              </AlertDialogHeader>

              <AlertDialogBody>
                Buy for{" "}
                {AccountIdentifier.e8sToIcp(purchaseIntent.price.amount)} ICP ?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={buyOk} ml={3}>
                  Buy
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      ) : null}
    </>
  );
};

export const BurnButton = ({ id }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const dispatch = useDispatch();

  const cancelRef = React.useRef();

  const burnOk = async () => {
    onClose();

    let toastId = toast("Burning...", {
      type: toast.TYPE.INFO,
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    try {
      let { transactionId } = await dispatch(burn({ id }));

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        render: (
          <TransactionToast
            title="Burning successfull"
            transactionId={transactionId}
          />
        ),
        autoClose: 9000,
        pauseOnHover: true,
      });
    } catch (e) {
      toast.update(toastId, {
        type: toast.TYPE.ERROR,
        isLoading: false,
        closeOnClick: true,

        render: (
          <TransactionFailed title="Burning failed" message={e.message} />
        ),
      });
    }
  };
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Burn</Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Burn NFT
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will destroy the NFT completely. You can't undo
              this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={burnOk} ml={3}>
                Burn
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const NFTPopover = ({ meta }) => {
  return (
    <Stack>
      <Center>
        <NFTContent meta={meta} />
      </Center>
      <Center>
        <NFTInfo meta={meta} />
      </Center>
    </Stack>
  );
};

export const NFT = ({ id }) => {
  const meta = useSelector((state) => state.nft[id]);

  const dispatch = useDispatch();

  const [popoverOpen, setPopover] = useState(false);

  useEffect(() => {
    dispatch(nftFetch(id));
  }, [id, dispatch]);

  return (
    <Thumb
      style={{ zIndex: popoverOpen ? 10 : 0 }}
      onMouseOver={() => {
        setPopover(true);
      }}
      onMouseOut={() => {
        setPopover(false);
      }}
    >
      <Link to={"/nft/" + id}>
        {meta?.thumb?.ipfs?.url ? (
          <img alt="" className="custom" src={meta.thumb.ipfs.url} />
        ) : meta?.thumb?.internal?.url ? (
          <img alt="" className="custom" src={meta.thumb.internal.url} />
        ) : (
          ""
        )}
        <div className="border" />
      </Link>
      {popoverOpen ? (
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: "56px",
            left: "56px",
            width: "400px",
          }}
        >
          <NFTPopover meta={meta} />
        </Box>
      ) : null}
    </Thumb>
  );
};

export const NFTClaim = (p) => {
  const code = p.match.params.code;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(nftEnterCode(code));
  }, [code, dispatch]);

  return null;
};

export const NFTPage = (p) => {
  const id = p.match.params.id;
  const code = p.match.params.code;

  const address = useSelector((state) => state.user.address);

  const meta = useSelector((state) => state.nft[id]);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(nftFetch(id));
  }, [id, dispatch]);

  const onClaim = async () => {
    setClaiming(true);
    setError(false);

    let resp = await dispatch(claim_link({ code }));
    setClaiming(false);

    if (resp.ok !== undefined) {
      setClaimed(true);
    } else {
      setError(true);
    }
  };

  if (!meta) return null;
  return (
    <Stack ml={"10px"} mr={"10px"} mt={"80px"}>
      <Center>
        <NFTContent meta={meta} />
      </Center>
      <Center>
        <Stack>
          <NFTThumb meta={meta} />
          <NFTInfo id={id} meta={meta} />
          <NFTProInfo id={id} meta={meta} />
        </Stack>
      </Center>

      <Center>
        <NFTMenu
          owner={
            address && address.toUpperCase() === meta?.bearer?.toUpperCase()
          }
          id={id}
          meta={meta}
        />
      </Center>

      {claimed ? (
        <>
          <Confetti />
          <Alert status="success">
            <AlertIcon />
            <AlertTitle mr={2}>Claiming sucess!</AlertTitle>
            <AlertDescription>
              The NFT is now yours. This link can't be used again.
            </AlertDescription>
          </Alert>
        </>
      ) : null}
      {!claimed && code ? (
        <>
          <Center>
            <LoginRequired label="Authenticate before claiming">
              <Button
                isLoading={claiming}
                loadingText="Claiming"
                onClick={onClaim}
                colorScheme="teal"
                size="lg"
              >
                Claim NFT
              </Button>
            </LoginRequired>
          </Center>

          {error ? (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Claiming failed!</AlertTitle>
              <AlertDescription>
                Perhaps someone else claimed this code before you or it's not
                valid
              </AlertDescription>
            </Alert>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
};

export const NFTContent = (p) => {
  if (p.meta?.content?.external) return null;

  const c =
    p.meta?.content?.internal ||
    p.meta?.content?.ipfs ||
    p.meta?.content?.external;
  if (!c) return null;
  const ctype =
    c.contentType.indexOf("image/") !== -1
      ? "image"
      : c.contentType.indexOf("video/") !== -1
      ? "video"
      : "unknown";

  if (ctype === "unknown") return null;

  return (
    <ContentBox>
      {ctype === "image" && c.url ? (
        <img src={c.url} alt="" width="100%" />
      ) : null}
      {ctype === "video" && c.url ? (
        <video controls loop muted autoPlay>
          <source src={c.url} type={c.contentType} />
        </video>
      ) : null}
    </ContentBox>
  );
};

export const NFTPreview = (p) => {
  return (
    <Stack spacing="5">
      <NFTContent meta={p} />
      <NFTInfo meta={p} />
      <NFTThumb meta={p} />
    </Stack>
  );
};

export const NFTThumb = (p) => {
  if (p.meta?.thumb?.external) return null;

  const c =
    p.meta?.thumb?.internal || p.meta?.thumb?.ipfs || p.meta?.thumb?.external;

  if (!c) return null;

  return (
    <Thumb {...p}>
      {c.url ? <img className="custom" alt="" src={c.url} /> : ""}
      <div className="border" />
    </Thumb>
  );
};

const verifyDomain = lodash.debounce((meta, cb) => {
  fetch("https://" + meta.domain + "/.well-known/nftanvil.json")
    .then((response) => response.json())
    .then((data) => {
      try {
        cb(data.allowed.indexOf(meta.author) !== -1);
      } catch (e) {
        console.log(e);
        cb(false);
      }
    })
    .catch((e) => {
      console.log(e);
      cb(false);
    });
}, 1000);

const MetaDomain = ({ meta }) => {
  const [isLoading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setVerified(false);
    setLoading(true);

    verifyDomain(meta, (verified) => {
      if (verified) {
        setVerified(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [meta.domain]);

  return (
    <Box
      color={verified ? "green.300" : isLoading ? null : "red.300"}
      as={verified ? null : isLoading ? null : "s"}
    >
      {meta.domain}{" "}
      {isLoading ? (
        <Spinner size="xs" />
      ) : verified ? (
        <VerifiedIcon w={"16px"} h={"16px"} />
      ) : null}
    </Box>
  );
};

export const NFTInfo = ({ id, meta }) => {
  const bg = useColorModeValue("gray.500", "gray.700");
  if (!meta || !("quality" in meta)) return null;
  const qcolor = itemQuality[meta.quality].color;
  let nowMinutes = Math.floor(Date.now() / 1000 / 60);

  //if (!meta.name) return null;
  return (
    <Box bg={bg} borderRadius="md" w={350} p={2} sx={{ position: "relative" }}>
      {meta.content?.thumb?.url ? <img src={meta.content.thumb.url} /> : ""}

      <Stack spacing={0}>
        {meta.name ? (
          <Text color={qcolor} fontSize="16px">
            {meta.name.capitalize()}
          </Text>
        ) : null}
        {meta.tags && meta.tags.length ? (
          <Wrap spacing={1}>
            {meta.tags.map((a, idx) => (
              <Tag key={idx} size="sm">
                {a}
              </Tag>
            ))}
          </Wrap>
        ) : null}
        {meta.domain ? <MetaDomain meta={meta} /> : null}
        {"bindsForever" in meta.transfer ? (
          <Text fontSize="14px">Binds on transfer</Text>
        ) : null}
        {"bindsDuration" in meta.transfer ? (
          <Text fontSize="14px">
            Binds on transfer for{" "}
            {moment.duration(meta.transfer.bindsDuration, "minutes").humanize()}
          </Text>
        ) : null}

        {meta.boundUntil > nowMinutes ? (
          <Text fontSize="14px" color={"green"} as="i">
            {"bound for " +
              moment
                .duration(meta.boundUntil - nowMinutes, "minutes")
                .humanize()}
          </Text>
        ) : null}

        {meta?.use?.consumable?.desc ? (
          <Text fontSize="14px" color={"green"} as="i">
            Use: {meta.use.consumable.desc.capitalize()} (Consumed in the
            process)
          </Text>
        ) : null}

        {meta.cooldownUntil > nowMinutes ? (
          <Text fontSize="14px" color={"green.300"}>
            {moment
              .duration(meta.cooldownUntil - nowMinutes, "minutes")
              .humanize() + " cooldown left"}
          </Text>
        ) : null}

        {meta?.use?.cooldown?.desc ? (
          <Text fontSize="14px" color={"green.300"}>
            Use: {meta.use.cooldown.desc.capitalize()} (
            {moment.duration(meta.use.cooldown.duration, "minutes").humanize()}{" "}
            cooldown)
          </Text>
        ) : null}
        {meta.hold?.external?.desc ? (
          <Text fontSize="14px" color={"green.300"}>
            Hold: {meta.hold.external.desc.capitalize()}
          </Text>
        ) : null}
        {meta.attributes && meta.attributes.length
          ? meta.attributes.map((a, idx) => (
              <Text key={idx} fontSize="14px">
                {a[1] >= 0 ? "+" : ""}
                {a[1]} {a[0].capitalize()}
              </Text>
            ))
          : null}
        {meta.lore ? (
          <Text fontSize="14px" pt="14px" color={"yellow"}>
            "{meta.lore.capitalize()}"
          </Text>
        ) : null}
        {meta.ttl && meta.ttl > 0 ? (
          <Text fontSize="14px" pt="14px" color={"red"}>
            Lasts {moment.duration(meta.ttl, "minutes").humanize()}
          </Text>
        ) : null}
        {meta.sockets && meta.sockets.length ? (
          <Wrap spacing={0}>
            {meta.sockets.map((tid, idx) => (
              <NFT id={tid} key={tid} />
            ))}
          </Wrap>
        ) : null}
        {meta.price.amount && meta.price.amount !== "0" ? (
          <Text>{AccountIdentifier.e8sToIcp(meta.price.amount)} ICP</Text>
        ) : null}
        {id ? (
          <Text pt="1" pr="1" align="right" fontSize="10px">
            <TID>{id}</TID>
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
};

export const NFTProInfo = ({ id, meta }) => {
  const bg = useColorModeValue("gray.300", "gray.900");
  if (!meta || !("quality" in meta)) return null;

  let nowMinutes = Math.floor(Date.now() / 1000 / 60);

  //if (!meta.name) return null;
  return (
    <Box bg={bg} borderRadius="md" w={350} p={2}>
      {meta.content?.thumb?.url ? <img src={meta.content.thumb.url} /> : ""}

      <Stack spacing={0}>
        {/* {id ? (
          <Text fontSize="9px" sx={{ textTransform: "uppercase" }}>
            ID: <TID>{id}</TID>
          </Text>
        ) : null} */}
        {meta.pwr ? (
          <Text fontSize="9px" sx={{ textTransform: "uppercase" }}>
            Ops: {meta.pwr[0]} Storage: {meta.pwr[1]}
          </Text>
        ) : null}
        {meta.bearer ? (
          <Link to={"/address/0/" + meta.bearer}>
            <Text fontSize="9px" sx={{ textTransform: "uppercase" }}>
              Bearer: <ACC>{meta.bearer}</ACC>
            </Text>
          </Link>
        ) : null}
      </Stack>
    </Box>
  );
};
