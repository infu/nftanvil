import React from "react";

import {
  ButtonGroup,
  Button,
  Box,
  Spinner,
  toast,
  useToast,
  IconButton,
} from "@chakra-ui/react";

export const FileInput = (props) => {
  const inputRef = React.createRef();
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept={props.accept}
        style={{ display: "none" }}
        multiple={false}
        onChange={(ev) => {
          let { size, type } = ev.target.files[0];
          let url = URL.createObjectURL(ev.target.files[0]);
          props.onChange({ size, type, url });
        }}
      />
      <Button
        {...props.button}
        onClick={() => {
          if (inputRef?.current) {
            inputRef.current.value = "";
            inputRef.current.click();
          }
        }}
      >
        {props.label || "Upload"}
      </Button>
    </>
  );
};
