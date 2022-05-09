import axios from "axios";

export const ApiAxios = {
    _create(url, method) {
        return axios.create({
            baseURL: url,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },
    get(url, req, successCallback, failCallback) {
        const instance = this._create(url, method);
        instance.get(req)
        .then(response => {
            console.log(response);
            successCallback();
        })
        .catch(e => {
            failCallback();
        });
    },
    post(url, req, successCallback, failCallback) {
        const instance = this._create(url);
        instance.post(req)
        .then(response => {
            successCallback();
        })
        .catch(e => {
            failCallback();
        });
    },
    delete(url, req, successCallback, failCallback) {
        const instance = this._create(url);
        instance.post(req)
        .then(response => {
            successCallback();
        })
        .catch(e => {
            failCallback();
        });
    },

};
