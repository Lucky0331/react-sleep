/* device 设备中心 主页 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { Link, BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";
import P from "prop-types";
import { Menu } from "antd";
// ==================
// 所需的所有组件
// ==================

import Data from "./container/data";
import FirManage from "./container/firmanage";
import FirUpdate from "./container/firupdate";
import Info from "./container/info";
import Type from "./container/type";
import StateCom from "./container/state";
import History from "./container/history";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
const MenuItem = Menu.Item;
class SystemContainer extends React.Component {
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
        <div key="page" className="allpage page-system">
          <div className="left">
            <Menu
              theme="dark"
              selectedKeys={
                this.props.deviceURL ? [this.props.deviceURL] : ["/device/type"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <MenuItem key="/device/type">
                <Link to="/device/type">设备类型管理</Link>
              </MenuItem>
              <MenuItem key="/device/info">
                <Link to="/device/info">设备信息管理</Link>
              </MenuItem>
              <MenuItem key="/device/data">
                <Link to="/device/data">设备数据管理</Link>
              </MenuItem>
              <MenuItem key="/device/state">
                <Link to="/device/state">设备状态管理</Link>
              </MenuItem>
              <MenuItem key="/device/firmanage">
                <Link to="/device/firmanage">固件管理</Link>
              </MenuItem>
              <MenuItem key="/device/firupdate">
                <Link to="/device/firupdate">固件升级</Link>
              </MenuItem>
              <MenuItem key="/device/history">
                <Link to="/device/history">升级历史</Link>
              </MenuItem>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/device"
                to={this.props.deviceURL || "/device/type"}
              />
              <Route exact path="/device/type" component={Type} />
              <Route exact path="/device/info" component={Info} />
              <Route exact path="/device/data" component={Data} />
              <Route exact path="/device/state" component={StateCom} />
              <Route exact path="/device/firmanage" component={FirManage} />
              <Route exact path="/device/firupdate" component={FirUpdate} />
              <Route exact path="/device/history" component={History} />
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

SystemContainer.propTypes = {
  location: P.any,
  history: P.any,
  deviceURL: P.any,
  actions: P.any,
  deviceURL: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    deviceURL: state.app.deviceURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(SystemContainer);
