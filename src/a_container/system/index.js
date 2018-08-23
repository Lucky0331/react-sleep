/* system 系统管理 主页 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { Link, BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";
import P from "prop-types";
import "./index.scss";

// ==================
// 所需的所有组件
// ==================

import Manager from "./container/manager";
import Organization from "./container/organization";
import Role from "./container/role";
import Jurisdiction from "./container/jurisdiction";
import Menus from "./container/menu";
import BuyPower from "./container/buypower";
import MyUserInfo from "./container/myuserinfo";
import Opelog from "./container/opelog";

import NotFound from "../../a_container/notfound";
// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================

class SystemContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseURL: "system",
      firstURL: "manager"
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
    return result ? result.menuUrl : "/manager";
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
          <Route
            exact
            path={`/${this.state.baseURL}/manager`}
            component={Manager}
          />
          <Route exact path={`/${this.state.baseURL}/role`} component={Role} />
          <Route
            exact
            path={`/${this.state.baseURL}/jurisdiction`}
            component={Jurisdiction}
          />
          <Route exact path={`/${this.state.baseURL}/menu`} component={Menus} />
          <Route
            exact
            path={`/${this.state.baseURL}/myuserinfo`}
            component={MyUserInfo}
          />
          <Route
            exact
            path={`/${this.state.baseURL}/organization`}
            component={Organization}
          />
          <Route
            exact
            path={`/${this.state.baseURL}/buypower`}
            component={BuyPower}
          />
          <Route
            exact
            path={`/${this.state.baseURL}/opelog`}
            component={Opelog}
          />
          <Route component={NotFound} />
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
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(SystemContainer);
