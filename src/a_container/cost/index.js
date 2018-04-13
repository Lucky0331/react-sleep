/* Cost 费用中心 主页 */

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

import Recharge from "./container/Recharge";
import Arrears from "./container/Arrears";
import Balance from "./container/Balance";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class Cost extends React.Component {
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
                this.props.costURL ? [this.props.costURL] : ["/cost/recharge"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/cost/recharge">
                <Link to="/cost/recharge">充值记录</Link>
              </Menu.Item>
              <Menu.Item key="/cost/arrears">
                <Link to="/cost/arrears">欠费记录</Link>
              </Menu.Item>
              <Menu.Item key="/cost/balance">
                <Link to="/cost/balance">余额查询</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/cost"
                to={this.props.costURL || "/cost/recharge"}
              />
              <Route exact path="/cost/recharge" component={Recharge} />
              <Route exact path="/cost/arrears" component={Arrears} />
              <Route exact path="/cost/balance" component={Balance} />
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

Cost.propTypes = {
  location: P.any,
  history: P.any,
  costURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    costURL: state.app.costURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(Cost);
