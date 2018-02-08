/**
 * 各种不知道该放到哪里好的actions
 * */
import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 分页条件查询总部收入列表
export function getSupplierIncomeList(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/capital/supplierIncome/list', params,
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 分页条件查询服务站收入列表
export function getStationIncomeList(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/capital/stationIncome/list', params,
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 查询公司的总收益 以及 订单的总金额
export function getSupplierIncomeMain(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/capital/supplierIncome/main', params,
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 查询公司的总收益 以及 订单的总金额
export function searchCompanyIncome(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/capital/companyIncome/main', params,
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}