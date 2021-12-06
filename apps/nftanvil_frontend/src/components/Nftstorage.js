import React from "react";
import { saveNftStorageKey, setNftSotrageModal } from "../reducers/user";
import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/logo-nft.storage.svg";

import { Button } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalBody,
  FormLabel,
  Input,
  FormControl,
  ModalFooter,
  ModalContent,
  ModalHeader,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";

import { Formik, Field, Form } from "formik";

export const Nftstorage = () => {
  const initialRef = React.useRef();
  const open = useSelector((state) => state.user.modal_nftstorage);
  const key = useSelector((state) => state.user.key_nftstorage);
  const dispatch = useDispatch();

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={open !== false}
      onClose={() => {
        dispatch(setNftSotrageModal(false));
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <a rel="noreferrer" href="https://nft.storage" target="_blank">
            <img alt="NFT Storage" src={logo} />
          </a>
        </ModalHeader>

        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text mb={10}>
            In order to use IPFS you need to register and obtain API Key from{" "}
            <a
              style={{
                textDecoration: "underline",
                color: "#99F",
                fontWeight: "bold",
              }}
              rel="noreferrer"
              href="https://nft.storage"
              target="_blank"
            >
              NFT.Storage
            </a>
            .<br />
            You will get for <b>FREE IPFS</b> storage with FileCoin and cloud
            redundancy. Made by Protocol Labs.
          </Text>
          <NftstorageForm currentKey={key} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

function NftstorageForm({ currentKey }) {
  const dispatch = useDispatch();

  function validateKey(value) {
    let error;
    if (!value) {
      error = "Key is required";
    } else if (value.length < 10) {
      error = "Required";
    }
    return error;
  }

  return (
    <Formik
      initialValues={{ key: currentKey }}
      onSubmit={(values, actions) => {
        dispatch(saveNftStorageKey(values.key));
        dispatch(setNftSotrageModal(false));
      }}
    >
      {(props) => (
        <Form>
          <Field name="key" validate={validateKey}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.code && form.touched.code}>
                <FormLabel htmlFor="key">NFT Storage API key</FormLabel>
                <Input {...field} id="key" placeholder="key" />
                <FormErrorMessage>{form.errors.code}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Button
            mt={4}
            colorScheme="teal"
            isLoading={props.isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
}
