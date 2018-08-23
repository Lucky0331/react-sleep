/* 根页 */
import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import P from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import createHistory from "history/createHashHistory";
import "./index.scss";
import { saveMenuSourceData, saveMenuType } from "../../a_action/app-action";
import Login from "../login";

import Home from "../home"; // home页
import System from "../system"; // 系统管理模块

import NewProduct from "../NewProduct"; // 产品管理模块
import NewOrder from "../NewOrder"; // 订单管理模块
import NewPhysical from "../NewPhysical"; // 体检管理模块
import NewServiceStation from "../NewServiceStation"; // 服务站模块
import NewMoney from "../NewMoney"; //资金管理模块
import NewInvoice from "../NewInvoice"; //发票管理模块
import NewStatistics from "../NewStatistics"; //数据统计管理模块
import NewContent from "../NewContent"; //内容管理模块
import NewUser from "../NewUser"; //用户管理
import NewCustom from "../NewCustom"; //客服管理
import NewMarketing from "../NewMarketing"; //营销管理

import NotFound from "../notfound"; // 404页

import Header from "../../a_component/header"; // 头部组件
import Footer from "../../a_component/footer"; // 底部组件
import TheMenu from "../../a_component/menu/menu.js"; // 左侧导航组件

const history = createHistory();
class RootContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
    };
  }

  /* 权限控制 */
  onEnter(Component, props) {
    console.log("权限控制：", props);
    // 如果没有登陆，直接跳转至login页
    if (sessionStorage.getItem("adminUser")) {
      return <Component {...props} />;
    } else {
      return <Redirect to="/login" />;
    }
  }

  componentDidMount() {
    console.log("root:", this.props);
  }

  // 决定下面div容器的最大宽度
  _initWidth(location) {
    let width = "100%";
    const path = location.pathname.split("/")[1];
    if (["login"].indexOf(path) > -1) {
      width = "100%";
    } else if (this.state.collapsed) {
      width = "calc(100% - 80px)";
    } else {
      width = "calc(100% - 256px)";
    }
    return width;
  }
  // 决定菜单收起还是展开
  onCollapsed() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  // 头部导航改变时出发
  onMenuChange(type) {
    this.props.actions.saveMenuType(type);
  }
  render() {
    return [
      <Router history={history} key="browserrouter">
        <Route
          render={props => {
            return (
              <div className="boss">
                <Header
                  {...props}
                  onMenuChange={type => this.onMenuChange(type)}
                />
                <div className="the-body">
                  <div className="the-menu-box flex-none">
                    <TheMenu
                      location={props.location}
                      collapsed={this.state.collapsed}
                      onCollapsed={() => this.onCollapsed()}
                      saveMenuSourceData={this.props.actions.saveMenuSourceData}
                      menuType={this.props.menuType}
                    />
                  </div>
                  <div
                    className="flex-auto"
                    style={{ maxWidth: this._initWidth(props.location) }}
                  >
                    <Switch>
                      <Redirect exact from="/" to="/home" />
                      <Route exact path="/login" component={Login} />
                      <Route
                        path="/home"
                        render={props => this.onEnter(Home, props)}
                      />
                      <Route
                        path="/system"
                        render={props => this.onEnter(System, props)}
                      />
                      {/*<Route path="/shop" render={(props) => this.onEnter(Shop, props)} />*/}
                      {/*<Route path="/device" render={(props) => this.onEnter(Device, props)} />*/}
                      {/*<Route path="/user" render={(props) => this.onEnter(User, props)} />*/}
                      {/*<Route path="/health" render={(props) => this.onEnter(Health, props)} />*/}
                      {/*<Route path="/data" render={(props) => this.onEnter(DataStat, props)} />*/}
                      {/*<Route path="/operate" render={(props) => this.onEnter(Operate, props)} />*/}
                      {/*<Route path="/log" render={(props) => this.onEnter(Log, props)} />*/}
                      {/*<Route path="/cost" render={(props) => this.onEnter(Cost, props)} />*/}
                      {/*<Route path="/open" render={(props) => this.onEnter(Open, props)} />*/}
                      {/*<Route path="/activity" render={(props) => this.onEnter(Activity, props)} />*/}
                      <Route
                        path="/product"
                        render={props => this.onEnter(NewProduct, props)}
                      />
                      <Route
                        path="/order"
                        render={props => this.onEnter(NewOrder, props)}
                      />
                      <Route
                        path="/physical"
                        render={props => this.onEnter(NewPhysical, props)}
                      />
                      <Route
                        path="/service"
                        render={props => this.onEnter(NewServiceStation, props)}
                      />
                      <Route
                        path="/money"
                        render={props => this.onEnter(NewMoney, props)}
                      />
                      <Route
                        path="/invoice"
                        render={props => this.onEnter(NewInvoice, props)}
                      />
                      <Route
                        path="/content"
                        render={props => this.onEnter(NewContent, props)}
                      />
                      <Route
                        path="/statistics"
                        render={props => this.onEnter(NewStatistics, props)}
                      />
                      <Route
                        path="/usermanage"
                        render={props => this.onEnter(NewUser, props)}
                      />
                      <Route
                        path="/customer"
                        render={props => this.onEnter(NewCustom, props)}
                      />
                      <Route
                        path="/marketing"
                        render={props => this.onEnter(NewMarketing, props)}
                      />
                      <Route component={NotFound} />
                    </Switch>
                    <Footer key="footer" />
                  </div>
                </div>
              </div>
            );
          }}
        />
      </Router>
    ];
  }
}

// ==================
// PropTypes
// ==================

RootContainer.propTypes = {
  dispatch: P.func,
  location: P.any,
  history: P.any,
  actions: P.any,
  menuType: P.any
};

// ==================
// Export <PrivateRoute path='/features' component={Features} />
// ==================

export default connect(
  state => ({
    menuType: state.app.menuType
  }),
  dispatch => ({
    actions: bindActionCreators({ saveMenuSourceData, saveMenuType }, dispatch)
  })
)(RootContainer);
