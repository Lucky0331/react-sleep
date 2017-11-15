import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';
import P from 'prop-types';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
class Menus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceData:[], // 层级结构的原始数据
            sessionData: null, // sessionStorage中保存的Menu数据
            treeDom: [],   // 生成的菜单结构
            show: false, // 是否显示
            chosedKey: [], // 当前选中
            openKeys: [], //
            collapsed: false,
        };
    }

    // 处理当前是否显示，和当前选中哪一个菜单
    static _initShow(location) {
        const path = location.pathname.split('/')[1];
        console.log('触发：', !(['login'].indexOf(path) > -1), path);
        return !(['login'].indexOf(path) > -1);
    }

    // 组件初始化完毕时触发
    componentDidMount() {
        const data = JSON.parse(sessionStorage.getItem('adminMenu'));
        console.log('得到的是什么：', data);
       this.makeSourceData(data || []);
       this.initChosed(this.props.location);
        this.setState({
            show: Menus._initShow(this.props.location),
            sessionData: data,
        });
    }

    componentWillUpdate(nextP, nextS) {
        if (nextS.collapsed !== this.state.collapsed && nextS.collapsed) {
            this.setState({
                openKeys: [],
            });
        }
    }

    componentWillReceiveProps(nextP) {
        if (nextP.location !== this.props.location) {
            this.initChosed(nextP.location);
            this.setState({
                show: Menus._initShow(nextP.location),
            });
        }
        const data = JSON.parse(sessionStorage.getItem('adminMenu'));
        if(data !== this.state.sessionData ) {
            this.makeSourceData(data || []);
        }
    }

    // 处理当前选中
    initChosed(location) {
        const paths = location.pathname.split('/').filter((item) => !!item);
        this.setState({
            chosedKey: [paths[paths.length - 1]],
            openKeys: paths
        });
    }

    // 展开/关闭 时触发
    onOpenChange(keys) {
        this.setState({
            openKeys: keys,
        });
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
        this.props.saveMenuSourceData(sourceData);
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
                    <SubMenu key={item.menuUrl} title={<span>{item.menuName}</span>}>
                        { this.makeTreeDom(item.children, newKey) }
                    </SubMenu>
                );
            } else {
                return <MenuItem key={item.menuUrl}><Link to={newKey}>{item.menuName}</Link></MenuItem>;
            }
        });
    }

    // 收起/展开 按钮被点击
    onCollapsed() {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render() {
        return (
            this.state.show ?
            [<Menu
                key="1"
                theme="dark"
                mode="inline"
                className={this.state.collapsed ? 'the-menu' : 'the-menu open'}
                selectedKeys={this.state.chosedKey}

                onOpenChange={(e) => this.onOpenChange(e)}
                inlineCollapsed={this.state.collapsed}
            >
                {this.state.treeDom}
            </Menu>, <div key="2" className={this.state.collapsed ? "collapsed-box" : "collapsed-box open"} >
                <Icon className="collapsed-icon" onClick={() => this.onCollapsed()} type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
            </div>] : null
        );
    }
}

Menus.propTypes = {
    location: P.any,
    saveMenuSourceData: P.func,
};

export default Menus;
