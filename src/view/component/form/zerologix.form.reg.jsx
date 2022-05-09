import React, {useState, useRef} from 'react';

const {PostOneFavourite} = require('../../../core/api/api.req.zerologix');
const FieldValidFormRegCol = require('../../../field/field.valid.form.reg.col');

export function ZerologixFormReg({
    isLogin,
    token, 
    postList, 
    selectCourseKey,
    dirToLoginForm
}){

    const [regMsg, setRegMsg] = useState("");
    const [msgValidFirstName, setMsgValidFirstName] = useState("");
    const [msgValidLastName, setMsgValidLastName] = useState("");
    const [msgValidEmail, setMsgValidEmail] = useState("");
    const [isSubmitBtnUse, setIsSubmitBtnUse] = useState(false);

    const RefIsFirstNameAlreadyUse = useRef(false);
    const RefIsLastNameAlreadyUse = useRef(false);
    const RefIsEmailAlreadyUse = useRef(false);

    const RefFirstName = useRef("");
    const RefLastName = useRef("");
    const RefEmail = useRef("");

    
    const execReg = (e, isLogin) => {
        if (!isLogin){
            dirToLoginForm();
        };
        e.stopPropagation();
        PostOneFavourite(
          {
            token: token
          }
        ).then(res => {
            if (res.status = FieldApiStatusCode.SUCCESS) {
                setRegMsg("REGISTER SUCCESS");
            };
        }).catch(err => {
            setRegMsg("REGISTER FAIL");
        })
    }

    const _validEmail = (email) => {
        console.log(email.toString().includes("@"));
        return email.toString().includes("@") && String(email)
              .toLowerCase()
              .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
    }

    function _validCol(key){
        key === FieldValidFormRegCol.FIRST_NAME && (RefIsFirstNameAlreadyUse.current = true);
        key === FieldValidFormRegCol.LAST_NAME &&  (RefIsLastNameAlreadyUse.current = true);
        key === FieldValidFormRegCol.EMAIL && (RefIsEmailAlreadyUse.current = true);
        const passList = [
            _validColText(RefFirstName.current.value, setMsgValidFirstName, RefIsFirstNameAlreadyUse.current ),
            _validColText(RefLastName.current.value, setMsgValidLastName, RefIsLastNameAlreadyUse.current),
            _validColEmail(RefEmail.current.value, setMsgValidEmail, RefIsEmailAlreadyUse.current)
        ];
        const isAllPass = !passList.includes(false);
        console.log("passList: ", passList);
        console.log("isAllPass: ", isAllPass);
        setIsSubmitBtnUse(isAllPass);
    }
    
    
    function _validColText(refVal, setFunc, isUsed){
        if (!isUsed){
            return false;
        };

        if (refVal === ""){
            setFunc("(EMPTY NOT ALLOW)");
            return false;
        };
        setFunc("");
        return true;

    }

    function _validColEmail(refVal, setFunc, isUsed){
        if (!isUsed){
            return false;
        };

        if (refVal === ""){
            setFunc("(EMPTY NOT ALLOW)");
            return false;
        } else if (!_validEmail(refVal)){
            setFunc("(EMAIL FORMAT WRONG)");
            return false;
        };
        setFunc("");
        return true;
    };

    return (
        <div className='form-reg-container'>
            <div className='form-reg-title'>Register for a Webinar now</div>
            <div className='form-reg-desc'>
                Please fill in the form below and you will be contacted 
                by one of our professional business experts.
            </div>
            <label>Topic</label>
            <select className="form-reg-col">
                {
                    postList.map((item) => {
                        return (
                            selectCourseKey === item. key ?
                                <option key={item.key} value={item.key} selected>{item.courseDate.split(" ")[0]} ({item.title})</option>:
                                <option key={item.key} value={item.key}>{item.courseDate.split(" ")[0]} ({item.title})</option>
                        )
                    })
                }
            </select>
            <label>First Name</label>
            <span className='form-reg-err-msg'> {msgValidFirstName}</span>
            <input className="form-reg-col" ref={RefFirstName}  onChange={() => _validCol(FieldValidFormRegCol.FIRST_NAME)} type="text"  placeholder="First Name" required/>
            <label>Last Name</label>
            <span className='form-reg-err-msg'> {msgValidLastName}</span>
            <input className="form-reg-col" ref={RefLastName}  onChange={() => _validCol(FieldValidFormRegCol.LAST_NAME)}  type="text"  placeholder="Last Name" required/>
            <label>Email</label>
            <span className='form-reg-err-msg'> {msgValidEmail}</span>
            <input className="form-reg-col" ref={RefEmail}  onChange={() => _validCol(FieldValidFormRegCol.EMAIL)} type="email"  placeholder="Email" required/>
            {

                isSubmitBtnUse ? <input className="form-reg-submit" type="submit" value="Register" onClick={ (e) => execReg(e, isLogin)}/> :
                <input className="form-reg-submit disable-btn" type="submit" value="Register"/>
            }
            <div className='form-reg-result-msg'>{regMsg}</div>
            
        </div>
    )
};