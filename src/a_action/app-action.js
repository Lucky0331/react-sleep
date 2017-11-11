import _ from 'lodash';
import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 测试
export function onTestAdd(num) {
  return {
    type: 'TEST::add',
    payload: num + 1,
  };
}

// 用户登录
export function onLogin(params) {
    return (dispatch) => {
      return Fetchapi.newPost(
        '/admin/submitLogin', params, 'post', true
      ).then(
          msg => {
            dispatch({
              type: 'APP::LOGIN',
              payload: msg,
            });
            return msg;
          }
        ).catch(() => {
          message.error('网络错误，请重试');
        });
    };
}

// 路由切换状态保存
export function saveURL(url) {
  return {
    type: 'APP::saveURL',
    payload: url,
  };
}

// 根据菜单ID查询该菜单下有哪些按钮
export function findButtonsByMenuId(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/buttons/findButtonsByMenuId', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// promise测试
export function testPromise(params) {
  return (dispatch) => {
      return new Promise((resolve, reject) => {
        if (params) {
          resolve('success');
          dispatch({
              type: 'TEST::add',
              payload: 10000,
            });
        } else {
          reject('error');
        }
      }).then((msg)=>{
          console.log('Promise中得到数据：', msg);
      });
    };
}