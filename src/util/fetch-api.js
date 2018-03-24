import reqwest from 'reqwest';
import config from '../config/config.js';
import { message } from 'antd';
// import axios from 'axios';

export default class ApiService {
  // url、参数、请求方式(默认post)、参数类型(默认json)
  static newPost(url, bodyObj = {}, type = 'post', isJson) {
    if (isJson) {
        // axios({
        //     method: 'get',
        //     url: `https://api.github.com/emojis`,
        //     data: JSON.stringify(bodyObj),
        //     // withCredentials: true,
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
        }).then((res) => {
            const msg = res.returnMessaage || res.message || '';
            if(msg.indexOf('过期')>=0){
                sessionStorage.clear();
                message.error(msg);
                setTimeout(() => {location.href = '/';}, 1000);
            }
            return res;
        });
    } else {
        return reqwest({
            url:`${config.baseURL}${url}`,
            method: type,
            contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
            crossOrigin: true,
            withCredentials: true,
            data: bodyObj,
        }).then((res) => {
            const msg = res.returnMessaage || res.message || '';
            if(msg.indexOf('过期')>=0){
                sessionStorage.clear();
                message.error(msg);
                setTimeout(() => {location.href = '/';}, 1000);
            }
            return res;
        });
    }
  }
}
