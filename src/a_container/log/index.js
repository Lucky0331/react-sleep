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
const MenuItem = Menu.Item;
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

    // 获取当前页需要显示的子路由
    makeSonUrl() {
        let urls = sessionStorage.getItem('adminMenu');

        if (urls) {
            urls = JSON.parse(urls);
        } else {
            urls = [];
        }

        const father = this.props.location.pathname.split('/')[1]; // 确定父级Url

        // 该页面所拥有的所有子路由
        const routerDom = {
            adminopera: AdminOpera,
            warning: EarlyWarning,
            signin: SignIn,
        };

        const fid = urls.find((item) => item.menuUrl === father || item.menuUrl === `/${father}`); // 找到父级信息
        if (!fid) { // 如果没找到父级，那子级不需要加载了
            return [null, [], []];
        }

        const results = [];
        const routers = [];
        let first = '';

        urls.sort((a, b) => a.sorts - b.sorts).forEach((item, index) => {
            const url = item.menuUrl.replace(/\//, '');
            if (routerDom[url] && `${item.parentId}` === `${fid.id}`) {
                if(results.length === 0) {
                    first = `/${father}/${url}`;
                }
                results.push(
                    <MenuItem key={`/${father}/${url}`}>
                        <Link to={`/${father}/${url}`}>{item.menuName}</Link>
                    </MenuItem>
                );
                routers.push(
                    <Route key={index} path={`/${father}/${url}`} component={routerDom[url]} />,
                );
            }
        });

        return {first, results, routers};
    }

  render() {
    // 动态处理路由
    const u = this.makeSonUrl();
    return (
        <div key='page' className="allpage page-log">
            <div className='left'>
                <Menu
                    theme="dark"
                    selectedKeys={this.props.logURL ? [this.props.logURL] : [u.first]}
                    onSelect={(e)=>this.props.actions.saveURL(e.key)}
                >
                    {u.results}
                </Menu>
            </div>
            <div className='right'>
                <Switch>
                    <Redirect exact from='/log' to={this.props.logURL || u.first} />
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
    allMenu: state.app.allMenu,
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ saveURL }, dispatch),
  })
)(Log);
