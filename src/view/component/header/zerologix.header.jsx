import React from 'react';


export function ZerologixHeader({
    isLogin, clickLogout, dirToLoginForm
}) {

    return (
        <div className='header-container'> 
            <div className='logo-acy'></div>
                
            <div className='header-btn-container'>
                {
                    isLogin ? 
                    <React.Fragment>
                        <button className='webinar-btn'>My Webinar</button>
                        <button className='auth-btn' onClick={clickLogout}>loginout</button>
                    </React.Fragment> :
                    <React.Fragment>
                        <button className='auth-btn' onClick={dirToLoginForm}>login</button>
                    </React.Fragment>
                    
                }
            </div>
        </div>
    )
};
