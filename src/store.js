import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/user";
import nftReducer from "./reducers/nft";
import inventoryReducer from "./reducers/inventory";

import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

export default configureStore({
  reducer: {
    router: connectRouter(history),
    user: userReducer,
    nft: nftReducer,
    inventory: inventoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(routerMiddleware(history)),
});
