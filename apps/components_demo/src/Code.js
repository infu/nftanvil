import { CodeBlock, dracula } from "react-code-blocks";
import { Box, Center } from "@chakra-ui/react";

export function Code({ code }) {
  return (
    <Center>
      <Box w={"650px"}>
        <CodeBlock
          text={code}
          language={"jsx"}
          showLineNumbers={false}
          theme={dracula}
        />
      </Box>
    </Center>
  );
}
