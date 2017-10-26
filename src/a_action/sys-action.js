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

// 查询所有用户（内部用户）
export function findAll(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/user/findAll', params
        ).then(
            msg => {
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

// 添加用户（内部用户）
export function addAdminUserInfo(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/user/addAdminUserInfo', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::addAdminUserInfo',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除用户（内部用户）
export function deleteAdminUserInfo(params) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/user/deleteAdminUserInfo', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::deleteAdminUserInfo',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改用户（内部用户）
export function updateAdminUserInfo(params) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/user/updateAdminUserInfo', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::updateAdminUserInfo',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 获取所有角色
export function findAllRole() {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/findAllRole', {}
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::findAllRole',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加角色
export function addRoleInfo(params) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/addRoleInfo', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::addRoleInfo',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改角色
export function updateRoleInfo(params) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/updateRoleInfo', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::updateRoleInfo',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除角色
export function deleteRoleInfo(params) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/deleteRoleInfo', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::deleteRoleInfo',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 给用户分配角色
export function assigningRole() {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/AssigningRole', {}
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::assigningRole',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 根据用户ID查询当前用户所拥有的角色
export function findAllRoleByUserId(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/findAllRoleByUserId', Object.assign({}, params, {
                pageNum: 0,
                pageSize: 100,
            })
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::findAllRoleByUserId',
                    payload: msg,
                });
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加菜单
export function addMenuInfo(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/addMenuInfo', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改菜单
export function updateMenuInfo(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/updateMenuInfo', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除菜单
export function deleteMenuInfo(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/deleteMenuInfo', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 根据角色ID查询当前角色所分配的菜单
export function findAllMenuByRoleId(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/findAllMenuByRoleId', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 根据用户名或状态查询指定用户
export function findAdminUserByKeys(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/user/findAdminUserByKeys', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}


