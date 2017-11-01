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
import Jurisdiction from './container/jurisdiction';
import Version from './container/version';

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
    console.log('location=======', this.props.location);
  }

  // 获取当前页需要显示的子路由
  makeSonUrl() {
      let urls = sessionStorage.getItem('adminMenu');
      if (urls) {
          urls = JSON.parse(urls);
      } else {
          urls = [];
      }

      const father = this.props.location.pathname.split('/')[1]; // 确定父级Url
      const fid = urls.find((item) => item.menuUrl === father || item.menuUrl === `/${father}`); // 找到父级信息
      if (!fid) { // 如果没找到父级，那子级不需要加载了
          return [];
      }

      const menuDom = {
        manager: <MenuItem key="/system/manager">
                <Link to='/system/manager'>管理员信息管理</Link>
            </MenuItem>,
          role: <MenuItem key="/system/role">
              <Link to='/system/role'>角色管理</Link>
          </MenuItem>,
          menu: <MenuItem key="/system/menu">
              <Link to='/system/menu'>菜单管理</Link>
          </MenuItem>,
          jurisdiction: <MenuItem key="/system/jurisdiction">
              <Link to='/system/jurisdiction'>权限管理</Link>
          </MenuItem>,
          version: <MenuItem key="/system/version">
              <Link to='/system/version'>app版本管理</Link>
          </MenuItem>,
          organization: <MenuItem key="/system/organization">
              <Link to='/system/organization'>组织机构管理</Link>
          </MenuItem>
        };

      const routerDom = {
          manager: <Route path='/system/manager' component={Manager} />,
          role: <Route path='/system/role' component={Role} />,
          jurisdiction: <Route path='/system/jurisdiction' component={Jurisdiction} />,
          menu: <Route path='/system/menu' component={MenuContainer} />,
          version: <Route path='/system/version' component={Version} />,
          organization: <Route path='/system/organization' component={Organization} />,
      }
        const results = [];
        const routers = [];
        urls.sort((a, b) => a.sorts - b.sorts).forEach((item, index) => {
            const url = item.menuUrl.replace(/\//, '');
            if (menuDom[url] && `${item.parentId}` === `${fid.id}`) {
                results.push(menuDom[url]);
                routers.push(routerDom[url]);
            }
        });
        return {first: `/${father}/${urls[0] ? urls[0].menuUrl.replace(/\//, '') : ''}`, results, routers};
  }

  render() {
      // 动态处理路由
      const u = this.makeSonUrl();
    return (
        <div key='page' className="allpage page-system">
            <div className='left'>
              <Menu
                theme="dark"
                selectedKeys={this.props.systemURL ? [this.props.systemURL] : [u.first]}
                onSelect={(e)=>this.props.actions.saveURL(e.key)}
              >
                  {u.results}
              </Menu>
              {/*<Menus />*/}
            </div>
            <div className='right'>
              <Switch>
                  <Redirect exact from='/system' to={this.props.systemURL || u.first} />
                  {u.routers}
              </Switch>
          </div>
        </div>
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
      allMenu: state.app.allMenu,
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ saveURL }, dispatch),
  })
)(SystemContainer);