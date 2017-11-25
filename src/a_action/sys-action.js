/* 系统管理action */
import Fetchapi from '../util/fetch-api';
import { message } from 'antd';

// 查询所有菜单
export function findAllMenu() {
    return (dispatch) => {
      return Fetchapi.newPost(
        '/menu/findAllMenu', {pageNum: 0, pageSize: 9999}
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
            '/user/findAll', params, 'post'
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
            '/user/addAdminUserInfo', params, 'post', true
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
            '/user/updateAdminUserInfo', params, 'post', true
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
            '/role/findAllRole', {pageNum: 0, pageSize: 9999}
        ).then(
            msg => {
                if (msg.returnCode === "0") {
                    dispatch({
                        type: 'SYS::findAllRole',
                        payload: msg.messsageBody.result,
                    });
                }
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
            '/role/addRoleInfo', params, 'post', true
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
            '/role/updateRoleInfo', params, 'post', true
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
            '/role/deleteRoleInfo', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 给用户分配角色
export function assigningRole(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/AssigningRole', params
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

// 给角色分配菜单
export function AssigningMenuToRoleId(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/AssigningMenuToRole', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::AssigningMenuToRoleId',
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
                pageSize: 9999,
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

// 条件查询角色，可用于角色列表
export function findRolesByKeys(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/role/findRolesByKeys', params
        ).then(
            msg => {
                dispatch({
                    type: 'SYS::findRolesByKeys',
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
            '/menu/addMenuInfo', params, 'post', true
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
            '/menu/updateMenuInfo', params, 'post', true
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
            '/menu/findAllMenuByRoleId', Object.assign({}, params, {
                pageNum: 0,
                pageSize: 9999,
            })
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

// 根据菜单名或状态查询指定菜单
export function findMenusByKeys(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/findMenusByKeys', Object.assign({}, params, {
                pageNum: 1,
                pageSize: 9999,
            })
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 根据菜单名或状态查询指定菜单
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

// 添加菜单权限
export function addButtons(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/buttons/addButtons', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改菜单权限
export function updateButtons(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/buttons/updateButtons', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除菜单权限
export function deleteButtons(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/buttons/deleteButtons', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 通过菜单id查该菜单的子菜单
export function findMenuByMainMenu(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/menu/findMenuByMainMenu', params
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 根据条件查询组织机构（其实这里就是查询所有的组织机构）
export function findAllOrganizer() {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/organization/list', {pageNum: 1, pageSize: 9999}
        ).then(
            msg => {
                if(msg.returnCode === '0') {
                    dispatch({
                        type: 'SYS::findAllOrganizer',
                        payload: msg.messsageBody.result,
                    });
                }
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 根据id查询子级组织
export function findOrganizerByParentId(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/organizer/findOrganizerByParentId', params,
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 添加组织机构
export function addOrganizer(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/organization/save', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 修改组织机构
export function updateOrganizer(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/organization/update', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}

// 删除组织机构
export function deleteOrganizer(params = {}) {
    return (dispatch) => {
        return Fetchapi.newPost(
            '/manager/organization/delete', params, 'post', true
        ).then(
            msg => {
                return msg;
            }
        ).catch(() => {
            message.error('网络错误，请重试');
        });
    };
}


