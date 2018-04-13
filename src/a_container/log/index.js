/* system 系统管理 主页 */

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

import SignIn from "./container/SignIn";
import AdminOpera from "./container/AdminOpera";
import EarlyWarning from "./container/EarlyWarning";

// ==================
// 本页面所需action
// ==================

import {} from "../../a_action/app-action";

// ==================
// Definition
// ==================
const MenuItem = Menu.Item;
class SystemContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseURL: "log",
      firstURL: "signin"
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextP) {}

  // 获取排序第1个的Menu，用于设置redirect
  getFirstMenu(data) {
    console.log("原始数据是什么：", data);
    const temp = data.find(item => item.menuUrl === this.state.baseURL);
    let result = null;
    if (temp && temp.children) {
      result = temp.children.reduce((a, b) => {
        return a.sorts < b.sorts ? a : b;
      });
    }
    return result ? result.menuUrl : `${this.state.firstURL}`;
  }

  render() {
    return (
      <div key="page" className="allpage page-system">
        <Switch>
          <Redirect
            exact
            from={`/${this.state.baseURL}`}
            to={`/${this.state.baseURL}/${this.getFirstMenu(
              this.props.menuSourceData
            )}`}
          />
          <Route path={`/${this.state.baseURL}/signin`} component={SignIn} />
          <Route
            path={`/${this.state.baseURL}/adminopera`}
            component={AdminOpera}
          />
          <Route
            path={`/${this.state.baseURL}/earlywarning`}
            component={EarlyWarning}
          />
        </Switch>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

SystemContainer.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  menuSourceData: P.array
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    menuSourceData: state.app.menuSourceData
  }),
  dispatch => ({
    actions: bindActionCreators({}, dispatch)
  })
)(SystemContainer);
