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
            chosedKey: [location.pathname], // [paths[paths.length - 1]],
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
                    <SubMenu key={newKey} title={<span>{item.menuName}</span>}>
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
            this.state.show ?
            [<Menu
                key="1"
                theme="dark"
                mode="inline"
                className={this.props.collapsed ? 'the-menu' : 'the-menu open'}
                selectedKeys={this.state.chosedKey}

                onOpenChange={(e) => this.onOpenChange(e)}
                inlineCollapsed={this.props.collapsed}
            >
                {this.state.treeDom}
            </Menu>, <div key="2" className={this.props.collapsed ? "collapsed-box" : "collapsed-box open"} >
                <Icon className="collapsed-icon" onClick={() => this.props.onCollapsed()} type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'} />
            </div>] : null
        );
    }
}

Menus.propTypes = {
    location: P.any,
    collapsed: P.bool,  // 展开还是收起
    saveMenuSourceData: P.func,
    onCollapsed: P.func,
};

export default Menus;
