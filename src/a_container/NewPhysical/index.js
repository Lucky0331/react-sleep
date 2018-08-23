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

import List from "./container/List";
import Set from "./container/Set";
import PhyStatistics from "./container/PhyStatistics";
import Detail from "./container/Detail";
import Distribution from "./container/Distribution";
import Station from "./container/Station";
import StatisticalList from "./container/StatisticalList";
import ListReserve from  "./container/ListReserve"


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
            to={`${this.props.match.path}/hracard/distribution`}
          />
          <Route
            exact
            path={`${this.props.match.path}/checklist`}
            component={List}
          />
          <Route
            exact
            path={`${this.props.match.path}/listReserve`}
            component={ListReserve}
          />
          <Route exact path={`${this.props.match.path}/set`} component={Set} />
          <Route
            exact
            path={`${this.props.match.path}/phys`}
            component={PhyStatistics}
          />
          <Route
            exact
            path={`${this.props.match.path}/hracard/detail`}
            component={Detail}
          />
          <Route
            exact
            path={`${this.props.match.path}/hracard/distribution`}//F卡分配
            component={Distribution}
          />
          <Route
            exact
            path={`${this.props.match.path}/station`}
            component={Station}
          />
          <Route
            exact
            path={`${this.props.match.path}/StatisticalList`} //体检统计列表
            component={StatisticalList}
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
