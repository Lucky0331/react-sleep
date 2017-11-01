import URLDATA from './data';

//  为这个项目创建的一些工具
const tools = {
    // 通过location返回该url对应的各级name/path
    getUrlName(pathName) {
        const p = pathName.split('/').filter((item) => !!item);
        let length = p.length;
        let temp = { children: URLDATA };
        for(let i=0; i<p.length; i++) {
            temp = temp.children.find((item)=> item.path === p[i]);
        }
        return temp.name;
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

    // 正则 邮箱验证
    checkEmail(str) {
        const rex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return rex.test(str);
    },
    // 去掉字符串两端空格
    trim(str) {
        if (!str) return '';
        const reg = /^\s*|\s*$/g;
        return str.replace(reg, '');
    },

    /**
     * 清楚一个对象中那些属性为空值的属性
     * 0 算有效值
     * **/
    clearNull(obj) {
        const temp = {};
        Object.keys(obj).forEach((item) => {
            if (obj[item] === 0 || !!obj[item]) {
                temp[item] = obj[item];
            }
        });
        return temp;
    },
};

export default tools;