import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';
import P from 'prop-types';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
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
        this.setState({
            show: Menus._initShow(this.props.location),
            sessionData: data,
        });
    }

    componentWillUpdate(nextP, nextS) {
    }

    componentWillReceiveProps(nextP) {
        if (nextP.location !== this.props.location) {
            this.setState({
                show: Menus._initShow(nextP.location),
            });
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

    render() {
        return (
            this.state.show ?
                [<Menu
                    key="1"
                    theme="dark"
                    mode="inline"
                    className={this.props.collapsed ? 'the-menu' : 'the-menu open'}
                    inlineCollapsed={this.props.collapsed}
                >
                    <SubMenu key="sub1" title={<span>产品管理</span>}>
                            <SubMenu key="sub1-1" title={<span>产品列表</span>}>
                                {/*<Menu.Item key="sub1-1-1">智能净水</Menu.Item>*/}
                                {/*<Menu.Item key="sub1-1-2">健康食品</Menu.Item>*/}
                                {/*<Menu.Item key="sub1-1-3">生物理疗</Menu.Item>*/}
                                {/*<Menu.Item key="sub1-1-4">健康睡眠</Menu.Item>*/}
                                <Menu.Item key="sub1-1-5"><Link to="/product/list">健康体检</Link></Menu.Item>
                            </SubMenu>
                            <Menu.Item key="sub1-2"><Link to="/product/type">产品类型</Link></Menu.Item>
                            <Menu.Item key="sub1-3"><Link to="/product/model">产品型号</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" title={<span>订单管理</span>}>
                        <SubMenu key="sub2-1" title="订单列表">
                            {/*<Menu.Item key="sub2-1-1">智能净水</Menu.Item>*/}
                            {/*<Menu.Item key="sub2-1-2">健康食品</Menu.Item>*/}
                            {/*<Menu.Item key="sub2-1-3">生物理疗</Menu.Item>*/}
                            {/*<Menu.Item key="sub2-1-4">健康睡眠</Menu.Item>*/}
                            <Menu.Item key="sub2-1-5"><Link to="/product/orderlist">健康体检</Link></Menu.Item>
                        </SubMenu>
                    </SubMenu>
                    <SubMenu key="sub3" title={<span>服务站</span>}>
                        <SubMenu key="sub3-1" title="产品上线">
                            <Menu.Item key="sub3-1-1">体检上线</Menu.Item>
                        </SubMenu>
                    </SubMenu>
                    <SubMenu key="sub4" title={<span>体检管理</span>}>
                        <Menu.Item key="sub4-1"><Link to="/physical/list">体检列表</Link></Menu.Item>
                        <Menu.Item key="sub4-1-2">预约设置</Menu.Item>
                        <Menu.Item key="sub4-1-3">体检统计</Menu.Item>
                        <Menu.Item key="sub4-1-4">服务站统计</Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub5" title={<span>资金管理</span>}>
                        <Menu.Item key="sub5-1">收款方管理</Menu.Item>
                        <Menu.Item key="sub5-2">分配规则配置</Menu.Item>
                        <Menu.Item key="sub5-3">资金流向</Menu.Item>
                        <Menu.Item key="sub5-4">结算查询</Menu.Item>
                    </SubMenu>
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


