/* Activity 积分活动 主页 */

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

import Gift from "./container/Gift";
import Category from "./container/Category";
import Exchange from "./container/Exchange";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class Activity extends React.Component {
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
                this.props.activityURL
                  ? [this.props.activityURL]
                  : ["/activity/gift"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/activity/gift">
                <Link to="/activity/gift">积分礼品</Link>
              </Menu.Item>
              <Menu.Item key="/activity/category">
                <Link to="/activity/category">礼品类别</Link>
              </Menu.Item>
              <Menu.Item key="/activity/exchange">
                <Link to="/activity/exchange">兑换记录</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/activity"
                to={this.props.activityURL || "/activity/gift"}
              />
              <Route exact path="/activity/gift" component={Gift} />
              <Route exact path="/activity/category" component={Category} />
              <Route exact path="/activity/exchange" component={Exchange} />
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

Activity.propTypes = {
  location: P.any,
  history: P.any,
  activityURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    activityURL: state.app.activityURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(Activity);
