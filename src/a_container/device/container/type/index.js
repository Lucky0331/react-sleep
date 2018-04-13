/* Type 设备中心/设备类型管理 */

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
class TypeCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <div>1</div>;
  }
}

// ==================
// PropTypes
// ==================

TypeCom.propTypes = {
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
)(TypeCom);
