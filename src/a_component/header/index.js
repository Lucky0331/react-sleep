/* 头部组件 */
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import P from 'prop-types';
import './index.scss';
import { Button } from 'antd';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null, // 用户信息
        };
    }

    // 组件初始化完毕时触发
    componentDidMount() {
        console.log('都有什么：', this.props);
        this.getUserInfo();
    }

    componentWillUpdate(){
        this.getUserInfo();
    }

    // 获取sessionStorage中的用户信息，以同步导航栏状态
    getUserInfo() {
        let user = sessionStorage.getItem('user');
        if (`${user}` !== `${JSON.stringify(this.state.user)}`) {
            if (user) {
                user = JSON.parse(user);
            }
            this.setState({
                user,
            });
        }
    }

    // 退出登陆
    onLogout(){
        sessionStorage.removeItem('user');
        this.setState({
            user: null,
        });
        this.props.history.push('/login');
    }

    render() {
        return (
            <div className="com-header">
                <ul className="header-menu">
                    <li><Link to="/home" className="logo">翼猫睡眠管理系统</Link></li>
                    {
                        this.state.user ? [
                            <li key="0"><NavLink to="/home">首页</NavLink></li>,
                            <li key="1"><NavLink to="/features">模块1</NavLink></li> ,
                            <li key="2"><NavLink to={{ pathname: '/test', search: '?a=123&b=abc', state: { c: '456', d: 'ABC'} }}>模块2</NavLink></li>
                        ] : null
                    }
                </ul>
                <ul className="header-userinfo">
                    {
                        this.state.user ? [
                            <li key="0">欢迎，{this.state.user.username}</li>,
                            <li key="1"><Button className='logout' icon="poweroff" onClick={() => this.onLogout()}>退出</Button></li>
                        ] : <li><Link to="/login">您尚未登陆</Link></li>
                    }

                </ul>
            </div>
        );
    }
}

Header.propTypes = {
    history: P.any,
};

export default Header;
