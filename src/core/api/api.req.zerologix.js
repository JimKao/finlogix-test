const {ApiAxios} = require('./axios/api.axios');


const URL_BASE = "https://g1api.finlogix.com/v1";
const URL_GET_POST_LIST = [URL_BASE, "/post/analysis"].join('');
const URL_FAVOURITE_SERIES = [URL_BASE, "/me/user/favourite/post-analysis"].join('');
const URL_USER_LOGIN = [URL_BASE, "/auth/login/email"].join('');
const URL_USER_LOGOUT = [URL_BASE, "/me/user/logout"].join('');
const URL_USER_TOKEN = [URL_BASE, "/me/user/info"].join('');

export const GetPostList  = (req) => ApiAxios.get(URL_GET_POST_LIST, req);
export const PostOneFavourite  = (req) => ApiAxios.post(URL_FAVOURITE_SERIES, req);
export const DeleteOneFavourite  = (req) => ApiAxios.delete(URL_FAVOURITE_SERIES, req);
export const GetFavouriteList  = (req) => ApiAxios.get(URL_FAVOURITE_SERIES, req);
export const PostUserLogin  = (req) => ApiAxios.post(URL_USER_LOGIN, req);
export const PostUserLogout  = (req) => ApiAxios.post(URL_USER_LOGOUT, req);
export const GetUserToken = (req) => ApiAxios.get(URL_USER_TOKEN, req);