import logo from "./logo.svg";
import "./App.css";

import { useSelector, useDispatch } from "react-redux";
import {  login,logout } from "./reducers/user";

function LoginBox() {
  const address = useSelector((state) => state.user.address);
  const anonymous = useSelector((state) => state.user.anonymous);

  const dispatch = useDispatch();

  return <div className="A">
    {anonymous?(
      <>
      not logged
      <button onClick={() => dispatch(login())}>Authenticate</button>
      </>
    ):(<>
    {address}
    <button onClick={() => dispatch(logout())}>Logout</button>
    </>)}
  </div>
}

function App() {
 

  return (
    <div className="App">
      <header className="App-header">
     
        <LoginBox />
       
      </header>
    </div>
  );
}

export default App;
