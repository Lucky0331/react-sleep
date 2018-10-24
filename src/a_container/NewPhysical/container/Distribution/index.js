/* List 体检管理/体检卡管理/体检卡分配 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import moment from "moment";
import P from "prop-types";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  Icon,
  Input,
  Tabs,
  Table,
  message,
  Modal,
  Radio,
  Tooltip,
  Select,
  DatePicker,
  Divider,
  Cascader
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
  findReserveList,
  addProduct,
  upReserveList,
  deleteProduct,
  deleteImage,
  findticketModelByWhere,
  addticket,
  updateTicketStatus,
  alertTicket,
  onChange,
  onOk
} from "../../../../a_action/shop-action";

import {
  findAllProvince,
  findStationByArea,
  findCityOrCounty,
  findProductTypeByWhere,
  queryStationList,
  addStationList,
  upStationList,
  delStationList
} from "../../../../a_action/sys-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      data2: [], // 当前页面全部数据 - 分配详情
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      productModelIds: [], // 所有的体检卡型号
      searchTicketNo: "", // 搜索 - 体检卡号
      searchAddress: [], // 搜索 - 地址
      searchTicketModel: undefined, // 搜索 - 体检卡型号
      searchStationName: "", //搜索 - 关键字搜索
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      addOrUp: "add", // 当前操作是新增还是修改
      addnewModalShow: false, // 添加新用户模态框是否显示
      UpdateModalShow: false,//修改的模态框出现
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // F卡分配总共多少条数据
      total2: 0, // 分配详情总共多少条数据
      fileList: [], // 产品图片已上传的列表
      fileListDetail: [], // 详细图片已上传的列表
      fileLoading: false, // 产品图片正在上传
      fileDetailLoading: false, // 详细图片正在上传
      citys: [], // 符合Cascader组件的城市数据
      stations: [], // 当前省市区下面的服务站
      searchState: "", // 搜索 - 是否禁用
      searchExpire: "", // 搜索 - 是否到期
      searchSurplus: "" ,//搜索剩余可用次数
      tabKey:1,//tab值
    };
  }

  componentDidMount() {
    if (!this.props.citys.length) {
      // 获取所有省，全局缓存
      this.getAllCity0();
    } else {
      this.setState({
        citys: this.props.citys.map((item, index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
    this.getAllticketModel(); // 获取所有的体检卡型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  componentWillReceiveProps(nextP) {
    if (nextP.citys !== this.props.citys) {
      this.setState({
        citys: nextP.citys.map((item, index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
  }
  
  //运营数据 tab操作
  onSearchJump(e){
    if(e==1){
      this.onGetData(1, this.state.pageSize);
    }else if(e==2) {
      this.onGetDataDetail(1,this.state.pageSize);
    }
    this.setState({
      tabKey:e
    })
  }

  // 查询当前页面所需列表数据 - F卡分配
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      isExpire: this.state.searchExpire,
      surplus: this.state.searchSurplus,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      mobile: this.state.searchMobile,
      code: this.state.searchCode,
      state: this.state.searchState,
      stationName: this.state.searchStationName,
      ticketNo: this.state.searchTicketNo,
      ticketModel: this.state.searchTicketModel,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59 `
        : ""
    };
    this.props.actions.findReserveList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.ticketPage.result || [],
          pageNum,
          pageSize,
          total: res.data.ticketPage.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - F卡分配详情
  onGetDataDetail(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      isExpire: this.state.searchExpire,
      surplus: this.state.searchSurplus,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      mobile: this.state.searchMobile,
      code: this.state.searchCode,
      state: this.state.searchState,
      stationName: this.state.searchStationName,
      ticketNo: this.state.searchTicketNo,
      ticketModel: this.state.searchTicketModel,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59 `
        : ""
    };
    this.props.actions.findReserveList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data.ticketPage.result || [],
          pageNum,
          pageSize,
          total2: res.data.ticketPage.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  //获取所有的体检卡型号
  getAllticketModel() {
    this.props.actions
      .findticketModelByWhere({ pageNum: 0, pageSize: 9999, typeId: 5 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productModelIds: res.data
          });
        }
      });
  }

  // 工具 - 根据有效期type和num组合成有效期
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0":
        return "长期有效";
      case "1":
        return `${time}日`;
      case "2":
        return `${time}月`;
      case "3":
        return `${time}年`;
      default:
        return "";
    }
  }

  //工具 - 根据状态返回禁用状态
  Disable(id) {
    switch (String(id)) {
      case "1":
        return "未使用";
      case "2":
        return "已使用";
      case "3":
        return "已禁用";
      case "4":
        return "已过期";
      case "5":
        return "已预约";
    }
  }
  
  //是否禁用
  ticketStatus(id) {
    switch (String(id)) {
      case "1":
        return "未禁用";
      case "3":
        return "已禁用";
      case "4":
        return "已过期";
    }
  }

  //工具 - 根据服务站地区返回服务站名称id
  getStationId(id) {
    const t = this.state.data.find(item => String(item.id) === String(id));
    return t ? t.name : "";
  }

  //搜索 - 是否禁用输入框值改变时触发
  searchTicketStatusChange(e) {
    this.setState({
      searchState: e
    });
  }

  //搜索 - 关键字搜索
  searchStationNameChange(e) {
    this.setState({
      searchStationName: e.target.value
    });
  }

  //搜索 - 体检卡号搜索
  searchTicketNo(e) {
    this.setState({
      searchTicketNo: e.target.value
    });
  }

  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    this.setState({
      searchBeginTime: v
    });
  }

  // 搜索 - 结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: v
    });
  }

  // 搜索 - 是否到期
  searchExpireChange(e) {
    this.setState({
      searchExpire: e
    });
  }

  //搜索 - 剩余可用次数
  searchSurplusChange(e) {
    this.setState({
      searchSurplus: e.target.value
    });
  }

  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }

  // 获取某省下面的市
  getAllCitySon(selectedOptions) {
    console.log("SSS", selectedOptions);
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    this.props.actions
      .findCityOrCounty({
        parentId: selectedOptions[selectedOptions.length - 1].id
      })
      .then(res => {
        if (res.status === "0") {
          targetOption.children = res.data.map((item, index) => {
            return {
              id: item.id,
              value: item.areaName,
              label: item.areaName,
              isLeaf: item.level === 2,
              key: index
            };
          });
        }
        targetOption.loading = false;
        this.setState({
          citys: [...this.state.citys]
        });
      });
  }

  // 选择省市区后查询对应的服务站
  onCascaderChange(v) {
    console.log("是什么：", v);
    const params = {
      province: v[0],
      city: v[1],
      region: v[2],
      pageNum: 0,
      pageSize: 9999
    };
    this.props.actions.findStationByArea(params).then(res => {
      if (res.status === "0") {
        this.setState({
          stations: res.data.result
        });
      }
    });
  }

  // 搜索 - F卡分配
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  // 搜索 - F卡分配详情
  onSearchDetail() {
    this.onGetDataDetail(1, this.state.pageSize);
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchStationName: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchSurplus: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchTicketNo: ""
    });
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(v) {
    this.setState({
      searchAddress: v
    });
  }

  // 搜索 - 体检卡型号输入框值改变时触发
  searchTicketModelChange(v) {
    this.setState({
      searchTicketModel: v
    });
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log('详情有什么啊：',record)
    this.setState({
      nowData: record,
      queryModalShow: true
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  // 启用或禁用
  onUpdateClick2(record) {
    const params = {
      ticketId: Number(record.id)
    };

    this.props.actions
      .updateTicketStatus(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  // 添加分配体检卡模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewCitys",
      "addnewName",
      "addnewTypeId",
      "addnewTypeCode",
      "addnewSaleMode",
      "addnewDisabled",
      "addnewPhone",
      "addnewSelfStation",
      "addnewIsExpire",
      "addnewStationId",
      "addnewProductModelId",
      "addnewCardCount"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
      addnewModalShow: true
    });
  }
  
  // 添加模态框的确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewCitys",
        "addnewCode",
        "addnewName",
        "addnewIdCard",
        "addnewMobile",
        "addnewSex",
        "addnewHeight",
        "addnewWeight",
        "addnewPhone",
        "addnewDisabled",
        "addnewSelfStation",
        "addnewIsExpire",
        "addnewStationId",
        "addnewProductModelId",
        "addnewCardCount"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        console.log("具体服务站名称是：", values.addnewStationId);
        const params = {
          code: values.addnewCode,
          name: values.addnewName,
          idCard: values.addnewIdCard,
          mobile: values.addnewMobile,
          sex: values.addnewSex,
          phone: values.addnewPhone || "",
          height: values.addnewHeight,
          weight: values.addnewWeight,
          disabled: values.addnewDisabled,
          selfStation: values.addnewSelfStation,
          isExpire: values.addnewIsExpire,
          stationId: values.addnewStationId,
          productModelId: values.addnewProductModelId,
          cardCount: values.addnewCardCount
        };
        me.props.actions
          .addticket(tools.clearNull(params))
          .then(res => {
            me.setState({
              addnewLoading: false
            });
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onAddNewClose();
          })
          .catch(() => {
            me.setState({
              addnewLoading: false
            });
          });
      }
    );
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false,
      UpdateModalShow:false
    });
  }
  
  //修改某一条数据模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      UpTime: record.validEndTime ? new moment(record.validEndTime) : undefined,
      upAddCount: record.ticketNo,
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      UpdateModalShow: true,
    });
  }
  
  // 确定修改某一条数据
  onUpdateOk() {
    const me = this;
    const { form } = me.props;
    console.log('是什么是：',me)
    form.validateFields(
      ["UpTime","upAddCount"],
      (err, values) => {
      if (err) {
        return;
      }
      console.log("values:", values);
      me.setState({
        upLoading: true
      });
      const params = {
        ticketId: me.state.nowData.id,
        validEnd:`${tools.dateToStr(values.UpTime._d)}`, //更新分配时间
      };
      this.props.actions
        .alertTicket(params)
        .then(res => {
          if (res.status === "0") {
            me.setState({
              addnewLoading: false
            });
            message.success(res.message || "修改成功");
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onAddNewClose();
          } else {
            message.error(res.message || "修改失败，请重试");
          }
        })
        .catch(() => {
          me.setState({
            upLoading: false
          });
        });
    }
    );
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }
  
  // 表单页码改变 - F卡分配详情
  onTablePageChangeDetail(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetDataDetail(page, pageSize);
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "服务站地区",
        dataIndex: "station",
        key: "station",
        render: (text, record) => {
          return record.station && record.station.province
            ? `${record.station.province}/${record.station.city}/${
                record.station.region
              }`
            : "";
        }
      },
      {
        title: "服务站名称",
        dataIndex: "station.name",
        key: "station.name"
      },
      {
        title: "体检卡号",
        dataIndex: "ticketNo",
        key: "ticketNo"
      },
      {
        title: "体检卡型号",
        dataIndex: "ticketType",
        key: "ticketType"
      },
      {
        title: "有效期",
        dataIndex: "timeLimitNum",
        key: "timeLimitNum",
        render: (text, record) =>
          this.getNameForInDate(text, record.timeLimitType)
      },
      {
        title: "到期时间",
        dataIndex: "validEndTime",
        key: "validEndTime"
      },
      {
        title: "是否到期",
        dataIndex: "hasExpire",
        key: "hasExpire",
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "red" }}>已到期</span>
          ) : (
            <span style={{ color: "green" }}>未到期</span>
          )
      },
      {
        title: "总可用次数",
        dataIndex: "total",
        key: "total"
      },
      {
        title: "剩余可用次数",
        dataIndex: "hraCard.productModel.useCount",
        key: "hraCard.productModel.useCount"
      },
      {
        title: "是否禁用",
        dataIndex: "ticketStatus",
        key: "ticketStatus",
        render: text => this.ticketStatus(text)
      },
      {
        title: "是否限制仅该服务站使用",
        width: 110,
        dataIndex: "selfStation",
        key: "selfStation",
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "red" }}>已限制</span>
          ) : (
            <span style={{ color: "green" }}>未限制</span>
          )
      },
      {
        title: "分配时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 150,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="1"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="查看">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
            <Tooltip placement="top" title="编辑">
              <Icon type="edit" />
            </Tooltip>
          </span>
          );
          record.ticketStatus === 3 &&
            controls.push(
              <span
                key="3"
                className="control-btn blue"
                onClick={() => this.onUpdateClick2(record)}
              >
                <Tooltip placement="top" title="启用">
                  <Icon type="check-square-o" />
                </Tooltip>
              </span>
            );
          record.ticketStatus === 1 &&
            controls.push(
              <span
                key="4"
                className="control-btn red"
                onClick={() => this.onUpdateClick2(record)}
              >
                <Tooltip placement="top" title="禁用">
                  <Icon type="close-square-o" />
                </Tooltip>
              </span>
            );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        arriveTime: item.arriveTime,
        code: item.code,
        conditions: item.conditions,
        creator: item.creator,
        height: item.height,
        idCard: item.idCard,
        mobile: item.mobile,
        name: item.station.name,
        reserveTime: item.reserveTime,
        sex: item.sex,
        ticketNo: item.ticketNo,
        ticketNum: item.ticketNum,
        stationId: this.getStationId,
        stationName: this.getStationId(item.stationId),
        updateTime: item.updateTime,
        updater: item.updater,
        userSource: item.userSource,
        weight: item.weight,
        isExpire: item.isExpire,
        hasExpire: item.hasExpire,
        createTime: item.createTime,
        timeLimitNum: item.hraCard.productModel.timeLimitNum,
        timeLimitType: item.hraCard.productModel.timeLimitType,
        ticketStatus: item.ticketStatus,
        ticketModel: item.ticketModel,
        disabled: item.disabled,
        selfStation: item.selfStation,
        station: item.station,
        productModelId: item.productModelId,
        cardCount: item.cardCount,
        total: item.total,
        ticketType: item.ticketType,
        hraCard: item.hraCard,
        ticketId: item.ticketId,
        validEndTime:item.validEndTime,//到期时间
        surplus: item.surplus,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
      };
    });
  }
  
  // 构建字段 - 分配详情
  makeColumnsDetail() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "服务站名称",
        dataIndex: "station.name",
        key: "station.name"
      },
      {
        title: "体检卡号",
        dataIndex: "ticketNo",
        key: "ticketNo"
      },
      {
        title: "体检卡型号",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "有效期",
        dataIndex: "timeLimitNum",
        key: "timeLimitNum",
        render: (text, record) =>
            this.getNameForInDate(text, record.timeLimitType)
      },
      {
        title: "到期时间",
        dataIndex: "validEndTime",
        key: "validEndTime"
      },
      {
        title: "是否到期",
        dataIndex: "hasExpire",
        key: "hasExpire",
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "red" }}>已到期</span>
          ) : (
            <span style={{ color: "green" }}>未到期</span>
          )
      },
      {
        title: "总可用次数",
        dataIndex: "total",
        key: "total"
      },
      {
        title: "剩余可用次数",
        dataIndex: "hraCard.productModel.useCount",
        key: "hraCard.productModel.useCount"
      },
      {
        title: "是否禁用",
        dataIndex: "ticketStatus",
        key: "ticketStatus",
        render: text => this.ticketStatus(text)
      },
      {
        title: "是否限制仅该服务站使用",
        width: 110,
        dataIndex: "selfStation",
        key: "selfStation",
        render: text =>
            String(text) === "1" ? (
                <span style={{ color: "green" }}>已限制</span>
            ) : (
                <span style={{ color: "red" }}>未限制</span>
            )
      },
      {
        title: "分配时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 120,
        render: (text, record) => {
          const controls = [];
          controls.push(
              <span
                  key="0"
                  className="control-btn green"
                  onClick={() => this.onQueryClick(record)}
              >
              <Tooltip placement="top" title="查看">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }
  
  // 构建table所需数据
  makeDataDetail(data2) {
    console.log("data是个啥：", data2);
    return data2.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        arriveTime: item.arriveTime,
        code: item.code,
        conditions: item.conditions,
        creator: item.creator,
        height: item.height,
        idCard: item.idCard,
        mobile: item.mobile,
        name: item.hraCard.productModel.name,
        reserveTime: item.reserveTime,
        sex: item.sex,
        ticketNo: item.ticketNo,
        ticketNum: item.ticketNum,
        stationId: this.getStationId,
        stationName: this.getStationId(item.stationId),
        updateTime: item.updateTime,
        updater: item.updater,
        userSource: item.userSource,
        weight: item.weight,
        isExpire: item.isExpire,
        validEndTime: item.validEndTime,
        createTime: item.createTime,
        timeLimitNum: item.hraCard.productModel.timeLimitNum,
        timeLimitType: item.hraCard.productModel.timeLimitType,
        ticketStatus: item.ticketStatus,
        ticketModel: item.ticketModel,
        disabled: item.disabled,
        hasExpire: item.hasExpire,
        selfStation: item.selfStation,
        station: item.station,
        total: item.total,
        productModelId: item.productModelId,
        cardCount: item.cardCount,
        hraCard: item.hraCard,
        ticketId: item.ticketId,
        ticketType: item.ticketType,
        surplus: item.surplus,
        citys:
            item.province && item.city && item.region
                ? `${item.province}/${item.city}/${item.region}`
                : ""
      };
    });
  }

  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    };
    console.log("是啥：", this.state.citys);

    const { searchStationName } = this.state;
    const { searchSurplus } = this.state;
    const { searchTicketNo } = this.state;
    const suffix = searchStationName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix2 = searchSurplus ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix3 = searchTicketNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <Tabs type="card" onChange={(e) => this.onSearchJump(e)}>
            <TabPane tab="F卡分配" key="1">
              <div style={{ width: "100%" }}>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>服务站地区</span>
                      <Cascader
                        style={{ width: "172px" }}
                        placeholder="请选择服务区域"
                        onChange={v => this.onSearchAddress(v)}
                        options={this.state.citys}
                        loadData={e => this.getAllCitySon(e)}
                        changeOnSelect
                      />
                    </li>
                    <li>
                      <span>服务站</span>
                      <Input
                        placeholder="请输入关键字"
                        style={{ width: "172px" }}
                        value={searchStationName}
                        suffix={suffix}
                        onChange={e => this.searchStationNameChange(e)}
                      />
                    </li>
                    <li>
                      <span>是否到期</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchExpireChange(e)}
                      >
                        <Option value={0}>未到期</Option>
                        <Option value={1}>已到期</Option>
                      </Select>
                    </li>
                    <li>
                      <span>剩余可用次数</span>
                      <Input
                        placeholder="请输入剩余可用次数"
                        style={{ width: "172px" }}
                        value={searchSurplus}
                        suffix={suffix2}
                        onChange={e => this.searchSurplusChange(e)}
                      />
                    </li>
                    <li>
                      <span>是否禁用</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchTicketStatusChange(e)}
                      >
                        <Option value={1}>未禁用</Option>
                        <Option value={4}>已禁用</Option>
                      </Select>
                    </li>
                    <li>
                      <span>体检卡型号</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        value={this.state.searchTicketModel}
                        style={{ width: "172px" }}
                        onChange={e => this.searchTicketModelChange(e)}
                      >
                        {this.state.productModelIds.map((item, index) => {
                          return (
                            <Option key={index} value={item.id}>
                              {item.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </li>
                    <li>
                      <span>体检卡号</span>
                      <Input
                        placeholder="请输入体检卡号"
                        style={{ width: "172px" }}
                        value={searchTicketNo}
                        suffix={suffix3}
                        onChange={e => this.searchTicketNo(e)}
                      />
                    </li>
                    <li>
                      <span>分配时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="起始时间"
                        onChange={e => this.searchBeginTime(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchEndTime(e)}
                      />
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearch()}
                      >
                        查询
                      </Button>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button type="primary" onClick={() => this.onAddNewShow()}>
                        分配体检卡
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumns()}
                    className="my-table"
                    scroll={{ x: 2000 }}
                    dataSource={this.makeData(this.state.data)}
                    pagination={{
                      total: this.state.total,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChange(page, pageSize)
                    }}
                  />
                </div>
                {/* 添加模态框 */}
                <Modal
                  title="体检卡分配"
                  visible={this.state.addnewModalShow}
                  onOk={() => this.onAddNewOk()}
                  onCancel={() => this.onAddNewClose()}
                  confirmLoading={this.state.addnewLoading}
                >
                  <Form>
                    <FormItem label="地区选择" {...formItemLayout}>
                      <span style={{ color: "#888" }}>
                        {this.state.nowData &&
                        this.state.addOrUp === "up" &&
                        this.state.nowData.province &&
                        this.state.nowData.city &&
                        this.state.nowData.region
                          ? `${this.state.nowData.province}/${
                              this.state.nowData.city
                            }/${this.state.nowData.region}`
                          : null}
                      </span>
                      {getFieldDecorator("addnewCitys", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请选择区域" }]
                      })(
                        <Cascader
                          placeholder="请选择服务区域"
                          options={this.state.citys}
                          loadData={e => this.getAllCitySon(e)}
                          onChange={v => this.onCascaderChange(v)}
                        />
                      )}
                    </FormItem>
                    <FormItem label="服务站名称" {...formItemLayout}>
                      {getFieldDecorator("addnewStationId", {
                        initialValue: undefined,
                        rules: [
                          {
                            required: true,
                            whitespace: true,
                            message: "请输入服务站名称"
                          }
                        ]
                      })(
                        <Select placeholder="请选择服务站名称">
                          {this.state.stations.map((item, index) => (
                            <Option key={index} value={`${item.id}`}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                    <FormItem label="体检卡型号" {...formItemLayout}>
                      {getFieldDecorator("addnewProductModelId", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请选择体检卡型号" }]
                      })(
                        <Select
                          allowClear
                          placeholder="全部"
                          value={this.state.searchTicketModel}
                        >
                          {this.state.productModelIds.map((item, index) => {
                            return (
                              <Option key={index} value={item.id}>
                                {item.name}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </FormItem>
                    <FormItem label="体检卡数量" {...formItemLayout}>
                      {getFieldDecorator("addnewCardCount", {
                        initialValue: undefined,
                        rules: [
                          { required: true, whitespace: true, message: "体检卡数量" }
                        ]
                      })(<Input placeholder="体检卡数量" />)}
                    </FormItem>
                    <FormItem label="是否限制仅该服务站可用" {...formItemLayout}>
                      {getFieldDecorator("addnewSelfStation", {
                        initialValue: undefined,
                        rules: [
                          { required: true, message: "请选择是否限制仅该服务站可用" }
                        ]
                      })(
                        <Select>
                          <Option value={1}>是</Option>
                          <Option value={0}>否</Option>
                        </Select>
                      )}
                    </FormItem>
                    <FormItem label="设置是否禁用" {...formItemLayout}>
                      {getFieldDecorator("addnewDisabled", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请选择是否禁用" }]
                      })(
                        <Select>
                          <Option value={1}>是</Option>
                          <Option value={0}>否</Option>
                        </Select>
                      )}
                    </FormItem>
                    <FormItem label="短信通知手机号" {...formItemLayout}>
                      {getFieldDecorator("addnewPhone", {
                        initialValue: undefined,
                        rules: [
                          {
                            validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                if (!tools.checkPhone(v)) {
                                  callback("请输入有效的手机号码");
                                }
                              }
                              callback();
                            }
                          }
                        ]
                      })(<Input placeholder="请输入手机号码" />)}
                    </FormItem>
                  </Form>
                </Modal>
                {/* 修改模态框 */}
                <Modal
                  title="体检卡分配"
                  visible={this.state.UpdateModalShow}
                  onOk={() => this.onUpdateOk()}
                  onCancel={() => this.onAddNewClose()}
                  confirmLoading={this.state.addnewLoading}
                >
                  <Form>
                    <FormItem label="体检卡号" {...formItemLayout}>
                      {!! this.state.nowData ? this.state.nowData.ticketNo : ''}
                    </FormItem>
                    <FormItem label="到期时间" {...formItemLayout}>
                      {getFieldDecorator("UpTime", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请修改到期时间" }]
                      })(
                        <DatePicker
                          style={{ width: "100%" }}
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="请修改到期时间"
                          onChange={onChange}
                          onOk={onOk}
                        />
                      )}
                    </FormItem>
                  </Form>
                </Modal>
                {/* 查看详情模态框 */}
                <Modal
                  title="F卡分配"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                >
                  <Form>
                    <FormItem label="服务站名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.name : ""}
                    </FormItem>
                    <FormItem label="体检卡号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.ticketNo : ""}
                    </FormItem>
                    <FormItem label="分配日期" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.createTime : ""}
                    </FormItem>
                    <FormItem label="到期日期" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.validEndTime : ""}
                    </FormItem>
                    <FormItem label="有效期" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getNameForInDate(
                            this.state.nowData.timeLimitNum,
                            this.state.nowData.timeLimitType
                          )
                        : ""}
                    </FormItem>
                    <FormItem label="是否到期" {...formItemLayout}>
                      {!!this.state.nowData ? (
                        Boolean(this.state.nowData.hasExpire) === true ? (
                          <span style={{ color: "red" }}>已到期</span>
                        ) : (
                          <span style={{ color: "green" }}>未到期</span>
                        )
                      ) : (
                        ""
                      )}
                    </FormItem>
                    <FormItem label="是否禁用" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.ticketStatus(this.state.nowData.ticketStatus)
                        : ""}
                    </FormItem>
                    <FormItem label="是否限制仅该服务站使用" {...formItemLayout}>
                      {!!this.state.nowData ? (
                        String(this.state.nowData.selfStation) === "1" ? (
                          <span style={{ color: "green" }}>已限制</span>
                        ) : (
                          <span style={{ color: "red" }}>未限制</span>
                        )
                      ) : (
                        ""
                      )}
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
            <TabPane tab="F卡分配详情" key="2">
              <div style={{ width: "100%" }}>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>体检卡型号</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        value={this.state.searchTicketModel}
                        style={{ width: "172px" }}
                        onChange={e => this.searchTicketModelChange(e)}
                      >
                        {this.state.productModelIds.map((item, index) => {
                          return (
                            <Option key={index} value={item.id}>
                              {item.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </li>
                    <li>
                      <span>体检卡号</span>
                      <Input
                        placeholder="请输入体检卡号"
                        style={{ width: "172px" }}
                        value={searchTicketNo}
                        suffix={suffix3}
                        onChange={e => this.searchTicketNo(e)}
                      />
                    </li>
                    <li>
                      <span>是否到期</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchExpireChange(e)}
                      >
                        <Option value={0}>未到期</Option>
                        <Option value={1}>已到期</Option>
                      </Select>
                    </li>
                    <li>
                      <span>剩余可用次数</span>
                      <Input
                        placeholder="请输入剩余可用次数"
                        style={{ width: "172px" }}
                        onChange={e => this.searchSurplusChange(e)}
                        value={searchSurplus}
                        suffix={suffix2}
                      />
                    </li>
                    <li>
                      <span>是否禁用</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchTicketStatusChange(e)}
                      >
                        <Option value={1}>未禁用</Option>
                        <Option value={4}>已禁用</Option>
                      </Select>
                    </li>
                    <li>
                      <span>分配时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="起始时间"
                        onChange={e => this.searchBeginTime(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchEndTime(e)}
                      />
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchDetail()}
                      >
                        查询
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsDetail()}
                    className="my-table"
                    dataSource={this.makeDataDetail(this.state.data2)}
                    pagination={{
                      total: this.state.total2,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeDetail(page, pageSize)
                    }}
                  />
                </div>
                {/* 查看详情模态框 */}
                <Modal
                  title="F卡分配详情"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                >
                  <Form>
                    <FormItem label="服务站名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.station.name : ""}
                    </FormItem>
                    <FormItem label="体检卡号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.ticketNo : ""}
                    </FormItem>
                    <FormItem label="分配日期" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.createTime : ""}
                    </FormItem>
                    <FormItem label="到期日期" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.validEndTime : ""}
                    </FormItem>
                    <FormItem label="有效期" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getNameForInDate(this.state.nowData.timeLimitNum,this.state.nowData.timeLimitType) : ""}
                    </FormItem>
                    <FormItem label="是否到期" {...formItemLayout}>
                      {!!this.state.nowData ? (
                        Boolean(this.state.nowData.hasExpire) === true ? (
                          <span style={{ color: "red" }}>已到期</span>
                        ) : (
                          <span style={{ color: "green" }}>未到期</span>
                        )
                      ) : (
                        ""
                      )}
                    </FormItem>
                    <FormItem label="是否禁用" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.ticketStatus(this.state.nowData.ticketStatus)
                        : ""}
                    </FormItem>
                    <FormItem label="是否限制仅该服务站使用" {...formItemLayout}>
                      {!!this.state.nowData ? (
                        String(this.state.nowData.selfStation) === "1" ? (
                          <span style={{ color: "green" }}>已限制</span>
                        ) : (
                          <span style={{ color: "red" }}>未限制</span>
                        )
                      ) : (
                        ""
                      )}
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
          </Tabs>
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
  form: P.any,
  citys: P.array // 动态加载的省
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({
    citys: state.sys.citys
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findReserveList,
        addticket,
        addProduct,
        upReserveList,
        deleteProduct,
        deleteImage,
        findticketModelByWhere,
        findAllProvince,
        findStationByArea,
        updateTicketStatus,
        findCityOrCounty,
        findProductTypeByWhere,
        queryStationList,
        addStationList,
        upStationList,
        delStationList,
        alertTicket,
        onChange,
        onOk
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
