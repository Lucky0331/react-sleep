/* 产品管理 这里面都是产品相关的 */

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

import OperateData from "./container/OperateData"; //运营统计
import UserDataList from "./container/UserDataList"; //用户统计
import OrderListData from "./container/OrderListData"; //订单统计
import BeneficialListData from "./container/BeneficialListData"; //收益统计
import UserInfoCount from "./container/UserInfoCount";//用户分布统计
import PhyStatistics from "./container/PhyStatistics";//体检统计
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
            to={`${this.props.match.path}/operatedata`} // 运营数据
          />
          <Route
            exact
            path={`${this.props.match.path}/operatedata`}
            component={OperateData}
          />
          <Route
            exact
            path={`${this.props.match.path}/userdataList`} //用户统计
            component={UserDataList}
          />
          <Route
            exact
            path={`${this.props.match.path}/orderListdata`} //订单数据
            component={OrderListData}
          />
          <Route
            exact
            path={`${this.props.match.path}/beneficialListdata`} //收益数据
            component={BeneficialListData}
          />
          <Route
            exact
            path={`${this.props.match.path}/userinfocount`} //用户分布统计
            component={UserInfoCount}
          />
          <Route
            exact
            path={`${this.props.match.path}/phys`}
            component={PhyStatistics}
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
