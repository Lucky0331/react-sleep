/* 主页 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import P from 'prop-types';

// ==================
// 所需的所有组件
// ==================

import ImgLogo from '../../assets/react-logo.jpg';
import Header from '../../a_component/header';

// ==================
// 本页面所需action
// ==================

import appAction from '../../a_action/app-action';

// ==================
// Definition
// ==================
class HomePageContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return ([
      <Header key='h' history={this.props.history}/>,
      <div key='page' className="page-home">
          <div className="box">
              <img src={ImgLogo} />
              <div className="title">React16.1111</div>
              <div className="info">react、red46ux、webpack3、eslint、babel6、antd</div>
          </div>
      </div>]
    );
  }
}

// ==================
// PropTypes
// ==================

HomePageContainer.propTypes = {
  location: P.any,
  history: P.any,
};

// ==================
// Export
// ==================

export default connect(
  (state) => ({
    testvalue: state.app.inputvalue,
    fetchValue: state.app.fetchvalue,
  }), 
  (dispatch) => ({
    actions: bindActionCreators({}, dispatch),
  })
)(HomePageContainer);
