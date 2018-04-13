/* user 用户中心 主页 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { Link, BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";
import P from "prop-types";
import { Menu } from "antd";
import "./index.scss";
// ==================
// 所需的所有组件
// ==================

import Auth from "./container/auth";
import ClientB from "./container/clientb";
import ClientC from "./container/clientc";
import UserDeviceInfo from "./container/userDeviceInfo";
import UserPK from "./container/userPK";
import UserQuery from "./container/userQuery";
import UserType from "./container/userType";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class UserContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // 为了同步路由和Menu的高亮选择，进入时如果有子路由，就保存一下
    if (this.props.location.pathname.split("/")[2]) {
      this.props.actions.saveURL(this.props.location.pathname);
    }
  }

  render() {
    return (
      <BrowserRouter key="browser">
        <div key="page" className="allpage page-user">
          <div className="left">
            <Menu
              theme="dark"
              selectedKeys={
                this.props.userURL ? [this.props.userURL] : ["/user/type"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/user/type">
                <Link to="/user/type">用户类型管理</Link>
              </Menu.Item>
              <Menu.Item key="/user/devinfo">
                <Link to="/user/devinfo">用户设备信息管理</Link>
              </Menu.Item>
              <Menu.Item key="/user/query">
                <Link to="/user/query">
                  <div className="d-line">
                    用户亲友、售后、经销商、<br />服务站查询
                  </div>
                </Link>
              </Menu.Item>
              <Menu.Item key="/user/pk">
                <Link to="/user/pk">用户PK管理</Link>
              </Menu.Item>
              <Menu.Item key="/user/auth">
                <Link to="/user/auth">授权管理</Link>
              </Menu.Item>
              <Menu.Item key="/user/clientb">
                <Link to="/user/clientb">B端客户信息管理</Link>
              </Menu.Item>
              <Menu.Item key="/user/clientc">
                <Link to="/user/clientc">C端客户信息管理</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/user"
                to={this.props.userURL || "/user/type"}
              />
              <Route exact path="/user/type" component={UserType} />
              <Route exact path="/user/devinfo" component={UserDeviceInfo} />
              <Route exact path="/user/query" component={UserQuery} />
              <Route exact path="/user/pk" component={UserPK} />
              <Route exact path="/user/auth" component={Auth} />
              <Route exact path="/user/clientb" component={ClientB} />
              <Route exact path="/user/clientc" component={ClientC} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

// ==================
// PropTypes
// ==================

UserContainer.propTypes = {
  location: P.any,
  history: P.any,
  userURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    userURL: state.app.userURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(UserContainer);
