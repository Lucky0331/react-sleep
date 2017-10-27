import reqwest from 'reqwest';
import config from '../config/config.js';
import $ from 'jquery';
export default class ApiService {
  // url、参数、请求方式(默认post)、参数类型(默认json)
  static newPost(url, bodyObj = {}, type = 'post', isJson) {
    if (isJson) {
        return reqwest({
            url:`${config.baseURL}${url}`,
            method: type,
            contentType: 'application/json;charset=utf-8',
            crossOrigin: true,
            data: JSON.stringify(bodyObj),
            dataType: 'json',
        });
    } else {
        return reqwest({
            url:`${config.baseURL}${url}`,
            method: type,
            contentType: false,
            crossOrigin: true,
            data: bodyObj,
        });
    }
  }
}
