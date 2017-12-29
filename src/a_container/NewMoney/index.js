/* 体检管理模块下面的 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { Link, BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import './index.scss';

// ==================
// 所需的所有组件
// ==================

import Manage from './container/Manage';
// import Set from './container/Set';
// import Flow from './container/Flow';
// import Query from './container/Query';

// ==================
// 本页面所需action
// ==================

import { } from '../../a_action/app-action';

// ==================
// Definition
// ==================

class TheContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        console.log('这是什么：', this.props.match);
    }

    componentWillReceiveProps(nextP) {
    }

    render() {
        return (
            <div key='page' className="allpage page-shop">
                <Switch>
                    <Redirect exact from={`${this.props.match.path}`} to={`${this.props.match.path}/manage`} />
                    <Route exact path={`${this.props.match.path}/manage`} component={Manage} />
                    {/*<Route exact path={`${this.props.match.path}/set`} component={Set} />*/}
                    {/*<Route exact path={`${this.props.match.path}/flow`} component={Flow} />*/}
                    {/*<Route exact path={`${this.props.match.path}/query`} component={Query}/>*/}
                </Switch>
            </div>
        );
    }
}

// ==================
// PropTypes
// ==================

TheContainer.propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    actions: P.any,
};

// ==================
// Export
// ==================

export default connect(
    (state) => ({

    }),
    (dispatch) => ({
        actions: bindActionCreators({ }, dispatch),
    })
)(TheContainer);