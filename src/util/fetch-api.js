import reqwest from "reqwest";
import config from "../config/config.js";
import { message } from "antd";
// import axios from 'axios';

export default class ApiService {
  // url、参数、请求方式(默认post)、参数类型(默认json)
  static newPost(url, bodyObj = {}, type = "post", isJson, dataTypeJson = true) {
    if (isJson) {
      return reqwest({
        url: `${config.baseURL}${url}`,
        method: type,
        contentType: "application/json;charset=UTF-8",
        crossOrigin: true,
        withCredentials: true,
        data: JSON.stringify(bodyObj),
        type: "json"
      }).then(res => {
        const msg = res.message || res.message || "";
        if (msg.indexOf("过期") >= 0) {
          sessionStorage.clear();
          message.error(msg);
          setTimeout(() => {
            location.href = "/";
          }, 1000);
        }
        return res;
      });
    } else {
      const params = {
        url: `${config.baseURL}${url}`,
        method: type,
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        crossOrigin: true,
        withCredentials: true,
        data: bodyObj,
      };

      if(dataTypeJson){
        params.type = 'json';
      }
      return reqwest(params).then(res => {
        console.log("RES:", res);
        const msg = res.message || res.message || "";
        if (msg.indexOf("过期") >= 0) {
          sessionStorage.clear();
          message.error(msg);
          setTimeout(() => {
            location.href = "/";
          }, 1000);
        }
        return res;
      });
    }
  }
}
