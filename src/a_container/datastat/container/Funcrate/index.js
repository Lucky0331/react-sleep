/* Funcrate 数据统计/功能点击率 */

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
class Funcrate extends React.Component {
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

Funcrate.propTypes = {
  location: P.any,
  history: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators({}, dispatch)
  })
)(Funcrate);
