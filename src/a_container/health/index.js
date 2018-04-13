/* Health 健康评估 主页 */

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

import Daily from "./container/daily";
import Monthly from "./container/monthly";
import Weekly from "./container/weekly";
import Sleep from "./container/sleep";
import Sub from "./container/sub";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class Health extends React.Component {
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
        <div key="page" className="allpage">
          <div className="left">
            <Menu
              theme="dark"
              selectedKeys={
                this.props.healthURL
                  ? [this.props.healthURL]
                  : ["/health/sleep"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/health/sleep">
                <Link to="/health/sleep">睡眠质量评估记录</Link>
              </Menu.Item>
              <Menu.Item key="/health/sub">
                <Link to="/health/sub">亚健康评估记录</Link>
              </Menu.Item>
              <Menu.Item key="/health/daily">
                <Link to="/health/daily">日报管理</Link>
              </Menu.Item>
              <Menu.Item key="/health/weekly">
                <Link to="/health/weekly">周报管理</Link>
              </Menu.Item>
              <Menu.Item key="/health/monthly">
                <Link to="/health/monthly">月报管理</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/health"
                to={this.props.healthURL || "/health/sleep"}
              />
              <Route exact path="/health/sleep" component={Sleep} />
              <Route exact path="/health/sub" component={Sub} />
              <Route exact path="/health/daily" component={Daily} />
              <Route exact path="/health/weekly" component={Weekly} />
              <Route exact path="/health/monthly" component={Monthly} />
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

Health.propTypes = {
  location: P.any,
  history: P.any,
  healthURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    healthURL: state.app.healthURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(Health);
