/* DataStat 数据统计 主页 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { Link, BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";
import P from "prop-types";
import { Menu } from "antd";
import "./index.scss";
// ==================
// 所需的所有组件
// ==================

import Active from "./container/Active";
import AdRate from "./container/AdRate";
import Facility from "./container/Facility";
import Funcrate from "./container/Funcrate";
import NewCustomer from "./container/NewCustomer";
import NewRegister from "./container/NewRegister";
import Order from "./container/Order";

import Header from "../../a_component/header";
// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class DataStat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // 为了同步路由和Menu的高亮选择，进入时如果有子路由，就保存一下
    if (this.props.location.pathname.split("/")[2]) {
      this.props.actions.saveURL(this.props.location.pathname);
    }
  }

  render() {
    return (
      <BrowserRouter key="browser">
        <div key="page" className="allpage">
          <div className="left">
            <Menu
              theme="dark"
              selectedKeys={
                this.props.dataURL
                  ? [this.props.dataURL]
                  : ["/data/newcustomer"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/data/newcustomer">
                <Link to="/data/newcustomer">新客户统计</Link>
              </Menu.Item>
              <Menu.Item key="/data/newregister">
                <Link to="/data/newregister">新注册用户统计</Link>
              </Menu.Item>
              <Menu.Item key="/data/active">
                <Link to="/data/active">活跃用户统计</Link>
              </Menu.Item>
              <Menu.Item key="/data/funcrate">
                <Link to="/data/funcrate">功能点击率</Link>
              </Menu.Item>
              <Menu.Item key="/data/order">
                <Link to="/data/order">体检中心预约统计</Link>
              </Menu.Item>
              <Menu.Item key="/data/adrate">
                <Link to="/data/adrate">广告点击率统计</Link>
              </Menu.Item>
              <Menu.Item key="/data/facility">
                <Link to="/data/facility">设备统计</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/data"
                to={this.props.dataURL || "/data/newcustomer"}
              />
              <Route exact path="/data/newcustomer" component={NewCustomer} />
              <Route exact path="/data/newregister" component={NewRegister} />
              <Route exact path="/data/active" component={Active} />
              <Route exact path="/data/funcrate" component={Funcrate} />
              <Route exact path="/data/order" component={Order} />
              <Route exact path="/data/adrate" component={AdRate} />
              <Route exact path="/data/facility" component={Facility} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

// ==================
// PropTypes
// ==================

DataStat.propTypes = {
  location: P.any,
  history: P.any,
  dataURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    dataURL: state.app.dataURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(DataStat);
