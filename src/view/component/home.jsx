import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
const Format = require('../../core/format/format');
const FieldApiStatusCode = require('../../field/field.api.status.code');
const FieldLocalstorageItemKey = require('../../field/field.localstorage.item.key');


const {GetPostList, PostUserLogout, GetUserToken} = require('../../core/api/api.req.zerologix');



const {ZerologixHeader} = require('./header/zerologix.header');
const {ZerologixTopicDesc} = require('./topic/zerologix.topic.desc');
const {ZerologixWebinarList} = require('./webinar/zerologix.webinar.list');
const {ZerologixFormReg} = require('./form/zerologix.form.reg')




export function Home() {
    const [isLogin, setIsLogin] = useState(false);
    const [postList, setPostList] = useState([]);
    const [selectCourseKey, setSelectCourseKey] = useState("");
    

    const RefUserToken = useRef("");

    const navigate = useNavigate();
    const dirToLoginForm = () =>{ 
      navigate('/login');
    }

    function _checkIsLogin(){
      const token = localStorage.getItem(FieldLocalstorageItemKey.USER_TOKEN);
      console.log(token);
      GetUserToken(
        {
          token: token
        }
      ).then(res => {
        if (
          res.status = FieldApiStatusCode.SUCCESS &&
          res.data.is_active === true
        ) {
          setIsLogin(true);
        } else {
          console.log(err.toString());
          setIsLogin(false);
        };
      }).catch(err => {
        console.log(err.toString());
        setIsLogin(false);
      });
      
    };

    const _parseCourseDate = (createdDate, n) => {
      var result = new Date(createdDate);
      result.setDate(result.getDate() + n);
      return Format.formatDate(result, 'yyyy-MM-dd HH:mm:ss');
  };

  const _parseCreatedDate = (createdDate) => {
    // "2022-05-08 17:44:37" => "08/05/2022"
    const dateList = createdDate.split(" ")[0].split("-");
    return [
        dateList[2], "/",
        dateList[1], "/",
        dateList[0]
    ].join("");
  };

    function clickLogout(e){
      e.stopPropagation();
      const token = RefUserToken.current;
      PostUserLogout(
        {
          token: token
        }
      ).then(res => {
          if (res.status = FieldApiStatusCode.SUCCESS) {
              localStorage.removeItem(FieldLocalstorageItemKey.USER_TOKEN);
              setIsLogin(false);
          };
      }).catch(err => {
        localStorage.removeItem(FieldLocalstorageItemKey.USER_TOKEN);
        setIsLogin(false);
      })
    }

    function genFilterPostList(postList){
      let retList = [];
      for (let i = 0; i < postList.length; i++){
        let item = postList[i];
        let key = [uuidv4(), "-", item.id].join("");
        retList.push(
          {
            key: key,
            id: item.id,
            title: item.title,
            createdDate: _parseCreatedDate(item.created_at),
            courseDate: _parseCourseDate(item.created_at, 10)
          }
        )
      };
      return retList;
    };

    useEffect(() => {
      _checkIsLogin();
    }, [])

    useEffect(() => {
      GetPostList(
        {per_page: 12, page: 1}
      ).then(res => {
          if (res.status = FieldApiStatusCode.SUCCESS) {
              const filterPostList = genFilterPostList(res.data.data);
              setPostList(filterPostList);
          };
      }).catch(err => {
        console.log(err.toString());
      })
    }, []);

    return (<div className='main-content'> 
        <ZerologixHeader 
          isLogin={isLogin} 
          clickLogout={clickLogout}
          dirToLoginForm={dirToLoginForm}
        />
        <ZerologixTopicDesc />
        <ZerologixWebinarList 
          isLogin={isLogin}
          postList={postList}
          content={"Market scan across FX & Gold to determine sentiment with accuracy."}
          setSelectCourseKey={setSelectCourseKey}
        />
        
        <ZerologixFormReg 
          isLogin={isLogin}
          selectCourseKey={selectCourseKey}
          postList={postList}
          token={RefUserToken.current}
          dirToLoginForm={dirToLoginForm}
        />
       
      </div>)
};
