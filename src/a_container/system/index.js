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
// ==================
// 所需的所有组件
// ==================

import Manager from './container/manager';
import MenuContainer from './container/menu';
import Organization from './container/organization';
import Role from './container/role';
import Version from './container/version';

import Header from '../../a_component/header';
// ==================
// 本页面所需action
// ==================

import { saveURL } from '../../a_action/app-action';

// ==================
// Definition
// ==================
class SystemContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('SYSTEM进入:', this.props);
  }

  render() {
    return ([
      <Header key='h' history={this.props.history}/>,
      <BrowserRouter key='browser'>
        <div key='page' className="allpage page-system">
            <div className='left'>
              <Menu
                theme="dark"
                selectedKeys={this.props.systemURL ? [this.props.systemURL] : ['/system/manager']}
                onSelect={(e)=>this.props.actions.saveURL(e.key)}
              >
                <Menu.Item key="/system/manager">
                  <Link to='/system/manager'>管理员信息管理</Link>
                </Menu.Item>
                <Menu.Item key="/system/role">
                  <Link to='/system/role'>角色管理</Link>
                </Menu.Item>
                <Menu.Item key="/system/menu">
                  <Link to='/system/menu'>菜单管理</Link>
                </Menu.Item>
                <Menu.Item key="/system/version">
                  <Link to='/system/version'>app版本管理</Link>
                </Menu.Item>
                <Menu.Item key="/system/organization">
                  <Link to='/system/organization'>组织机构管理</Link>
                </Menu.Item>
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
      ]
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
