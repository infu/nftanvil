import React, { useEffect, useState } from "react";

export const ButtonModal = ({ name, children }) => {
  const [visibility, setVisibility] = React.useState(false);

  return (
    <>
      <button
        onClick={() => {
          setVisibility(true);
        }}
      >
        {name}
      </button>
      {visibility ? (
        <div
          className="modal"
          onClick={() => {
            setVisibility(false);
          }}
        >
          <div
            className="modal-body"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {children({ setVisibility })}
          </div>
        </div>
      ) : null}
    </>
  );
};
