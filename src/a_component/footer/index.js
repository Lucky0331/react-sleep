/* Footer 页面底部 */
import React from "react";
import P from "prop-types";

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adminUser: null, // 用户信息
    };
  }
  
  // 获取sessionStorage中的用户信息，以同步导航栏状态
  getUserInfo() {
    let adminUser = sessionStorage.getItem("adminUser");
    if (`${adminUser}` !== `${JSON.stringify(this.state.adminUser)}`) {
      if (adminUser) {
        adminUser = JSON.parse(adminUser);
      }
      this.setState({
        adminUser,
      });
    }
  }
  
  // 组件初始化完毕时触发
  componentDidMount() {
    console.log("header:", this.props);
    this.getUserInfo();
  }
  
  componentWillUpdate() {
    this.getUserInfo();
  }
  
  render() {
    return (
      <div className={this.state.adminUser ? 'footerhide' : 'footer'}>
        © 2018{" "}
        <a
          href="http://yimaokeji.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          yimaokeji.com
        </a>{" "}
        Yimao Technology Development (Shanghai) Co,.Ltd.
      </div>
    );
  }
}

Footer.propTypes = {};

export default Footer;
