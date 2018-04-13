/* 头部组件 */
import React from "react";
import { NavLink, Link } from "react-router-dom";
import P from "prop-types";
import "./index.scss";
import { Button, Icon, Menu } from "antd";
import LogoImg from "../../assets/logo-img.png";
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adminUser: null, // 用户信息
      adminRole: null, // 用户角色
      adminMenu: [], // 用户菜单
      sourceData: [], // 层级结构的原始数据
      btnDtoList: [], //所有的按钮权限的list
      sessionData: null, // sessionStorage中保存的Menu数据
      treeDom: [] // 生成的菜单结构
    };
  }

  // 组件初始化完毕时触发
  componentDidMount() {
    console.log("header:", this.props);
    this.getUserInfo();

    const data = JSON.parse(sessionStorage.getItem("adminMenu"));
    console.log("得到的是什么：", data);
    this.makeSourceData(data || []);
  }

  componentWillUpdate() {
    this.getUserInfo();
  }

  componentWillReceiveProps(nextP) {
    const data = JSON.parse(sessionStorage.getItem("adminMenu"));
    if (data !== this.state.sessionData) {
      this.makeSourceData(data || []);
    }
  }
  // 处理原始数据，将原始数据处理为层级关系
  makeSourceData(data) {
    let d = _.cloneDeep(data);
    // 按照sort排序
    d.sort((a, b) => {
      return a.sorts - b.sorts;
    });
    const sourceData = [];
    console.log("筛选了啊：", d.filter(item => String(item.parentId) === "0"));
    d = d.filter(item => String(item.parentId) === "0");
    d.forEach(item => {
      if (item.parentId === 0) {
        const temp = this.dataToJson(d, item);
        sourceData.push(temp);
      }
    });

    const treeDom = this.makeTreeDom(sourceData, "");
    this.setState({
      sourceData,
      treeDom
    });
  }

  // 递归将扁平数据转换为层级数据
  dataToJson(data, one) {
    const child = _.cloneDeep(one);
    child.children = [];
    let sonChild = null;
    data.forEach(item => {
      if (item.parentId === one.id) {
        sonChild = this.dataToJson(data, item);
        child.children.push(sonChild);
      }
    });
    if (child.children.length <= 0) {
      child.children = null;
    }
    return child;
  }

  // 构建树结构
  makeTreeDom(data, key) {
    // return data.map((item, index) => {
    //     const newKey = `${key}/${item.menuUrl.replace(/\//,'')}`;
    //     if (item.children) {
    //         return (
    //             <SubMenu key={newKey} title={<span>{item.menuName}</span>}>
    //                 { this.makeTreeDom(item.children, newKey) }
    //             </SubMenu>
    //         );
    //     } else {
    //         return <MenuItem key={newKey}><Link to={newKey}>{item.menuName}</Link></MenuItem>;
    //     }
    // });
  }

  // 获取sessionStorage中的用户信息，以同步导航栏状态
  getUserInfo() {
    let adminUser = sessionStorage.getItem("adminUser");
    let adminRole = sessionStorage.getItem("adminRole");
    let adminMenu = sessionStorage.getItem("adminMenu");
    if (`${adminUser}` !== `${JSON.stringify(this.state.adminUser)}`) {
      if (adminUser) {
        adminUser = JSON.parse(adminUser);
        adminRole = JSON.parse(adminRole);
        adminMenu = JSON.parse(adminMenu);
      }
      this.setState({
        adminUser,
        adminRole,
        adminMenu
      });
    }
  }

  // 退出登陆
  onLogout() {
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminRole");
    sessionStorage.removeItem("adminMenu");
    this.setState({
      adminUser: null,
      adminRole: null,
      adminMenu: []
    });
    this.props.history.push("/login");
  }

  // 头部导航改变
  menuChange(type) {
    console.log("asd", type);
    this.props.onMenuChange(type);
  }
  render() {
    return [
      <div key="0" className="com-header">
        <ul className="header-menu">
          <li
            style={{
              boxSizing: "border-box",
              paddingLeft: "8px",
              fontSize: "16px",
              letterSpacing: "1px",
              float: "left"
            }}
          >
            <Link to="/home" className="logo">
              <img src={LogoImg} alt="logo" />HRA健康风险评估管理系统
            </Link>
          </li>
        </ul>
        {/*<Menu*/}
        {/*theme="dark"*/}
        {/*mode="horizontal"*/}
        {/*defaultSelectedKeys={['2']}*/}
        {/*style={{ lineHeight: '45px',float:'left' ,fontSize:'16px',boxSizing: 'border-box'}}*/}
        {/*>*/}
        {/*<Menu.Item key="/product/list" style={{marginLeft:'16px'}}><Link to="/product/list" onClick={() => this.menuChange("sub1")}>产品管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/order/orderlist" style={{marginLeft:'16px'}}><Link to="/order/orderlist" onClick={() => this.menuChange("sub2")}>订单管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/service/station" style={{marginLeft:'16px'}} ><Link to="/service/station" onClick={() => this.menuChange("sub3")}>服务站管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/physical/list" style={{marginLeft:'16px'}}><Link to="/physical/list" onClick={() => this.menuChange("sub4")}>体检管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/money/manage" style={{marginLeft:'16px'}} ><Link to="/money/manage" onClick={() => this.menuChange("sub5")}>资金管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/invoice/pending" style={{marginLeft:'16px'}} ><Link to="/invoice/pending" onClick={() => this.menuChange("sub6")}>发票管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/content/banner" style={{marginLeft:'16px'}} ><Link to="/content/banner" onClick={() => this.menuChange("sub7")}>內容管理</Link></Menu.Item>*/}
        {/*<Menu.Item key="/system/manager" style={{marginLeft:'16px'}} ><Link to="/system/manager" onClick={() => this.menuChange("sub0")}>系统管理</Link></Menu.Item>*/}

        {/*</Menu>*/}
        <div className="menu-box">
          <Menu
            key="1"
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: "46px", fontSize: "16px", marginLeft: "20px" }}
          >
            {this.state.treeDom}
          </Menu>
        </div>

        <ul className="header-userinfo">
          {this.state.adminUser ? (
            [
              <li key="0">
                <Icon type="smile" style={{ marginRight: ".5em" }} />欢迎，{
                  this.state.adminUser.userName
                }
              </li>,
              <li key="1">
                <Button
                  className="logout"
                  icon="poweroff"
                  onClick={() => this.onLogout()}
                >
                  退出
                </Button>
              </li>
            ]
          ) : (
            <li>
              <Link to="/login">您尚未登陆</Link>
            </li>
          )}
        </ul>
      </div>,
      <div key="1" className="header-station" />
    ];
  }
}

Header.propTypes = {
  history: P.any,
  onMenuChange: P.any
};

export default Header;
