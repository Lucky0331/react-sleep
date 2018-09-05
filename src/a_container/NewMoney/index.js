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

import Manage from "./container/Manage";
import Set from "./container/Set";
import Flow from "./container/Flow";
import Query from "./container/Query";
import Querydetail from "./container/Querydetail";
import ServiceIn from "./container/ServiceIn";
import Flow2 from "./container/Flow2";
import Withdrawals from "./container/Withdrawals";
import WithdrawalsAudit from "./container/WithdrawalsAudit";
import Bill from "./container/Bill";
import Biology from "./container/Biology";
import HealthFood from "./container/HealthFood";
import Waterpur from "./container/Waterpur";
import Refund from "./container/Refund";
import RefundAudit from "./container/RefundAudit";

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
            to={`${this.props.match.path}/query`}
          />
          <Route
            exact
            path={`${this.props.match.path}/manager`}
            component={Manage}
          />
          <Route exact path={`${this.props.match.path}/set`} component={Set} />
          <Route
            exact
            path={`${this.props.match.path}/management/health/flow`}
            component={Flow}
          />
          <Route
            exact
            path={`${this.props.match.path}/management/health/serviceIn`}
            component={ServiceIn}
          />
          <Route
            exact
            path={`${this.props.match.path}/management/healthfood`}
            component={HealthFood}
          />
          <Route
            exact
            path={`${this.props.match.path}/management/biology`}
            component={Biology}
          />
          <Route
            exact
            path={`${this.props.match.path}/waterpur`}
            component={Waterpur}
          />
          <Route
            exact
            path={`${this.props.match.path}/withdrawals`}//提现记录
            component={Withdrawals}
          />
          <Route
            exact
            path={`${this.props.match.path}/withdrawalsaudit`}//提现审核
            component={WithdrawalsAudit}
          />
          <Route
            exact
            path={`${this.props.match.path}/bill`} //订单对账
            component={Bill}
          />
          <Route
            exact
            path={`${this.props.match.path}/flow2`}
            component={Flow2}
          />
          <Route
            exact
            path={`${this.props.match.path}/serviceIn2`}
            component={ServiceIn}
          />
          <Route
            exact
            path={`${this.props.match.path}/query`}
            component={Query}
          />
          <Route
            exact
            path={`${this.props.match.path}/querydetail`}
            component={Querydetail}
          />
          <Route
            exact
            path={`${this.props.match.path}/refund`}//退款记录
            component={Refund}
          />
          <Route
            exact
            path={`${this.props.match.path}/refundaudit`}//退款审核
            component={RefundAudit}
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
