import { Tooltip, Button } from "@chakra-ui/react";
import { WarningTwoIcon, CheckIcon } from "@chakra-ui/icons";
import {
  useAnvilSelector as useSelector,
  useAnvilDispatch as useDispatch,
} from "../index.js";

export const TaskButton = ({ children, task_id, ...p }) => {
  const task = useSelector((state) => state.task[task_id]);

  return (
    <Tooltip
      label={task?.result?.msg}
      placement="top"
      isOpen={task?.result?.msg ? true : false}
      bg={task?.result?.err ? "pink.600" : "green.600"}
      color={task?.result?.err ? "pink.100" : "green.100"}
      hasArrow={true}
    >
      <Button
        {...p}
        isLoading={!!task}
        spinner={
          task?.result ? (
            task.result.err ? (
              <WarningTwoIcon color="pink.300" />
            ) : (
              <CheckIcon color="green.300" />
            )
          ) : undefined
        }
      >
        {children}
      </Button>
    </Tooltip>
  );
};
