import React from "react";
import { Link } from "react-router-dom";
import { Menu, Icon } from "antd";
import P from "prop-types";
import "./index.scss";

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
class Menus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceData: [], // 层级结构的原始数据
      treeDom: [], // 生成的菜单结构
      show: false, // 是否显示
      chosedKey: [] // 当前选中
    };
  }

  // 处理当前是否显示菜单
  static _initShow(location) {
    const path = location.pathname.split("/")[1];
    return !(["login"].indexOf(path) > -1);
  }

  // 处理当前选中 Menu的key跟location.pathname一致
  initChosed(location) {
    this.setState({
      chosedKey: [location.pathname]
    });
  }

  // 组件初始化完毕时触发
  componentDidMount() {
    this.initChosed(this.props.location);
    this.setState({
      show: Menus._initShow(this.props.location)
    });
  }

  componentWillReceiveProps(nextP) {
    if (nextP.location !== this.props.location) {
      this.initChosed(nextP.location);
      this.setState({
        show: Menus._initShow(nextP.location)
      });
    }
  }

  // 选中时触发
  onMenuSelect(e) {
    console.log("选中：", e);
    this.setState({
      chosedKey: e.selectedKeys
    });
  }

  render() {
    const type = this.props.menuType;
    return this.state.show
      ? [
          <Menu
            key="1"
            theme="dark"
            mode="inline"
            className={this.props.collapsed ? "the-menu" : "the-menu open"}
            inlineCollapsed={this.props.collapsed}
            selectedKeys={this.state.chosedKey}
            defaultOpenKeys={[
              "sub0",
              "sub1",
              "sub2",
              "sub3",
              "sub4",
              "sub5",
              "sub6",
              "sub7"
            ]}
            onSelect={e => this.onMenuSelect(e)}
          >
            <SubMenu
              className={type === "sub0" ? "" : "hide"}
              key="sub0"
              title={<span>系统管理</span>}
            >
              <Menu.Item key="/system/manager">
                <Link to="/system/manager">管理员信息管理</Link>
              </Menu.Item>
              <Menu.Item key="/system/role">
                <Link to="/system/role">角色管理</Link>
              </Menu.Item>
              <Menu.Item key="/system/menu">
                <Link to="/system/menu">菜单管理</Link>
              </Menu.Item>
              <Menu.Item key="/system/jurisdiction">
                <Link to="/system/jurisdiction">权限管理</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              className={type === "sub1" ? "" : "hide"}
              key="sub1"
              title={<span>产品管理</span>}
            >
              <Menu.Item key="/product/list">
                <Link to="/product/list">产品列表</Link>
              </Menu.Item>
              <Menu.Item key="/product/type">
                <Link to="/product/type">产品类型</Link>
              </Menu.Item>
              <Menu.Item key="/product/model">
                <Link to="/product/model">产品型号</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              className={type === "sub2" ? "" : "hide"}
              key="sub2"
              title={<span>订单管理</span>}
            >
              <Menu.Item key="/order/orderlist">
                <Link to="/order/orderlist">订单列表</Link>
              </Menu.Item>
              <Menu.Item key="/order/ordertwo">
                <Link to="/order/ordertwo">订单列表查询</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              className={type === "sub3" ? "" : "hide"}
              key="sub3"
              title={<span>服务站管理</span>}
            >
              <Menu.Item key="/service/station">
                <Link to="/service/station">产品上线</Link>
              </Menu.Item>
              <Menu.Item key="/service/contracts">
                <Link to="/service/contracts">承包上线</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              className={type === "sub4" ? "" : "hide"}
              key="sub4"
              title={<span>体检管理</span>}
            >
              <Menu.Item key="/physical/list">
                <Link to="/physical/list">体检列表</Link>
              </Menu.Item>
              <Menu.Item key="/physical/set">
                <Link to="/physical/set">预约设置</Link>
              </Menu.Item>
              <Menu.Item key="/physical/phys">
                <Link to="/physical/phys">体检统计</Link>
              </Menu.Item>
              <Menu.Item key="/physical/station">
                <Link to="/physical/station">服务站统计</Link>
              </Menu.Item>
              <SubMenu key="sub5-1" title="体检卡管理">
                <Menu.Item key="/physical/distribution">
                  <Link to="/physical/distribution">体检卡分配</Link>
                </Menu.Item>
                <Menu.Item key="/physical/detail">
                  <Link to="/physical/detail">分配详情</Link>
                </Menu.Item>
              </SubMenu>
            </SubMenu>
            <SubMenu
              className={type === "sub5" ? "" : "hide"}
              key="sub5"
              title={<span>资金管理</span>}
            >
              <Menu.Item key="/money/manage">
                <Link to="/money/manage">收款管理</Link>
              </Menu.Item>
              <Menu.Item key="/money/set">
                <Link to="/money/set">分配规则配置</Link>
              </Menu.Item>
              <SubMenu key="sub5-2" title="资金流向">
                <Menu.Item key="/money/flow">
                  <Link to="/money/flow">经营收益</Link>
                </Menu.Item>
                <Menu.Item key="/money/serviceIn">
                  <Link to="/money/serviceIn">服务收益</Link>
                </Menu.Item>
              </SubMenu>
              <SubMenu key="sub5-3" title="收益查询">
                <Menu.Item key="/money/flow2">
                  <Link to="/money/flow2">经营收益</Link>
                </Menu.Item>
                <Menu.Item key="/money/serviceIn2">
                  <Link to="/money/serviceIn2">服务收益</Link>
                </Menu.Item>
              </SubMenu>
              <Menu.Item key="/money/query">
                <Link to="/money/query">结算查询</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              className={type === "sub6" ? "" : "hide"}
              key="sub6"
              title={<span>发票管理</span>}
            >
              <Menu.Item key="/invoice/pending">
                <Link to="/invoice/pending">待处理申请</Link>
              </Menu.Item>
              <Menu.Item key="/invoice/applylist">
                <Link to="/invoice/applylist">申请记录</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu
              className={type === "sub7" ? "" : "hide"}
              key="sub7"
              title={<span>内容管理</span>}
            >
              <Menu.Item key="/content/banner">
                <Link to="/content/banner">banner管理</Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        ]
      : null;
  }
}

Menus.propTypes = {
  location: P.any,
  collapsed: P.bool, // 展开还是收起
  saveMenuSourceData: P.func,
  onCollapsed: P.func,
  menuType: P.any // 当前头部导航选择的哪一个
};

export default Menus;
