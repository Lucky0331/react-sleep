import reqwest from 'reqwest';
import config from '../config/config.js';

export default class ApiService {
  static newPost(url, bodyObj = {}, type = 'post') {
    return reqwest({
      url:`${config.baseURL}${url}`,
      method: type,
      contentType: 'application/json',
      crossOrigin: true,
      data: bodyObj,
      dataType: 'json',
    });
  }
}
