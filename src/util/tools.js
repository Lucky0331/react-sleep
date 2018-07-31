import URLDATA from "./data";
import { message } from 'antd';
//  为这个项目创建的一些工具
const tools = {
  // 通过location返回该url对应的各级name/path
  getUrlName(pathName) {
    const p = pathName.split("/").filter(item => !!item);
    let temp = { children: URLDATA };
    console.log("开始getName:", p, temp);
    for (let i = 0; i < p.length; i++) {
      if (temp && temp.children) {
        temp = temp.children.find(item => item.path === p[i]);
      } else {
        temp = { name: "" };
        break;
      }
    }
    return temp.name;
  },

  /**
   * 标准日期转字符串年月日，时分秒
   * */
  dateToStr(date) {
    console.log('穿进来：', `${date.getMonth() + 1}`);
    if (!date) {
      return "";
    }
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = date
      .getDate()
      .toString()
      .padStart(2, "0");
    const h = date
      .getHours()
      .toString()
      .padStart(2, "0");
    const min = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const s = date
      .getSeconds()
      .toString()
      .padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d} ${h}:${min}:${s}`;
  },
  
  /**
   * 标准日期转字符串时分
   * */
  dateToStrHM(date) {
    if (!date) {
      return "";
    }
    const h = date
      .getHours()
      .toString()
      .padStart(2, "0");
    const min = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
    return `${h}:${min}`;
  },

  /**
   * 标准日期转字符串年月日，时分秒
   * 体检管理体检列表里预约体检时间设置后多了8个小时
   * */
  dateToStr2(date) {
    if (!date) {
      return "";
    }
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = date
      .getDate()
      .toString()
      .padStart(2, "0");
    const h = `${date.getHours() - 8}`.toString().padStart(2, "0");
    const min = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const s = date
      .getSeconds()
      .toString()
      .padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d} ${h}:${min}:${s}`;
  },

  /** 将标准格式字符串进行日期格式化 **/
  dateformart(str) {
    if (!str) {
      return "";
    }
    let date = str;
    if (!(str instanceof Date)) {
      date = new Date(str);
    }
    let m = date.getMonth() + 1;
    let d = date.getDate();
    if (m < 10) {
      m = `0${m}`;
    }
    if (d < 10) {
      d = `0${d}`;
    }
    return `${date.getFullYear()}-${m}-${d}`;
  },
  
  /** 将标准格式字符串进行日期格式化 预约体检传生日的**/
  dateforNull(str) {
    if (!str) {
      return "";
    }
    let date = str;
    if (!(str instanceof Date)) {
      date = new Date(str);
    }
    let m = date.getMonth() + 1;
    let d = date.getDate();
    if (m < 10) {
      m = `0${m}`;
    }
    if (d < 10) {
      d = `0${d}`;
    }
    return `${date.getFullYear()}${m}${d}`;
  },

  /**
   * 标准日期转字符串年月日，时分秒
   * 返回年月日
   * */
  dateToStrD(date) {
    if (!date) {
      return "";
    }
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = date
      .getDate()
      .toString()
      .padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
  },
  
  /**
   * 标准日期转字符串年月日，时分秒
   * 返回年月日 结算月份要比平时多一个月
   * */
  dateToStrDetail(date) {
    if (!date) {
      return "";
    }
    const m = `${date.getMonth()}`.padStart(2, "0");
    const d = date
      .getDate()
      .toString()
      .padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
  },
  
  /**
   * 标准日期转字符串年月日，时分秒
   * 返回年月
   * */
  dateToStrYM(date) {
    if (!date) {
      return "";
    }
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${date.getFullYear()}-${m}`;
  },
  
  /**
   * 标准日期转字符串年月
   * 返回年月
   * */
  dateToStrYM(date) {
    if (!date) {
      return "";
    }
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${date.getFullYear()}-${m}`;
  },

  /**
   * 标准日期转字符串年月日，时分秒
   * 返回年月日
   * 对账日期 默认查询前一天日期
   * */
  dateToStrQ(date) {
    if (!date) {
      return "";
    }
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate() - 1}`.toString().padStart(2, "0");
    const h = date
      .getHours()
      .toString()
      .padStart(2, "0");
    const min = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const s = date
      .getSeconds()
      .toString()
      .padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
  },

  /**
   * 验证字符串
   * 只能为汉字、字母、数字、下划线
   * 可以为空
   * **/
  checkStr(str) {
    if (!str) {
      return true;
    }
    const rex = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;

    return rex.test(str);
  },

  /**
   * 验证字符串
   * 只能为字母、数字、下划线
   * 可以为空
   * **/
  checkStr2(str) {
    if (!str) {
      return true;
    }
    const rex = /^[_a-zA-Z0-9]+$/;
    return rex.test(str);
  },

  /**
   * 验证字符串
   * 只能为数字
   * 可以为空
   * **/
  checkStr3(str) {
    if (!str) {
      return true;
    }
    const rex = /^\d*$/;
    return rex.test(str);
  },
  // 正则 手机号验证
  checkPhone(str) {
    const rex = /^1[34578]\d{9}$/;
    return rex.test(str);
  },

  checkEmail(str) {
    const rex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return rex.test(str);
  },
  trim(str) {
    if (!str) return "";
    const reg = /^\s*|\s*$/g;
    return str.replace(reg, "");
  },

  /**
   * 清楚一个对象中那些属性为空值的属性
   * 0 算有效值
   * **/
  clearNull(obj) {
    const temp = {};
    Object.keys(obj).forEach(item => {
      if (obj[item] === 0 || !!obj[item]) {
        temp[item] = obj[item];
      }
    });
    return temp;
  },

  /**
   * 导出
   * @param params 参数们
   * @param url 完整接口地址
   * @param type 请求方式，默认post
   * @param name 要生成的文件名带后缀，默认文档.xls
   */
  download(params={}, url, type="post", name="文档.xls"){
    // 构建form表单
    const form = document.createElement("form");
    form.action = url;
    form.method = type;
    Object.keys(params).forEach((item)=>{
      const newElement = document.createElement("input");
      newElement.setAttribute("name", item);
      newElement.setAttribute("type", "hidden");
      newElement.setAttribute("value", params[item]);
      form.appendChild(newElement);
    });

    // 开始ajax请求
    let xhr = new XMLHttpRequest();
    xhr.open(type.toUpperCase(), form.action);
    xhr.withCredentials = true;
    xhr.responseType="blob";
    const hide = message.loading("下载中,请稍等", 0);
    xhr.onload = function() {
      // 请求完成
      let blob = this.response;
      const fileName = name;
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(link.href);
        link.parentNode.removeChild(link);
      }
      xhr = null;
      hide();
    };
    // 监听下载进度，流数据total为0，计算不出进度
    xhr.addEventListener("progress", function(e){

    }, false);
    // 超时时触发
    xhr.ontimeout = function(e) {
      hide();
      xhr = null;
      message.error("连接超时，请重试", 0);
    };
    // 出错时触发
    xhr.onerror = function(e) {
      hide();
      xhr = null;
      message.error("下载出错，请重试", 0);
    };
    xhr.send(new FormData(form));
  }
};

export default tools;
