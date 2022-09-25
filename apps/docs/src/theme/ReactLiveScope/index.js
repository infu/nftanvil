import React from "react";
// Add react-live imports you need here
const Custom = () => {
  return <div>custom component</div>;
};

const ReactLiveScope = {
  React,
  ...React,
  Custom,
};
export default ReactLiveScope;
