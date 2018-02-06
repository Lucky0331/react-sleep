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
import Set from './container/Set';
import Flow from './container/Flow';
import Query from './container/Query';
import ServiceIn from './container/ServiceIn';
import Flow2 from './container/Flow2';
import Withdrawals from './container/Withdrawals';
import Bill from './container/Bill';
// import ServiceIn2  from './container/ServiceIn2';


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
                    <Redirect exact from={`${this.props.match.path}`} to={`${this.props.match.path}/manager`} />
                    <Route exact path={`${this.props.match.path}/manager`} component={Manage} />
                    <Route exact path={`${this.props.match.path}/set`} component={Set} />
                    <Route exact path={`${this.props.match.path}/management/flow`} component={Flow} />
                    <Route exact path={`${this.props.match.path}/management/serviceIn`} component={ServiceIn}/>
                    <Route exact path={`${this.props.match.path}/account/withdrawals`} component={Withdrawals} />
                    <Route exact path={`${this.props.match.path}/account/bill`} component={Bill}/>
                    <Route exact path={`${this.props.match.path}/flow2`} component={Flow2} />
                    <Route exact path={`${this.props.match.path}/serviceIn2`} component={ServiceIn} />
                    <Route exact path={`${this.props.match.path}/query`} component={Query}/>
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