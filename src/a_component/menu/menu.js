import React from "react";
import { Link } from "react-router-dom";
import { Menu,Button,Icon} from "antd";
import P from "prop-types";
import "./menu.scss";

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
class Menus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceData: [], // 层级结构的原始数据
      sessionData: null, // sessionStorage中保存的Menu数据
      treeDom: [], // 生成的菜单结构
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      show: false, // 是否显示
      chosedKey: [], // 当前选中
      openKeys: [], // 需要被打开的项
      rootSubmenuKeys:[],//展开菜单项
      menuType: this.props.menuType,
      collapsed: false,
    };
  }

  // 处理当前是否显示
  static _initShow(location) {
    const path = location.pathname.split("/")[1];
    console.log("当前location:", location);
    return !(["login"].indexOf(path) > -1);
  }
  
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  
  // 组件初始化完毕时触发
  componentDidMount() {
    const data = JSON.parse(sessionStorage.getItem("adminMenu"));
    console.log("得到的是什么：", data);
    this.makeSourceData(data || []);
    this.initChosed(this.props.location);
    this.setState({
      show: Menus._initShow(this.props.location),
      sessionData: data
    });
  }

  componentWillReceiveProps(nextP) {
    if (nextP.location !== this.props.location) {
      this.setState({
        show: Menus._initShow(nextP.location)
      });
      this.initChosed(nextP.location);
    }
    if (this.state.menuType !== nextP.menuType) {
      this.setState({
        menuType: nextP.menuType
      });
    }
    const data = JSON.parse(sessionStorage.getItem("adminMenu"));
    if (data !== this.state.sessionData) {
      this.makeSourceData(data || []);
    }
  }

  // 处理当前选中
  initChosed(location) {
    const paths = location.pathname.split("/").filter(item => !!item);
    // 处理需要展开的项
    this.setState({
      chosedKey: [location.pathname], // [paths[paths.length - 1]],
      openKeys: paths.reduce(
        (a, b) => [...a, `${a[a.length - 1] || ""}/${b}`],
        []
      )
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
    d.forEach(item => {
      if (item.parentId === 0) {
        const temp = this.dataToJson(d, item);
        sourceData.push(temp);
      }
    });

    this.props.saveMenuSourceData(sourceData);
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
    return data.map((item, index) => {
      const newKey = `${key}/${item.menuUrl.replace(/\//, "")}`;
      // console.log('key都是什么：', newKey);
      if (item.children) {
        if(item.parentId === 0){
          return (
            <SubMenu key={newKey}
               title={[<img className="small-img" src={item.iconImg} key='0' style={{ marginLeft:'-10px',marginRight:'10px' }}/>,<span key='1'>{item.menuName}</span>]}>
              {this.makeTreeDom(item.children, newKey)}
            </SubMenu>
          );
          }else {
            return(
              <SubMenu key={newKey} title={<span key='1'>{item.menuName}</span>}>
                {this.makeTreeDom(item.children, newKey)}
              </SubMenu>
          )
        }
      } else {
        return (
          <MenuItem key={newKey}>
            <Link to={newKey}>{item.menuName}</Link>
          </MenuItem>
        );
      }
    });
  }

  // 菜单展开或关闭时触发
  onOpenChange(keys) {
    console.log("KEYS:", keys);
    this.setState({
      openKeys: keys
    });
  }
  render() {
    return (
      <Menu
        key="1"
        theme="dark"
        mode="inline"
        selectedKeys={this.state.chosedKey}
        openKeys={this.state.openKeys}
        className={this.state.show ? "the-menu open" : "the-menu open hide"}
        onOpenChange={keys => this.onOpenChange(keys)}
        inlineCollapsed={this.props.collapsed}
      >
        {this.state.treeDom}
      </Menu>
    );
  }
}

Menus.propTypes = {
  location: P.any,
  collapsed: P.bool, // 展开还是收起
  saveMenuSourceData: P.func,
  onCollapsed: P.func,
  menuType: P.any
};

export default Menus;
