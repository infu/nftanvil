import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/user";
import nftReducer from "./reducers/nft";
import inventoryReducer from "./reducers/inventory";
import historyReducer from "./reducers/history";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    user: userReducer,
    nft: nftReducer,
    history: historyReducer,
    inventory: inventoryReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(routerMiddleware(history)),
});
