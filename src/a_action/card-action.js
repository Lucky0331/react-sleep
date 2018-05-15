import Fetchapi from "../util/fetch-api";
import { message } from "antd";

//代言卡列表查询
export function Cardlist(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productSpeakCard/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//删除代言卡
export function deleteCard(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/productSpeakCard/delete",
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

//添加代言卡
export function addCard(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/productSpeakCard/save",
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

//修改代言卡
export function UpdateCard(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/productSpeakCard/update",
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

//发布或取消发布代言卡
export function UpdateOnline(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productSpeakCard/remove", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//直播视频列表
export function LiveVideo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/live/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//直播发布添加
export function addLiveType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/liveType/save", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//直播发布修改
export function updateLiveType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/liveType/update", params,'post',true)
        .then(msg => {
          return msg;
        })
        .catch(() => {
          message.error("网络错误，请重试");
        });
  };
}

//直播分类
export function LiveType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/liveType/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//拉取视频
export function allPullVideo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/live/getLiveById", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//发布或取消视频
export function UpdateVideo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/live/outOff", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//删除视频
export function DeleteVideo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/live/delete", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}
