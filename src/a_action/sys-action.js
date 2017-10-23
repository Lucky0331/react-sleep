import _ from 'lodash';
import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 查询所有菜单
export function findAllMenu() {
    return (dispatch) => {
      return Fetchapi.newPost(
        '/menu/findAllMenu', null
      ).then(
          msg => {
            console.log('返回数据', msg);
            dispatch({
              type: 'SYS::findAllMenu',
              payload: msg,
            });
            return msg;
          }
        ).catch(() => {
          message.error('网络错误，请重试');
        });
    };
}

// 查询所有用户
export function findAll() {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/user/findAll', null
        ).then(
            msg => {
                console.log('返回数据', msg);
                dispatch({
                    type: 'SYS::findAll',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}