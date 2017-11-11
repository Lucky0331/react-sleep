import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 根据条件查询登录日志
export function findLoginLogBykeys(params) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/loginLog/findLoginLogBykeys', params,
        ).then(
            msg => {
                dispatch({
                    type: 'LOG::findLoginLogBykeys',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}