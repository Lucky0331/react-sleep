import Fetchapi from '../util/fetch-api';
import { message } from 'antd';


//代言卡列表查询
export function Cardlist(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productSpeakCard/list', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
};

//删除代言卡
export function deleteCard (params = {}) {
    return (dispatch) =>{
        return Fetchapi.newPost(
            '/manager/productSpeakCard/delete',params,'post',true
        ).then(
            msg => {
                return msg;
            }
        ).catch(()=>{
            message.error('网络错误，请重试')
        })
    }
}

//添加代言卡
export function addCard(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productSpeakCard/save',params,'post',true
        ).then(
            msg => {
                return msg;
            }
        ).catch(()=>{
            message.error('网络错误，请重试')
        })
    }
}

//修改代言卡
export function UpdateCard(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productSpeakCard/update',params,'post',true
        ).then(
            msg => {
                return msg;
            }
        ).catch(()=>{
            message.error('网络错误，请重试')
        })
    }
}

//发布或取消发布代言卡
export function UpdateOnline(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/productSpeakCard/remove',params
        ).then(
            msg => {
                return msg;
            }
        ).catch(()=>{
            message.error('网络错误，请重试')
        })
    }
}