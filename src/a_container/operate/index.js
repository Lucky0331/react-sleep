/* Operate 运营中心 主页 */

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

import Ad from "./container/Ad";
import Article from "./container/Article";
import ArticleType from "./container/ArticleType";
import FeedBack from "./container/FeedBack";
import HomeProd from "./container/HomeProd";
import NewPush from "./container/NewPush";
import Quest from "./container/Quest";

// ==================
// 本页面所需action
// ==================

import { saveURL } from "../../a_action/app-action";

// ==================
// Definition
// ==================
class Operate extends React.Component {
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
                this.props.operateURL
                  ? [this.props.operateURL]
                  : ["/operate/homeprod"]
              }
              onSelect={e => this.props.actions.saveURL(e.key)}
            >
              <Menu.Item key="/operate/homeprod">
                <Link to="/operate/homeprod">首页产品管理</Link>
              </Menu.Item>
              <Menu.Item key="/operate/ad">
                <Link to="/operate/ad">广告管理</Link>
              </Menu.Item>
              <Menu.Item key="/operate/article">
                <Link to="/operate/article">文章管理</Link>
              </Menu.Item>
              <Menu.Item key="/operate/articletype">
                <Link to="/operate/articletype">文章类型管理</Link>
              </Menu.Item>
              <Menu.Item key="/operate/quest">
                <Link to="/operate/quest">调查问卷</Link>
              </Menu.Item>
              <Menu.Item key="/operate/newpush">
                <Link to="/operate/newpush">消息推送管理</Link>
              </Menu.Item>
              <Menu.Item key="/operate/feedback">
                <Link to="/operate/feedback">用户反馈管理</Link>
              </Menu.Item>
            </Menu>
          </div>
          <div className="right">
            <Switch>
              <Redirect
                exact
                from="/operate"
                to={this.props.operateURL || "/operate/homeprod"}
              />
              <Route exact path="/operate/homeprod" component={HomeProd} />
              <Route exact path="/operate/ad" component={Ad} />
              <Route exact path="/operate/article" component={Article} />
              <Route
                exact
                path="/operate/articletype"
                component={ArticleType}
              />
              <Route exact path="/operate/quest" component={Quest} />
              <Route exact path="/operate/newpush" component={NewPush} />
              <Route exact path="/operate/feedback" component={FeedBack} />
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

Operate.propTypes = {
  location: P.any,
  history: P.any,
  operateURL: P.any,
  actions: P.any
};

// ==================
// Export
// ==================

export default connect(
  state => ({
    operateURL: state.app.operateURL
  }),
  dispatch => ({
    actions: bindActionCreators({ saveURL }, dispatch)
  })
)(Operate);
