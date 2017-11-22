import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import P from 'prop-types';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
class Menus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceData:[], // 层级结构的原始数据
            treeDom: [],    // 生成的菜单结构
        };
    }

    // 组件初始化完毕时触发
    componentDidMount() {
        const data = JSON.parse(sessionStorage.getItem('adminMenu'));
        this.makeSourceData(data);
    }

    // 处理原始数据，将原始数据处理为层级关系
    makeSourceData(data) {
        console.log('原始数据是什么222222：', data);
        let d = _.cloneDeep(data);
        // 按照sort排序
        d.sort((a, b) => {
            return a.sorts - b.sorts;
        });
        const sourceData = [];
        d.forEach((item) => {
            if (item.parentId === 0) {
                const temp = this.dataToJson(d, item);
                sourceData.push(temp);
            }
        });
        console.log('jsonMenu是什么11111：', sourceData);
        const treeDom = this.makeTreeDom(sourceData, '');
        this.setState({
            sourceData,
            treeDom,
        });

    }

    // 递归将扁平数据转换为层级数据
    dataToJson(data, one) {
        const child = _.cloneDeep(one);
        child.children = [];
        let sonChild = null;
        data.forEach((item) => {
            if (item.parentId === one.id) {
                sonChild = this.dataToJson(data, item);
                child.children.push(sonChild);
            }
        });
        if (child.children.length <=0) {
            child.children = null;
        }
        return child;
    }

    // 构建树结构
    makeTreeDom(data, key) {
        return data.map((item, index) => {
            const newKey = `${key}/${item.menuUrl.replace(/\//,'')}`;
            if (item.children) {
                return (
                    <SubMenu key={newKey} title={item.menuName}>
                        { this.makeTreeDom(item.children, newKey) }
                    </SubMenu>
                );
            } else {
                return <MenuItem key={newKey}><Link to={newKey}>{item.menuName}</Link></MenuItem>;
            }
        });
    }

    render() {
        return (
            <Menu
                theme="dark"
                mode="inline"
            >
                {this.state.treeDom}
            </Menu>
        );
    }
}

Menus.propTypes = {

};

export default Menus;
