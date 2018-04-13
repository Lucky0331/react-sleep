/* 各页面 面包屑导航 */
import React from "react";
import { Breadcrumb, Icon } from "antd";
import { Link } from "react-router-dom";
import P from "prop-types";
import tools from "../../util/tools";

import "./index.scss";

class UrlBread extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 根据location的pathname构建面包屑
  makeBreads() {
    let path = this.props.location.pathname;
    const u = path.split("/").filter(item => !!item);
    let tempPath = "";
    return u.map((item, index) => {
      tempPath = `${tempPath}/${item}`;
      console.log("URL:tempPath:", tempPath);
      return (
        <Breadcrumb.Item key={index}>
          {tools.getUrlName(tempPath)}
        </Breadcrumb.Item>
      );
    });
  }

  render() {
    return (
      <div className="url-bread all_clear">
        <div className="l">
          <Icon type="environment-o" /> 当前位置：
        </div>
        <div className="r">
          <Breadcrumb>{this.makeBreads()}</Breadcrumb>
        </div>
      </div>
    );
  }
}

UrlBread.propTypes = {
  location: P.any
};

export default UrlBread;
