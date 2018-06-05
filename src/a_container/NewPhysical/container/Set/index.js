/* List 体检管理/预约设置 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  InputNumber,
  message,
  Switch,
  Radio,
  Select,
  Spin
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
import _ from "lodash";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  physicalSetOpenOrClose,
  reserveSettingList,
  finStationByLogin,
  reserveSettingUpdate
} from "../../../../a_action/sys-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false, // 正在异步请求
      stationData: {}, // 服务站基本信息
      data: {}, // 设置信息
      times: "", // 当前的拥有的时间段
      isOpen: true // 开启还是关闭
    };
  }

  componentDidMount() {
    this.onGetStationData();
    this.onGetData();
  }

  // 获取当前服务站基本信息
  onGetStationData() {
    this.props.actions.finStationByLogin().then(res => {
      if (res.status === "0") {
        this.setState({
          stationData: res.data
        });
      }
    });
  }

  // 预约提前天数改变时触发
  onDayCountChange(e) {
    this.startLoading();
    this.props.actions
      .physicalSetOpenOrClose({ id: this.state.stationData.id, dayCount: e })
      .then(res => {
        if (res.status === "0") {
          this.onGetStationData();
        } else {
          message.error(res.message || "操作失败");
        }
        this.endLoading();
      })
      .catch(() => {
        this.endLoading();
      });
  }

  // 获取当前时间段信息
  onGetData() {
    const me = this;
    const { form } = me.props;
    const { setFieldsValue } = form;

    this.props.actions
      .reserveSettingList({ pageNum: 0, pageSize: 1 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            data: res.data.ptPage.ReserveSetting,
            times: res.data.ptPage.reserveTime
          });
          setFieldsValue({
            startTime: Number(res.data.ptPage.ReserveSetting.beginTime),
            endTime: Number(res.data.ptPage.ReserveSetting.endTime),
            reserveInterval:
              res.data.ptPage.ReserveSetting.reserveInterval || 1,
            count: res.data.ptPage.ReserveSetting.count || "1"
          });
        } else {
          message.error(res.message || "获取数据失败，请重试");
        }
      });
  }

  // 保存时间段
  onSubmit() {
    const me = this;
    const { form } = me.props;

    form.validateFields(
      ["startTime", "endTime", "reserveInterval", "count"],
      (err, values) => {
        if (values.startTime > values.endTime) {
          message.error("开始时间不能大于结束时间");
          return false;
        }
        const params = {
          id: this.state.data.id,
          beginTime: values.startTime,
          endTime: values.endTime,
          count: values.count,
          reserveInterval: values.reserveInterval
        };
        this.startLoading();
        this.props.actions
          .reserveSettingUpdate(params)
          .then(res => {
            if (res.status === "0") {
              this.onGetData();
              message.success("保存成功");
            } else {
              message.error("保存失败");
            }
            this.endLoading();
          })
          .catch(() => {
            this.endLoading();
          });
      }
    );
  }

  startLoading() {
    this.setState({
      loading: true
    });
  }
  endLoading() {
    this.setState({
      loading: false
    });
  }
  // 保存开启和关闭
  setOpenOrClose(bool) {
    console.log("是啥：", bool);
    this.startLoading();
    this.props.actions
      .physicalSetOpenOrClose({
        id: this.state.stationData.id,
        state: bool ? 0 : -1
      })
      .then(res => {
        if (res.status === "0") {
          this.onGetStationData();
          message.success("修改成功");
        } else {
          message.error(res.message || "操作失败");
        }
        this.endLoading();
      })
      .catch(() => {
        this.endLoading();
      });
  }

  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };
    const startTime = getFieldValue("startTime");
    const endTime = getFieldValue("endTime");
    return (
      <div style={{ width: "100%" }}>
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <Spin spinning={this.state.loading}>
            <Form>
              <FormItem label="设置预约是否开启：" {...formItemLayout}>
                <div>开启后用户可在微信公众号预约体检</div>
                <Switch
                  checkedChildren={"开启"}
                  unCheckedChildren={"关闭"}
                  checked={this.state.stationData.state === 0}
                  onChange={e => this.setOpenOrClose(e)}
                />
              </FormItem>
              <FormItem label="可预约日期：" {...formItemLayout}>
                <div>设置后，将根据当天日期自动计算用户可预约的日期</div>
                <InputNumber
                  min={1}
                  max={99}
                  style={{ width: "200px" }}
                  placeholder="请输入最大提前预约天数"
                  value={this.state.stationData.dayCount}
                  onChange={e => this.onDayCountChange(e)}
                />
              </FormItem>
              <FormItem label="可预约时间：" {...formItemLayout}>
                <div>设置时间后，用户在预约时可选择体检的时间</div>
              </FormItem>
              <FormItem label="开始时间：" {...formItemLayout}>
                {getFieldDecorator("startTime", {
                  initialValue: undefined,
                  rules: [{ required: true, message: "请选择开始时间" }]
                })(
                  <Select style={{ width: "200px" }}>
                    {(() => {
                      const map = [];
                      for (let i = 0; i < 25; i++) {
                        map.push(
                          <Option key={i} value={i}>{`${String(i).padStart(
                            2,
                            "0"
                          )}:00`}</Option>
                        );
                      }
                      return map;
                    })()}
                  </Select>
                )}
              </FormItem>
              <FormItem label="结束时间：" {...formItemLayout}>
                {getFieldDecorator("endTime", {
                  initialValue: undefined,
                  rules: [{ required: true, message: "请选择结束时间" }]
                })(
                  <Select style={{ width: "200px" }}>
                    {(() => {
                      const map = [];
                      for (let i = 0; i < 25; i++) {
                        map.push(
                          <Option key={i} value={i}>{`${String(i).padStart(
                            2,
                            "0"
                          )}:00`}</Option>
                        );
                      }
                      return map;
                    })()}
                  </Select>
                )}
              </FormItem>
              <FormItem label="时间间隔：" {...formItemLayout}>
                {getFieldDecorator("reserveInterval", {
                  initialValue: 0,
                  rules: [{ required: true, message: "请填写时间间隔" }]
                })(
                  <InputNumber
                    min={1}
                    max={24}
                    precision={0}
                    style={{ width: "200px" }}
                  />
                )}
              </FormItem>
              <FormItem label="每个时间点最多可预约人数：" {...formItemLayout}>
                {getFieldDecorator("count", {
                  initialValue: 30,
                  rules: [{ required: true, message: "请填写可预约人数" }]
                })(
                  <InputNumber
                    min={0}
                    max={100}
                    precision={0}
                    style={{ width: "200px" }}
                  />
                )}
              </FormItem>
              <FormItem label="您设置的可预约时间为" {...formItemLayout}>
                <span>{this.state.times}</span>
              </FormItem>
              <FormItem label=" " colon={false} {...formItemLayout}>
                <Button
                  type="primary"
                  style={{ width: "200px" }}
                  onClick={() => this.onSubmit()}
                >
                  保存
                </Button>
              </FormItem>
            </Form>
          </Spin>
        </div>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

Category.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  form: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators(
      {
        physicalSetOpenOrClose,
        reserveSettingList,
        finStationByLogin,
        reserveSettingUpdate
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
