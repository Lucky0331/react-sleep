/* Physical 体检中心 主页 */

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

import Bespeak from "./container/Bespeak";
import CoreAdmin from "./container/CoreAdmin";
import Package from "./container/Package";
import Archives from "./container/Archives";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class Physical extends React.Component {
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
                this.props.physicalURL
                  ? [this.props.physicalURL]
                  : ["/physical/bespeak"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/physical/bespeak">
                <Link to="/physical/bespeak">预约查询</Link>
              </Menu.Item>
              <Menu.Item key="/physical/coreadmin">
                <Link to="/physical/coreadmin">体检中心管理</Link>
              </Menu.Item>
              <Menu.Item key="/physical/package">
                <Link to="/physical/package">体检套餐</Link>
              </Menu.Item>
              <Menu.Item key="/physical/archives">
                <Link to="/physical/archives">体检档案查询</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/physical"
                to={this.props.physicalURL || "/physical/bespeak"}
              />
              <Route exact path="/physical/bespeak" component={Bespeak} />
              <Route exact path="/physical/coreadmin" component={CoreAdmin} />
              <Route exact path="/physical/package" component={Package} />
              <Route exact path="/physical/archives" component={Archives} />
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

Physical.propTypes = {
  location: P.any,
  history: P.any,
  physicalURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    physicalURL: state.app.physicalURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(Physical);
