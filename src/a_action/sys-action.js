/* 系统管理action */
import Fetchapi from "../util/fetch-api";
import { message } from "antd";

// 查询所有菜单
export function findAllMenu() {
  return dispatch => {
    return Fetchapi.newPost("/manager/menu/findAllMenu", {
      pageNum: 0,
      pageSize: 9999
    })
      .then(msg => {
        dispatch({
          type: "SYS::findAllMenu",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查找所有的按钮权限的列表
export function submitLogin(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/submitLogin",
      Object.assign({}, params, {})
    )
      .then(msg => {
        dispatch({
          type: "SYS::submitLogin",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 条件查询产品类型(查询所有)
export function findProductTypeByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productType/list", params)
      .then(msg => {
        dispatch({
          type: "SHOP::findProductTypeByWhere",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询所有用户（内部用户）
export function findAll(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/user/findAll", params, "post")
      .then(msg => {
        dispatch({
          type: "SYS::findAll",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加用户（内部用户）
export function addAdminUserInfo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/user/addAdminUserInfo",
      params,
      "post",
      true
    )
      .then(msg => {
        dispatch({
          type: "SYS::addAdminUserInfo",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除用户（内部用户）
export function deleteAdminUserInfo(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/user/deleteAdminUserInfo", params)
      .then(msg => {
        dispatch({
          type: "SYS::deleteAdminUserInfo",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改用户（内部用户）
export function updateAdminUserInfo(params) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/user/updateAdminUserInfo",
      params,
      "post",
      true
    )
      .then(msg => {
        dispatch({
          type: "SYS::updateAdminUserInfo",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 获取所有角色
export function findAllRole() {
  return dispatch => {
    return Fetchapi.newPost("/manager/role/findAllRole", {
      pageNum: 0,
      pageSize: 9999
    })
      .then(msg => {
        if (msg.status === "0") {
          dispatch({
            type: "SYS::findAllRole",
            payload: msg.data.result
          });
        }
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加角色
export function addRoleInfo(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/role/addRoleInfo", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SYS::addRoleInfo",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改角色
export function updateRoleInfo(params) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/role/updateRoleInfo",
      params,
      "post",
      true
    )
      .then(msg => {
        dispatch({
          type: "SYS::updateRoleInfo",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除角色
export function deleteRoleInfo(params) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/role/deleteRoleInfo",
      params,
      "post",
      true
    )
      .then(msg => {
        dispatch({
          type: "SYS::deleteRoleInfo",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 给用户分配角色
export function assigningRole(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/role/AssigningRole", params)
      .then(msg => {
        dispatch({
          type: "SYS::assigningRole",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 给角色分配菜单
export function AssigningMenuToRoleId(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/menu/AssigningMenuToRole", params)
      .then(msg => {
        dispatch({
          type: "SYS::AssigningMenuToRoleId",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据用户ID查询当前用户所拥有的角色
export function findAllRoleByUserId(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/role/findAllRoleByUserId",
      Object.assign({}, params, {
        pageNum: 0,
        pageSize: 9999
      })
    )
      .then(msg => {
        dispatch({
          type: "SYS::findAllRoleByUserId",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 条件查询角色，可用于角色列表
export function findRolesByKeys(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/role/findRolesByKeys", params)
      .then(msg => {
        dispatch({
          type: "SYS::findRolesByKeys",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加菜单
export function addMenuInfo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/menu/addMenuInfo", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改菜单
export function updateMenuInfo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/menu/updateMenuInfo",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除菜单
export function deleteMenuInfo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/menu/deleteMenuInfo", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据角色ID查询当前角色所分配的菜单
export function findAllMenuByRoleId(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/menu/findAllMenuByRoleId",
      Object.assign({}, params, {
        pageNum: 0,
        pageSize: 9999
      })
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据用户名或状态查询指定用户
export function findAdminUserByKeys(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/user/findAdminUserByKeys", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据菜单名或状态查询指定菜单
export function findMenusByKeys(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/menu/findMenusByKeys",
      Object.assign({}, params, {
        pageNum: 1,
        pageSize: 9999
      })
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据菜单名或状态查询指定菜单
export function findButtonsByMenuId(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/buttons/findButtonsByMenuId", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加菜单权限
export function addButtons(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/buttons/addButtons", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改菜单权限
export function updateButtons(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/buttons/updateButtons",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除菜单权限
export function deleteButtons(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/buttons/deleteButtons", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 通过菜单id查该菜单的子菜单
export function findMenuByMainMenu(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/menu/findMenuByMainMenu", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据条件查询组织机构（其实这里就是查询所有的组织机构）
export function findAllOrganizer() {
  return dispatch => {
    return Fetchapi.newPost("/manager/dictionary/listByDicType", {
      pageNum: 1,
      pageSize: 9999,
      dicType: "orgType"
    })
      .then(msg => {
        if (msg.status === "0") {
          dispatch({
            type: "SYS::findAllOrganizer",
            payload: msg.data.result
          });
        }
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 根据id查询子级组织
export function findOrganizerByParentId(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/organizer/findOrganizerByParentId",
      params
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加组织机构
export function addOrganizer(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/organization/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改组织机构
export function updateOrganizer(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/organization/update",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除组织机构
export function deleteOrganizer(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/organization/delete",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询所有省
export function findAllProvince(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/area/findAllProvince",
      params,
      "post",
      true
    )
      .then(msg => {
        if (msg.status === "0") {
          dispatch({
            type: "SYS::findAllProvince",
            payload: msg.data
          });
        }
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询所有市区
export function findCityOrCounty(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/area/findCityOrCounty", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询服务站列表
export function queryStationList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加服务站
export function addStationList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改服务站
export function upStationList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除服务站
export function delStationList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/delete", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 通过省市区查找服务站
export function findStationByArea(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/listByKeys", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// // 通过省市区查找服务站
// export function findStationByArea(params = {}) {
//     return (dispatch) => {
//         return Fetchapi.newPost(
//             '/manager/station/listByKeys', params,
//         ).then(
//             msg => {
//                 return msg;
//             }
//         ).catch(() => {
//             message.error('网络错误，请重试');
//         });
//     };
// }

// 体检预约开启和关闭
export function physicalSetOpenOrClose(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询体检预约设置的相关信息
export function reserveSettingList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/reserveSetting/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 获取当前登录帐号所属服务站信息
export function finStationByLogin(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/station/findStation",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 获取当前登录帐号所属服务站信息
export function reserveSettingUpdate(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/reserveSetting/update",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 系统管理 - 操作日志
export function OperationLog(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/operation/list",params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}
