/* Gift 积分活动/积分礼品 */

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
class Gift extends React.Component {
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

Gift.propTypes = {
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
)(Gift);
