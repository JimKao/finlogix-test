import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Home} from "./component/home";
import {Login} from "./component/login";
import React from "react";

export function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/login" element={<Login/>}/>
        </Routes>
      </BrowserRouter>
    </React.Fragment>
    
) ;
};
