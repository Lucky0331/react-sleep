/* Article 运营中心/文章管理 */

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
class Article extends React.Component {
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

Article.propTypes = {
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
)(Article);
