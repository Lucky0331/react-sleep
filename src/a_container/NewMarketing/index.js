/* 体检管理模块下面的 */

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

import Activity from "./container/Activity";//活动管理
import Bargain from "./container/Bargain";//活动管理
import Collage from "./container/Collage";//线上拼团
import Exchange from "./container/Exchange";//兑换码列表


// ==================
// 本页面所需action
// ==================

import {} from "../../a_action/app-action";

// ==================
// Definition
// ==================

class TheContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("这是什么：", this.props.match);
  }

  componentWillReceiveProps(nextP) {}

  render() {
    return (
      <div key="page" className="allpage page-shop">
        <Switch>
          <Redirect
            exact
            from={`${this.props.match.path}`}
            to={`${this.props.match.path}/activity`}
          />
          <Route
            exact
            path={`${this.props.match.path}/activity`} //首页活动
            component={Activity}
          />
          <Route
            exact
            path={`${this.props.match.path}/exchange`} //兑换活动
            component={Exchange}
          />
          <Route
            exact
            path={`${this.props.match.path}/collage`} //线上拼团
            component={Collage}
          />
          <Route
            exact
            path={`${this.props.match.path}/bargain`} //砍价活动
            component={Bargain}
          />
        </Switch>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

TheContainer.propTypes = {
  location: P.any,
  history: P.any,
  match: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators({}, dispatch)
  })
)(TheContainer);
