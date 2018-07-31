const allobj = {
  // 将标准格式字符串进行日期格式化
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
  // 将数字或字符串*100，保留两位小数点返回,非法返回''
  percent(str) {
    if (!str && str !== 0) {
      return "";
    }
    const temp = window.parseFloat(str);
    return (temp * 100).toFixed(2);
  },
  // 将数字或字符串/100，保留两位小数点返回,非法返回''
  noPercent(str) {
    if (!str && str !== 0) {
      return "";
    }
    const temp = window.parseFloat(str);
    return (temp / 100).toFixed(2);
  },
  // 保留4位小数点返回，非法返回''
  point4(str) {
    if (!str && str !== 0) {
      return "";
    }
    const temp = window.parseFloat(str);
    return temp.toFixed(4) || "";
  },
  // 保留N位小数
  pointX(str, x = 0) {
    if (!str && str !== 0) {
      return "--";
    }
    const temp = window.parseFloat(str);
    if (temp === 0) {
      return temp.toFixed(x);
    }
    return temp ? temp.toFixed(x) : "--";
  },
  // 去掉字符串两端空格
  trim(str) {
    if (!str) return "";
    const reg = /^\s*|\s*$/g;
    return str.replace(reg, "");
  },
  addMosaic(str) {
    if (!str && str !== 0) {
      return "";
    }
    const s = `${str}`;
    const lenth = s.length;
    const howmuch = (() => {
      if (s.length <= 2) {
        return s.length;
      }
      const l = s.length - 2;
      if (l <= 6) {
        return l;
      }
      return 6;
    })();
    const start = Math.floor((lenth - howmuch) / 2);
    const ret = s.split("").map((v, i) => {
      if (i >= start && i < start + howmuch) {
        return "*";
      }
      return v;
    });
    return ret.join("");
  },
  compile(code) {
    let c = String.fromCharCode(code.charCodeAt(0) + code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    return c;
  },
  uncompile(code) {
    let c = String.fromCharCode(code.charCodeAt(0) - code.length);
    for (let i = 1; i < code.length; i++) {
      c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
    }
    return c;
  }
};

export default allobj;
