import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 条件查询产品类型(查询所有)
export function findProductTypeByWhere(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/mall/findProductTypeByWhere', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::findProductTypeByWhere',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加产品类型
export function addProductType(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/mall/updateProductType', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::adddateProductType',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改产品类型
export function updateProductType(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/mall/updateProductType', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::updateProductType',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除产品类型
export function deleteProductType(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/mall/deleteProductType', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::deleteProductType',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

