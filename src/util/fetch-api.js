import reqwest from 'reqwest';
import config from '../config/config.js';

export default class ApiService {
  // url、参数、请求方式(默认post)、参数类型(默认json)
  static newPost(url, bodyObj = {}, type = 'post', isJson) {
    if (isJson) {
        // return new Promise((res, req) => {
        //     $.ajax({
        //         url:`${config.baseURL}${url}`,
        //         type: 'POST',
        //         data: JSON.stringify(bodyObj),
        //         dataType: 'json',
        //         contentType: 'application/json;charset=UTF-8',
        //         crossOrigin: true,
        //         headers: {
        //           crossDomain: true,
        //         },
        //         xhrFields: {
        //             crossDomain: true,
        //             withCredentials: true
        //         },
        //         success: function(msg){
        //             res(msg);
        //         },
        //         error: function(msg) {
        //             req(msg);
        //         }
        //     });
        // });

        // return fetch(`${config.baseURL}${url}`,{
        //     method: 'POST',
        //     headers: {
        //         'Access-Control-Allow-Origin': '*',
        //         'Content-Type': 'application/json;charset=UTF-8',
        //     },
        //     mode: 'cors',
        //     body: JSON.stringify(bodyObj),
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
        console.log('到此：', url);
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
