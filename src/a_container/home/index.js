/* 主页 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import "./index.scss";
// ==================
// 所需的所有组件
// ==================

import LogoImg1 from "../../assets/logo-1.png";
import LogoImg2 from "../../assets/logo-2.png";

// ==================
// 本页面所需action
// ==================

import { findAllMenu, submitLogin } from "../../a_action/sys-action";
import { onLogin } from "../../a_action/app-action";
import { findButtonsByMenuId } from "../../a_action/app-action";
// ==================
// Definition
// ==================
class HomePageContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      this.setState({
        show: true
      });
    }, 16);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize
    };
    this.props.actions.onLogin(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res);
      if (res.status === "0") {
        this.setState({
          data: res.data.adminRole.btnDtoList,
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 构建table所需数据
  makeData(data) {
    console.log("data是个啥：", data);
  }

  render() {
    return (
      <div className="page-home">
        <div className="home-box">
          <div className={this.state.show ? "title-box show" : "title-box"}>
            <div className="logo3d">
              <img className="logo logo1 logo-animate" src={LogoImg1} />
              <img className="logo logo2 logo-animate" src={LogoImg2} />
            </div>
            <div className="title">翼猫商城后台管理系统</div>
          </div>
          {/*<div className={this.state.show ? 'info show' : 'info'}>版本号: 1.0.0</div>*/}
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
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators(
      { findAllMenu, findButtonsByMenuId, onLogin, submitLogin },
      dispatch
    )
  })
)(HomePageContainer);
