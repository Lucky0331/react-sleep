import reqwest from 'reqwest';
import config from '../config/config.js';
// import axios from 'axios';

export default class ApiService {
  // url、参数、请求方式(默认post)、参数类型(默认json)
  static newPost(url, bodyObj = {}, type = 'post', isJson) {
    if (isJson) {
        // return axios({
        //     method: 'post',
        //     url: `${config.baseURL}${url}`,
        //     data: JSON.stringify(bodyObj),
        //     withCredentials: true,
        //     headers: {
        //         'Content-Type': 'application/json;charset=UTF-8'
        //     }
        // });
        return reqwest({
            url:`${config.baseURL}${url}`,
            method: type,
            contentType: 'application/json;charset=UTF-8',
            crossOrigin: true,
            withCredentials: true,
            data: JSON.stringify(bodyObj),
            type: 'json',
        });
    } else {
        return reqwest({
            url:`${config.baseURL}${url}`,
            method: type,
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
            crossOrigin: true,
            withCredentials: true,
            data: bodyObj,
        });
    }
  }
}
