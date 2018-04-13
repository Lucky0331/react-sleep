/* Loading加载中组件，用于代码分割按需加载时等待显示 */
import React from "react";
import P from "prop-types";
import ImgLoading from "../../assets/loading.gif";
import "./index.scss";

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <img className="loading-gif" src={ImgLoading} />;
  }
}

Loading.propTypes = {};

export default Loading;
