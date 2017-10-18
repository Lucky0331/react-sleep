/* Log 日志中心 主页 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { Link, BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Menu } from 'antd';
import './index.scss';
// ==================
// 所需的所有组件
// ==================

import AdminOpera from './container/AdminOpera';
import EarlyWarning from './container/EarlyWarning';
import SignIn from './container/SignIn';

// ==================
// 本页面所需action
// ==================

import { saveURL } from '../../a_action/app-action';

// ==================
// Definition
// ==================
class Log extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    // 为了同步路由和Menu的高亮选择，进入时如果有子路由，就保存一下
    if (this.props.location.pathname.split('/')[2]) {
      this.props.actions.saveURL(this.props.location.pathname);
    }
  }

  render() {
    return (
      <BrowserRouter key='browser'>
        <div key='page' className="allpage">
            <div className='left'>
              <Menu
                theme="dark"
                selectedKeys={this.props.logURL ? [this.props.logURL] : ['/log/signin']}
                onSelect={(e)=>this.props.actions.saveURL(e.key)}
              >
                <Menu.Item key="/log/signin">
                  <Link to='/log/signin'>用户登录日志</Link>
                </Menu.Item>
                <Menu.Item key="/log/warning">
                  <Link to='/log/warning'>预警日志</Link>
                </Menu.Item>
                <Menu.Item key="/log/adminopera">
                  <Link to='/log/adminopera'>管理员操作日志</Link>
                </Menu.Item>
              </Menu>
            </div>
            <div className='right'>
              <Switch>
                  <Redirect exact from='/log' to={this.props.logURL || '/log/signin'} />
                  <Route exact path='/log/signin' component={SignIn} />
                  <Route exact path='/log/warning' component={EarlyWarning} />
                  <Route exact path='/log/adminopera' component={AdminOpera} />
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

Log.propTypes = {
  location: P.any,
  history: P.any,
  logURL: P.any,
  actions: P.any,
};

// ==================
// Export
// ==================

export default connect(
  (state) => ({
    logURL: state.app.logURL,
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ saveURL }, dispatch),
  })
)(Log);
