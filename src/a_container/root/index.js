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
import Home from '../home';
import Login from '../login';
import Features from '../features';
import Test from '../test';
import NotFound from '../notfound';

import Footer from '../../a_component/footer';

class RootContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  /* 权限控制 */
  onEnter(Component, props) {
    if (sessionStorage.getItem('user')) {
      return <Component {...props} />;
    } else {
      return <Redirect to='/login' />;
    }
  }

  componentDidMount() {

  }
  render() {
      console.log('root:', this.props);
    return (
      [
        <div className="boss" key="boss">
          <BrowserRouter basename='/build'>
            <div>
              <Switch>
                <Redirect exact from='/' to='/home'/>
                <Route path="/login" component={Login} />
                <Route path="/home" render={(props) => this.onEnter(Home, props)} />
                <Route path="/features" render={(props) => this.onEnter(Features, props)} />
                <Route path="/test" render={(props) => this.onEnter(Test, props)} />

                <Route component={NotFound} />
              </Switch>
            </div>
          </BrowserRouter>
        </div>,
        <Footer key="footer"/>
      ]
    );
  }
}

// ==================
// PropTypes
// ==================

RootContainer.propTypes = {
  dispatch: P.func,
  children: P.any,
  location: P.any,
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