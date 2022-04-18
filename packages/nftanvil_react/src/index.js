import React from "react";
import { configureStore } from "@reduxjs/toolkit";

import inventoryReducer, {
  load_inventory,
  verify_domain,
} from "./reducers/inventory";

import userReducer, {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_pwr_transfer,
  window_focus,
  window_blur,
} from "./reducers/user";

import nftReducer, {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  // nft_purchase_intent,
  nft_transfer,
  nft_plug,
  nft_unsocket,
  nft_recharge,
  nft_burn,
  nft_approve,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_enter_code,
  nft_recharge_quote,
} from "./reducers/nft";

export { load_inventory, verify_domain };

export {
  user_auth,
  user_login,
  user_logout,
  user_refresh_balances,
  user_refresh_config,
  user_transfer_icp,
  user_pwr_transfer,
};

export {
  nft_fetch,
  nft_media_get,
  nft_purchase,
  // nft_purchase_intent,
  nft_transfer,
  nft_plug,
  nft_unsocket,
  nft_recharge,
  nft_burn,
  nft_approve,
  nft_use,
  nft_transfer_link,
  nft_claim_link,
  nft_enter_code,
  nft_recharge_quote,
};
export const TestAnvilComponent = () => {
  return <div>fun component sweet 123 123 123</div>;
};

import {
  Provider,
  createStoreHook,
  createDispatchHook,
  createSelectorHook,
} from "react-redux";

const MyContext = React.createContext(null);

// Export your custom hooks if you wish to use them in other files.
export const useAnvilStore = createStoreHook(MyContext);
export const useAnvilDispatch = createDispatchHook(MyContext);
export const useAnvilSelector = createSelectorHook(MyContext);

const myStore = configureStore({
  // devTools: { name: "Anvil" },
  reducer: {
    user: userReducer,
    nft: nftReducer,
    inventory: inventoryReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export function AnvilProvider({ children }) {
  return (
    <Provider context={MyContext} store={myStore}>
      {children}
    </Provider>
  );
}

// Extra

setTimeout(() => {
  myStore.dispatch(user_auth());
}, 100);

if (typeof window !== "undefined") {
  window.addEventListener("focus", () => myStore.dispatch(window_focus()));
  window.addEventListener("blur", () => myStore.dispatch(window_blur()));
}
