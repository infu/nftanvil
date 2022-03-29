import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { auth, login, logout } from "./reducers/user";
export { login, logout };

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
  },
});

setTimeout(() => {
  myStore.dispatch(auth());
}, 100);

export function AnvilProvider({ children }) {
  return (
    <Provider context={MyContext} store={myStore}>
      {children}
    </Provider>
  );
}
