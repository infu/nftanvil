import ReactDOM from "react-dom";

import wheel_inner from "../assets/wheel_inner.svg";
import wheel_1 from "../assets/wheel_1.svg";
import wheel_2 from "../assets/wheel_2.svg";
import wheel_3 from "../assets/wheel_3.svg";
import wheel_shadow from "../assets/wheel_shadow.svg";

export function Wheel() {
  return ReactDOM.createPortal(
    <div className="wheel scale-in-center">
      <img src={wheel_shadow} className="wheel-shadow" />

      <img src={wheel_inner} className="wheel-inner" />
      <img src={wheel_1} className="wheel-1" />
      <img src={wheel_2} className="wheel-2" />
      <img src={wheel_3} className="wheel-3" />
    </div>,
    document.body
  );
}
