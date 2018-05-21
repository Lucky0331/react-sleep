/* 服务站模块下面的 */

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

import Station from "./container/Station";
import Contracts from "./container/Contracts";

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
            to={`${this.props.match.path}/station`}
          />
          <Route
            exact
            path={`${this.props.match.path}/contracts`}
            component={Contracts}
          />
          <Route
            exact
            path={`${this.props.match.path}/station`}
            component={Station}
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
