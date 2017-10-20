/* 主页 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import './index.scss';
// ==================
// 所需的所有组件
// ==================

import CanvasBack from '../../a_component/canvasBack';
import LogoImg1 from '../../assets/logo-1.png';
import LogoImg2 from '../../assets/logo-2.png';
// ==================
// 本页面所需action
// ==================


// ==================
// Definition
// ==================
class HomePageContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  componentDidMount() {
    this.setState({
      show: true,
    });
  }

  render() {
    return (
      <div className="page-home">
        <div className="home-box">
          <div className={this.state.show ? 'title-box show' : 'title-box'}>
            <div className="logo3d">
              <img className="logo logo1 logo-animate" src={LogoImg1} />
              <img className="logo logo2 logo-animate" src={LogoImg2} />
            </div>
            <div className="title">翼猫科技智能睡眠管理系统</div>
          </div>
          <div className={this.state.show ? 'info show' : 'info'}>版本号: 1.0.0</div>
        </div>
        <div className='back'>
          <CanvasBack />
        </div>
      </div>
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
  }), 
  (dispatch) => ({
    actions: bindActionCreators({}, dispatch),
  })
)(HomePageContainer);
