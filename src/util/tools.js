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
    }
};

export default tools;