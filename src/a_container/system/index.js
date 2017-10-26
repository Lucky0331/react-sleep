/* system 系统管理 主页 */

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

import Manager from './container/manager';
import MenuContainer from './container/menu';
import Organization from './container/organization';
import Role from './container/role';
import Version from './container/version';

import UrlBread from '../../a_component/urlBread';

// ==================
// 本页面所需action
// ==================

import { saveURL } from '../../a_action/app-action';

// ==================
// Definition
// ==================
const MenuItem = Menu.Item;
class SystemContainer extends React.Component {
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
        <div key='page' className="allpage page-system">
            <div className='left'>
              <Menu
                theme="dark"
                selectedKeys={this.props.systemURL ? [this.props.systemURL] : ['/system/manager']}
                onSelect={(e)=>this.props.actions.saveURL(e.key)}
              >
                <MenuItem key="/system/manager">
                  <Link to='/system/manager'>管理员信息管理</Link>
                </MenuItem>
                <MenuItem key="/system/role">
                  <Link to='/system/role'>角色管理</Link>
                </MenuItem>
                <MenuItem key="/system/menu">
                  <Link to='/system/menu'>菜单管理</Link>
                </MenuItem>
                <MenuItem key="/system/version">
                  <Link to='/system/version'>app版本管理</Link>
                </MenuItem>
                <MenuItem key="/system/organization">
                  <Link to='/system/organization'>组织机构管理</Link>
                </MenuItem>
              </Menu>
            </div>
            <div className='right'>
              <Switch>
                  <Redirect exact from='/system' to={this.props.systemURL || '/system/manager'} />
                  <Route exact path='/system/manager' component={Manager} />
                  <Route exact path='/system/role' component={Role} />
                  <Route exact path='/system/menu' component={MenuContainer} />
                  <Route exact path='/system/version' component={Version} />
                  <Route exact path='/system/organization' component={Organization} />
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

SystemContainer.propTypes = {
  location: P.any,
  history: P.any,
  systemURL: P.any,
  actions: P.any,
};

// ==================
// Export
// ==================

export default connect(
  (state) => ({
    systemURL: state.app.systemURL,
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ saveURL }, dispatch),
  })
)(SystemContainer);
