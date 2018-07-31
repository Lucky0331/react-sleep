import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import Root from "./a_container/root";

import store from "./store";
import "./css/css.css";
import "./css/scss.scss";

const rootDom = document.getElementById("app-root");

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  rootDom
);

if (module.hot) {
  module.hot.accept();
}
