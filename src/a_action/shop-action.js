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
                dispatch({
                    type: 'SHOP::delProductModel',
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

// 上架或下架产品
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
//删除产品
export function removeProduct(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/product/remove', params, 'post', true
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::removeProduct',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

//添加服务站地区
export function addStationList(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/station/save', params, 'post', true
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

export function findAllProvince(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/area/findAllProvince', params, 'post', true
        ).then(
            msg => {
                if(msg.returnCode === '0') {
                    dispatch({
                        type: 'SYS::findAllProvince',
                        payload: msg.messsageBody,
                    });
                }
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

export function findCityOrCounty(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/area/findCityOrCounty', params,
        ).then(
            msg => {

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

//产品上线列表查询
export function findProductLine(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/station/query/online', params
        ).then(
            msg => {
                dispatch({
                    type: 'SHOP::findProductLine',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

//服务站上线添加
export function addProductLine(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/station/add/online', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}




