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
            treeDom: [],   // 生成的菜单结构
            show: false, // 是否显示
            chosedKey: [], // 当前选中
        };
    }

    // 处理当前是否显示菜单
    static _initShow(location) {
        const path = location.pathname.split('/')[1];
        return !(['login'].indexOf(path) > -1);
    }

    // 处理当前选中 Menu的key跟location.pathname一致
    initChosed(location) {
        this.setState({
            chosedKey: [location.pathname],
        });
    }

    // 组件初始化完毕时触发
    componentDidMount() {
        this.initChosed(this.props.location);
        this.setState({
            show: Menus._initShow(this.props.location),
        });
    }

    componentWillReceiveProps(nextP) {
        if (nextP.location !== this.props.location) {
            this.initChosed(nextP.location);
            this.setState({
                show: Menus._initShow(nextP.location),
            });
        }
    }

    // 选中时触发
    onMenuSelect(e) {
        console.log('选中：', e);
        this.setState({
            chosedKey: e.selectedKeys,
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
                    selectedKeys={this.state.chosedKey}

                    onSelect={(e) => this.onMenuSelect(e)}
                >
                    <SubMenu key="sub0" title={<span>系统管理</span>}>
                        <Menu.Item key="/system/manager"><Link to="/system/manager">管理员信息管理</Link></Menu.Item>
                        <Menu.Item key="/system/role"><Link to="/system/role">角色管理</Link></Menu.Item>
                        <Menu.Item key="/system/menu"><Link to="/system/menu">菜单管理</Link></Menu.Item>
                        <Menu.Item key="/system/jurisdiction"><Link to="/system/jurisdiction">权限管理</Link></Menu.Item>
                        {/*<Menu.Item key="sub0-5"><Link to="/system/organization">组织机构管理</Link></Menu.Item>*/}
                    </SubMenu>
                    <SubMenu key="sub1" title={<span>产品管理</span>}>
                            <Menu.Item key="/product/list"><Link to="/product/list">产品列表</Link></Menu.Item>
                            {/*<SubMenu key="sub1-1" title={<span>产品列表</span>}>*/}
                                {/*<Menu.Item key="/product/list"><Link to="/product/list">健康体检</Link></Menu.Item>*/}
                            {/*</SubMenu>*/}
                            <Menu.Item key="/product/type"><Link to="/product/type">产品类型</Link></Menu.Item>
                            <Menu.Item key="/product/model"><Link to="/product/model">产品型号</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" title={<span>订单管理</span>}>
                        {/*<SubMenu key="sub2-1" title="订单列表">*/}
                            <Menu.Item key="/product/orderlist"><Link to="/product/orderlist">订单列表</Link></Menu.Item>
                        {/*</SubMenu>*/}
                    </SubMenu>
                    <SubMenu key="sub3" title={<span>服务站管理</span>}>
                        <Menu.Item key="/service/station"><Link to="/service/station">产品上线</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub4" title={<span>体检管理</span>}>
                        <Menu.Item key="/physical/list"><Link to="/physical/list">体检列表</Link></Menu.Item>
                        <Menu.Item key="/physical/set"><Link to="/physical/set">预约设置</Link></Menu.Item>
                        <Menu.Item key="/physical/phys"><Link to="/physical/phys">体检统计</Link></Menu.Item>
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


