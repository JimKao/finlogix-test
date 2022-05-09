import React from 'react';

export function ZerologixWebinarCard({
    cardKey,
    createdDate,   
    title, 
    content,
    courseDate,
    setSelectCourseKey
}){
    const _handleRegScroll = (e, key)=> {
        e.stopPropagation();
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth"
        });
        setSelectCourseKey(key);
    };

    return (
        <div key={cardKey} className='webinar-card-container'>
            <div className='webinar-card-create-date'>{createdDate}</div>
            <div className='webinar-card-title'>{title}</div>
            <div className='webinar-card-content'>{content}</div>
            <div className='webinar-card-course-date'>{courseDate}</div>
            
            <div className='webinar-card-register-container' onClick={(e) => {_handleRegScroll(e, cardKey)}}>
                <div>Register Now</div>
                <div className='reg-sign'>{">"}</div>
            </div>
        </div>
    )
};