import React from "react";

import { Button, Box, Center, Stack } from "@chakra-ui/react";
import { UploadIcon } from "../icons";
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
        height={"120px"}
        {...props.button}
        onClick={() => {
          if (inputRef?.current) {
            inputRef.current.value = "";
            inputRef.current.click();
          }
        }}
      >
        <Stack spacing="3">
          <Box>
            <Center>
              <UploadIcon color="white" w={"56px"} h={"56px"} />
            </Center>
          </Box>
          <Box>{props.label || "Upload"}</Box>
        </Stack>
      </Button>
    </>
  );
};
