/**
 * 商城管理模块actions
 * */
import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 条件查询产品类型(查询所有)
export function findProductTypeByWhere(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productType/list', params
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
            '/manager/productType/save', params, 'post', true
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
            '/manager/productType/update', params, 'post', true
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
            '/manager/productType/delete', params, 'post', true
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

// 查询产品型号
export function findProductModelByWhere(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productModel/list', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加新产品型号
export function addProductModel(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productModel/save', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改产品型号
export function upProductModel(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productModel/update', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除产品型号
export function delProductModel(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productModel/delete', params, 'post', true
        ).then(
            msg => {
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
            '/manager/product/list', params
        ).then(
            msg => {
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
            '/manager/product/save', params, 'post', true
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
            '/manager/product/update', params, 'post', true
        ).then(
            msg => {
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
            '/manager/product/delete', params, 'post', true
        ).then(
            msg => {
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
            '/manager/order/list', params
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
            '/manager/order/update', params
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

// 条件查询体检列表
export function findReserveList(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/reserve/list', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加预约体检
export function addReserveList(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/reserve/save', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改预约体检
export function upReserveList(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/reserve/update', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

