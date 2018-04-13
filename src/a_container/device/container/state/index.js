/* State 设备中心/设备状态管理 */

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
class StateCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <div>4</div>;
  }
}

// ==================
// PropTypes
// ==================

StateCom.propTypes = {
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
)(StateCom);
