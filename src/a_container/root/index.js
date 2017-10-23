/* 根页 */
import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import P from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// import Bundle from '../../a_component/bundle';
// import Loading from '../../a_component/loading';
// import lazeHome from 'bundle-loader?lazy!../home';
// import lazeFeatures from 'bundle-loader?lazy!../features';
// import lazeTest from 'bundle-loader?lazy!../test';
// import lazeNotFound from 'bundle-loader?lazy!../notfound';
// const Home = (props) => (
//   <Bundle load={lazeHome}>
//     {(Home) => Home ? <Home {...props} /> : <Loading />}
//   </Bundle>
// );
// const Features = (props) => (
//   <Bundle load={lazeFeatures}>
//     {(Features) => Features ? <Features {...props} /> : <Loading />}
//   </Bundle>
// );
// const Test = (props) => (
//   <Bundle load={lazeTest}>
//     {(Test) => Test ? <Test {...props} /> : <Loading />}
//   </Bundle>
// );
// const NotFound = (props) => (
//   <Bundle load={lazeNotFound}>
//     {(NotFound) => NotFound ? <NotFound {...props} /> : <Loading /> }
//   </Bundle>
// );

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

import NotFound from '../notfound';

import Header from '../../a_component/header';
import Footer from '../../a_component/footer';


class RootContainer extends React.Component {
  constructor(props) {
    super(props);
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
  render() {
    return ([
      <BrowserRouter key='browserrouter'>
        <Route render={(props) => {
          return (
            <div className="boss">
                <Header {...props}/>
                <Switch>
                  <Redirect exact from='/' to='/home' />
                  <Route path="/login" component={Login} />
                  <Route path="/home" render={(props) => this.onEnter(Home, props)} />
                  <Route path="/system" render={(props) => this.onEnter(System, props)} />
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
            </div>
          );
        }}/>
      </BrowserRouter>,
      <Footer key="footer"/>
    ]);
  }
}

// ==================
// PropTypes
// ==================

RootContainer.propTypes = {
  dispatch: P.func,
  children: P.any,
  location: P.any,
  history: P.any,
};

// ==================
// Export <PrivateRoute path='/features' component={Features} />
// ==================

export default connect(
  (state) => ({
  }), 
  (dispatch) => ({
      actions: bindActionCreators({}, dispatch),
  })
)(RootContainer);