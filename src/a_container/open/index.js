/* Open 开放平台 主页 */

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

import Developer from "./container/developer";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class Open extends React.Component {
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
                this.props.openURL ? [this.props.openURL] : ["/open/developer"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/open/developer">
                <Link to="/open/developer">开发者信息管理</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/open"
                to={this.props.openURL || "/open/developer"}
              />
              <Route exact path="/open/developer" component={Developer} />
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

Open.propTypes = {
  location: P.any,
  history: P.any,
  openURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    openURL: state.app.openURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(Open);
