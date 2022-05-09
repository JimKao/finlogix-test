import React, {useState, useRef} from 'react';
import {useNavigate} from "react-router-dom"
const {PostUserLogin} = require('../../core/api/api.req.zerologix');
const FieldApiStatusCode = require('../../field/field.api.status.code');
const FieldLocalstorageItemKey = require('../../field/field.localstorage.item.key');
  
export const Login = () => {
  const [msg, setMsg] = useState('');
  const RefAccount = useRef("");
  const RefPassword = useRef("");

  const navigate = useNavigate();

  const execLogin = (e) => {
    e.stopPropagation();
    PostUserLogin(
      {
        email: RefAccount.current.value,
        password: RefPassword.current.value
      }
    ).then(res => {
      if (res.status = FieldApiStatusCode.SUCCESS) {
        console.log(res);
        localStorage.setItem(FieldLocalstorageItemKey.USER_TOKEN, res.data.auth.access_token);
        navigate("/");
      } else {
        setMsg("login FAIL!");
      };
    }).catch(err => {
      console.log(err.toString());
      setMsg("login FAIL!");
    })
  };
  
  return (
    <React.Fragment>
      <div className='login-form'>
        <label>Email</label>
        <input className="login-form-col" ref={RefAccount} type="email"  placeholder="email" required/>

        <label>Password</label>
        <input className="login-form-col" ref={RefPassword}  placeholder="password" required/>
      
        <input type="submit" value="Submit" onClick={execLogin}/>
      </div>
      {
        msg.length > 0 ? <div className='login-form-col login-form-msg'>{msg}</div> : null
      }
    </React.Fragment>
  )
};