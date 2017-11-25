/**
 * 商城管理模块actions
 * */
import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 条件查询产品类型(查询所有)
export function findProductTypeByWhere(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/findProductTypeByWhere', params
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
            '/manager/addProductType', params, 'post', true
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::addProductType',
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
            '/manager/updateProductType', params, 'post', true
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
            '/manager/deleteProductType', params, 'post', true
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

// 查询产品列表
export function findProductByWhere(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/findProductByWhere', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::findProductByWhere',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加新产品
export function addProduct(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/addProduct', params, 'post', true
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::addProduct',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改产品
export function updateProduct(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/updateProduct', params, 'post', true
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::updateProduct',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除产品
export function deleteProduct(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/deleteProduct', params, 'post', true
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::deleteProduct',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 条件查询订单
export function findOrderByWhere(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/findOrderByWhere', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::findOrderByWhere',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改订单状态
export function updateOrder(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/updateOrder', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::updateOrder',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除商品的图片

export function deleteImage(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/deleteImage', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

