import React from "react";

export const MyComponent = () => {
  return <div>fun component </div>;
};

// import React from "react";
// import {
//   Provider,
//   createStoreHook,
//   createDispatchHook,
//   createSelectorHook,
// } from "react-redux";

// const MyContext = React.createContext(null);

// // Export your custom hooks if you wish to use them in other files.
// export const useStore = createStoreHook(MyContext);
// export const useDispatch = createDispatchHook(MyContext);
// export const useSelector = createSelectorHook(MyContext);

// const myStore = createStore(rootReducer);

// export function MyProvider({ children }) {
//   return (
//     <Provider context={MyContext} store={myStore}>
//       {children}
//     </Provider>
//   );
// }
