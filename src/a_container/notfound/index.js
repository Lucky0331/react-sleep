/* 404 NotFound */

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";

class NotFoundContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="page-notfound">
        <div className="box">404 not found</div>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

NotFoundContainer.propTypes = {};

// ==================
// Export
// ==================

export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators({}, dispatch)
  })
)(NotFoundContainer);
