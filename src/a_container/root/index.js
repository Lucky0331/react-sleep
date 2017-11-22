/* 根页 */
import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import P from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import createHistory from 'history/createHashHistory';
import './index.scss';
import { Button, Icon } from 'antd';
import { saveMenuSourceData } from '../../a_action/app-action';
import Login from '../login';

import Home from '../home';
import System from '../system';
import User from '../user';
import Device from '../device';
import Health from '../health';
import DataStat from '../datastat';
import Operate from '../operate';
import Physical from '../physical';
import Log from '../log';
import Cost from '../cost';
import Open from '../open';
import Activity from '../activity';
import Shop from '../shop';

import NotFound from '../notfound';

import Header from '../../a_component/header';
import Footer from '../../a_component/footer';
import TheMenu from '../../a_component/menu/menu.js';

const history = createHistory();
class RootContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        collapsed: false,
    }
  }

  /* 权限控制 */
  onEnter(Component, props) {
    console.log('权限控制：', props);
    // 如果没有登陆，直接跳转至login页
    if (sessionStorage.getItem('adminUser')) {
      return <Component {...props} />;
    } else {
      return <Redirect to='/login' />;
    }
  }

  componentDidMount() {
    console.log('root:', this.props );
  }

  // 决定下面div容器的最大宽度
  _initWidth(location) {
      let width = '100%';
      const path = location.pathname.split('/')[1];
      if (['login'].indexOf(path) > -1) {
        width = '100%';
      } else if(this.state.collapsed) {
        width = 'calc(100% - 64px)';
      } else {
        width = 'calc(100% - 256px)';
      }
      return width;
  }
  // 决定菜单收起还是展开
  onCollapsed() {
    this.setState({
        collapsed: !this.state.collapsed,
    });
  }

  render() {
    return ([
      <Router history={history} key='browserrouter'>
        <Route render={(props) => {
          return (
            <div className="boss">
                <Header {...props}/>
                <div className="the-body">
                  <div className="the-menu-box flex-none">
                    <TheMenu
                        location={props.location}
                        collapsed={this.state.collapsed}
                        onCollapsed={() => this.onCollapsed()}
                        saveMenuSourceData={this.props.actions.saveMenuSourceData}
                    />
                  </div>

                  <div className="flex-auto" style={{ maxWidth: this._initWidth(props.location) }}>
                    <Switch>
                      <Redirect exact from='/' to='/home' />
                      <Route exact path="/login" component={Login} />
                      <Route path="/home" render={(props) => this.onEnter(Home, props)} />
                      <Route path="/system" render={(props) => this.onEnter(System, props)} />
                      <Route path="/shop" render={(props) => this.onEnter(Shop, props)} />
                      <Route path="/device" render={(props) => this.onEnter(Device, props)} />
                      <Route path="/user" render={(props) => this.onEnter(User, props)} />
                      <Route path="/health" render={(props) => this.onEnter(Health, props)} />
                      <Route path="/data" render={(props) => this.onEnter(DataStat, props)} />
                      <Route path="/operate" render={(props) => this.onEnter(Operate, props)} />
                      <Route path="/physical" render={(props) => this.onEnter(Physical, props)} />
                      <Route path="/log" render={(props) => this.onEnter(Log, props)} />
                      <Route path="/cost" render={(props) => this.onEnter(Cost, props)} />
                      <Route path="/open" render={(props) => this.onEnter(Open, props)} />
                      <Route path="/activity" render={(props) => this.onEnter(Activity, props)} />
                      <Route component={NotFound} />
                    </Switch>
                    <Footer key="footer"/>
                  </div>
                </div>
            </div>
          );
        }}/>
      </Router>
    ]);
  }
}

// ==================
// PropTypes
// ==================

RootContainer.propTypes = {
  dispatch: P.func,
  location: P.any,
  history: P.any,
  actions: P.any,
};

// ==================
// Export <PrivateRoute path='/features' component={Features} />
// ==================

export default connect(
  (state) => ({
  }), 
  (dispatch) => ({
      actions: bindActionCreators({ saveMenuSourceData }, dispatch),
  })
)(RootContainer);