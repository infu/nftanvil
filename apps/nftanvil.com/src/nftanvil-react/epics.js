import { filter, delay, switchMap, interval, timer, map } from "rxjs";
import { ofType } from "redux-observable";

import { focused, blurred } from "./reducers/ui";
import { task_start, task_end, task_clear } from "./reducers/task";

export const taskEpic = (action$) =>
  action$.pipe(
    //filter((action) => action.type === "game/PING"),
    ofType(task_end.type),
    // switchMap(() =>
    //   interval(1000).pipe(
    //     map((time) => task_clear({ task_id: action$.task_id }))
    //   )
    // )
    delay(3000), // Asynchronously wait 1000ms then continue

    map(({ payload }) => {
      return task_clear({ task_id: payload.task_id });
    })
  );

export const activeEpics = [taskEpic];
