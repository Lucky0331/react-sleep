/* 头部组件 */
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import P from 'prop-types';
import './index.scss';
import { Button, Icon } from 'antd';
import LogoImg from '../../assets/logo-img.png';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null, // 用户信息
        };
    }

    // 组件初始化完毕时触发
    componentDidMount() {
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
            [<div key='0' className="com-header">
                <ul className="header-menu">
                    <li style={{ width: '98px', boxSizing: 'border-box', paddingLeft: '8px' }}><Link to="/home" className="logo"><img src={LogoImg} alt='logo'/>翼猫科技</Link></li>
                    {
                        this.state.user ? [
                            <li key="0"><NavLink to="/home"><Icon type="home" /> Home</NavLink></li>,
                            <li key="1"><NavLink to="/system">系统管理</NavLink></li>,
                            <li key="2"><NavLink to="/device">设备中心</NavLink></li>,
                            <li key="3"><NavLink to="/user">用户中心</NavLink></li>,
                            <li key="4"><NavLink to="/health">健康评估</NavLink></li>,
                            <li key="5"><NavLink to="/data">数据统计</NavLink></li>,
                            <li key="6"><NavLink to="/operate">运营中心</NavLink></li>,
                            <li key="7"><NavLink to="/physical">体检中心</NavLink></li>,
                            <li key="8"><NavLink to="/log">日志中心</NavLink></li>,
                            <li key="9"><NavLink to="/cost">费用中心</NavLink></li>,
                            <li key="10"><NavLink to="/open">开放平台</NavLink></li>,
                            <li key="11"><NavLink to="/activity">积分活动</NavLink></li>,
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
            </div>,
            <div key='1' className='header-station' />
            ]
        );
    }
}

Header.propTypes = {
    history: P.any,
};

export default Header;
