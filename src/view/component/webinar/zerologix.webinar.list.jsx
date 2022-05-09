import React, {useState, useRef} from 'react';
const {ZerologixWebinarCard} = require('./zerologix.webinar.card');



export function ZerologixWebinarList({isLogin, postList, content, setSelectCourseKey}){

    const _getMultRowListByColumnNum = (arr, n) => {
        let multRowList = [];
        let row = [];
        for (let i = 0; i < arr.length; i++){
            let data = arr[i];
            if (row.length === n){
                multRowList.push(row);
                row = [];
            };
            if (row.length < n && !data.favourited){
                row.push(data);
            };
        };
        return multRowList;
    };
    return (
        <div className='webinar-ticket-container'>
            {
                _getMultRowListByColumnNum(postList, 3).map((row) => {
                    return (
                        <div className='webinar-ticket-row-container'>
                            {
                                row.map((item) => {
                                    return (
                                        <ZerologixWebinarCard 
                                            setSelectCourseKey={setSelectCourseKey}
                                            cardKey={item.key}
                                            isLogin={isLogin}
                                            createdDate={item.createdDate}
                                            title={item.title}
                                            courseDate={item.courseDate}
                                            content={content}
                                        />
                                    )
                                    
                                })
                            }
                        </div>
                    )
                })
            }
        </div>
        
        
    )
};