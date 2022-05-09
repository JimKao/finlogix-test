import axios from "axios";

export const ApiAxios = {
    _create(url) {
        return axios.create({
            baseURL: url,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        })
    },
    post(url, req) {
        const instance = this._create(url);
        return instance.post(url, req);
    },
    get(url, req) {
        const instance = this._create(url);
        return instance.get(url, { params: req});
    },
    delete(url, req) {
        const instance = this._create(url);
        return instance.delete(url, { params: req});
    }
};
