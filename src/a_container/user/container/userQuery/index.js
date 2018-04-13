/* userQuery 用户中心/用户亲友、售后、经销商、服务站查询 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";

// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

// ==================
// Definition
// ==================
class userQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <div>3</div>;
  }
}

// ==================
// PropTypes
// ==================

userQuery.propTypes = {
  location: P.any,
  history: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    testvalue: state.app.inputvalue,
    fetchValue: state.app.fetchvalue
  }),
  dispatch => ({
    actions: bindActionCreators({}, dispatch)
  })
)(userQuery);
