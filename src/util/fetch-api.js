import reqwest from 'reqwest';
import config from '../config/config.js';

export default class ApiService {
  static newPost(url, bodyObj = {}) {
    console.log('URL:', config.baseURL);
    return reqwest({
      url:`${config.baseURL}${url}`,
      method: 'post',
      contentType: 'application/json',
      crossOrigin: true,
      data: JSON.stringify(bodyObj),
      dataType: 'json',
    });
  }
}
