/* List 服务站/服务站管理 */

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
  Icon,
  Input,
  Popconfirm,
  Table,
  DatePicker,
  message,
  Modal,
  Radio,
  Tooltip,
  Select,
  Divider,
  Cascader
} from "antd";
import "./index.scss";
import moment from "moment";
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
  findAllProvince,
  findStationByArea,
  findCityOrCounty,
  findProductTypeByWhere
} from "../../../../a_action/sys-action";
import {
  findProductLine,
  addProductLine,
  updateProductLine,
  deleteStation,
  editProductLine,
  warning,
  onOk
} from "../../../../a_action/shop-action";
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
      data: [], // 当前页面全部数据
      stations: [], // 当前省市区下面的服务站
      productTypes: [], // 所有的产品类型
      searchTypeId: undefined, // 搜索 - 产品类型
      searchName: "", // 搜索 - 状态
      searchAddress: [], // 搜索 - 地址
      searchId: "", // 搜索 - 体检仪型号
      searchDeviceId: "", // 搜索 - 设备id
      addOrUp: "add", // 当前操作是新增还是修改
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [] // 符合Cascader组件的城市数据
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

  // 工具 - 根据产品类型ID返回产品类型名称
  getNameByTypeId(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  //工具 - 根据服务站地区返回服务站名称id
  getStationId(id) {
    const t = this.state.data.find(item => String(item.id) === String(id));
    return t ? t.id : "";
  }

  //工具 - 根据服务站地区返回服务站名称id
  getNameStationId(id) {
    const t = this.state.stations.find(item => String(item.id) === String(id));
    return t ? t.name : "";
  }

  //工具 - 根据服务站地区返回电话id
  getPhoneStationId(id) {
    const t = this.state.stations.find(item => String(item.id) === String(id));
    return t ? t.phone : "";
  }

  //工具 - 根据服务站地区返回省
  getProvinceStationId(id) {
    const t = this.state.stations.find(item => String(item.id) === String(id));
    return t ? t.province : "";
  }

  //工具 - 根据服务站地区返回市
  getCityStationId(id) {
    const t = this.state.stations.find(item => String(item.id) === String(id));
    return t ? t.city : "";
  }

  //工具 - 根据服务站地区返回区
  getRegionStationId(id) {
    const t = this.state.stations.find(item => String(item.id) === String(id));
    return t ? t.region : "";
  }

  // 工具 - 根据ID获取用户来源名字
  getNameByModelId(id) {
    switch (String(id)) {
      case "1":
        return "APP 预约";
      case "2":
        return "公众号预约";
      case "3":
        return "后台添加";
      default:
        return "";
    }
  }

  //工具
  getCity(s, c, q) {
    if (!s) {
      return " ";
    }
    return `${s}/${c}/${q}`;
  }

  // 搜索 - 产品类型输入框值改变时触发
  onSearchTypeId(typeId) {
    this.setState({
      searchTypeId: typeId
    });
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: _.cloneDeep(v),
    });
  }
  
  // 搜索 - 结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: _.cloneDeep(v)
    });
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      online: this.state.searchName,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      hraDeviceType: this.state.searchId,
      productType: this.state.searchTypeId,
      deviceId: this.state.searchDeviceId,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : "",
    };
    this.props.actions.findProductLine(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.soPage.result || [],
          productTypes: res.data.ptList,
          pageNum,
          pageSize,
          total: res.data.soPage.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
      console.log("是谁:", res.data.ptList);
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
      pageSize: 9999,
      phone: "",
      name: ""
    };
    this.props.actions.findStationByArea(params).then(res => {
      if (res.status === "0") {
        this.setState({
          stations: res.data.result
        });
      }
    });
  }

  // 下线或上线
  onUpdateClick2(record) {
    console.log("LO:", record.deviceStatus);
    const params = {
      onlineId: Number(record.id),
      deviceStatus: record.deviceStatus ? 1 : 2
    };
    this.props.actions
      .updateProductLine(params)
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

  // 删除某一条数据
  onDeleteClick(record) {
    const params = {
      id: Number(record.id),
      deviceStatus: record.deviceStatus ? 2 : 1,
      deviceId:record.deviceId,
    };
    this.props.actions.deleteStation(params).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  // 导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出订单对账列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      online: this.state.searchName,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      hraDeviceType: this.state.searchId,
      productType: this.state.searchTypeId,
      deviceId: this.state.searchDeviceId,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : "",
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/product/online/export`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
    
    const newElement3 = document.createElement("input");
    if (params.online) {
      newElement3.setAttribute("name", "online");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.online);
      form.appendChild(newElement3);
    }
    
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
    
    const newElement7 = document.createElement("input");
    if (params.hraDeviceType) {
      newElement7.setAttribute("name", "hraDeviceType");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.hraDeviceType);
      form.appendChild(newElement7);
    }
    
    const newElement8 = document.createElement("input");
    if (params.productType) {
      newElement8.setAttribute("name", "productType");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.productType);
      form.appendChild(newElement8);
    }
    
    const newElement9 = document.createElement("input");
    if (params.deviceId) {
      newElement9.setAttribute("name", "deviceId");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.deviceId);
      form.appendChild(newElement9);
    }
    
    const newElement10 = document.createElement("input");
    if (params.minTime) {
      newElement10.setAttribute("name", "minTime");
      newElement10.setAttribute("type", "hidden");
      newElement10.setAttribute("value", params.minTime);
      form.appendChild(newElement10);
    }
    
    const newElement11 = document.createElement("input");
    if (params.maxTime) {
      newElement11.setAttribute("name", "maxTime");
      newElement11.setAttribute("type", "hidden");
      newElement11.setAttribute("value", params.maxTime);
      form.appendChild(newElement11);
    }
    form.submit();
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
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

  // 产品上线模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewId",
      "addnewCitys",
      "addnewStationId",
      "addnewStationName",
      "addnewStationTel",
      "addnewProvince",
      "addnewCity",
      "addnewRegion",
      "addnewContactPerson",
      "addnewContactPhone",
      "addnewTypeId",
      "addnewUnittype"
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true
    });
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("哪个地：", record.citys);
    form.resetFields(["addnewCitys", "addnewStationName", "addnewStationId"]);
    form.setFieldsValue({
      addnewId: String(record.deviceId),
      addnewUnittype: record.deviceType,
      addnewTypeId: record.productType
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true
    });
  }

  // 添加或修改确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewId",
        "addnewCitys",
        "addnewStationId",
        "addnewStationName",
        "addnewStationTel",
        "addnewProvince",
        "addnewCity",
        "addnewRegion",
        "addnewContactPerson",
        "addnewContactPhone",
        "addnewTypeId",
        "addnewUnittype"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });
        console.log("区域是什么；", values.addnewCitys);
        console.log("具体服务站名称是：", values.addnewStationId);

        const params = {
          id: Number(values.addnewId),
          stationId: Number(values.addnewStationId),
          productType: Number(values.addnewTypeId),
          deviceStatus: "2",
          deviceId: String(values.addnewId),
          deviceType: Number(values.addnewUnittype),
          stationName: this.getNameStationId(String(values.addnewStationId)),
          stationTel: this.getPhoneStationId(String(values.addnewStationId)),
          province: this.getProvinceStationId(String(values.addnewStationId)),
          city: this.getCityStationId(String(values.addnewStationId)),
          region: this.getRegionStationId(String(values.addnewStationId))
        };

        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addProductLine(tools.clearNull(params))
            .then(res => {
              if (res.status === "0") {
                me.setState({
                  addnewLoading: false
                });
                this.onGetData(this.state.pageNum, this.state.pageSize);
                this.onAddNewClose();
              } else {
                message.error(res.message || "操作失败");
                this.onAddNewClose();
              }
            })
            .catch(() => {
              this.onAddNewClose();
            });
        } else {
          params.id = this.state.nowData.id;
          me.props.actions
            .editProductLine(params)
            .then(res => {
              //修改
              if (res.status === "0") {
                me.setState({
                  addnewLoading: false
                });
                this.onGetData(this.state.pageNum, this.state.pageSize);
                this.onAddNewClose();
              } else {
                message.error(res.message || "操作失败");
                this.onAddNewClose();
              }
            })
            .catch(() => {
              this.onAddNewClose();
            });
        }
      }
    );
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  //搜索 - 产品状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  //搜索 - 体检仪型号输入框值改变时触发
  searchIdChange(e) {
    this.setState({
      searchId: e
    });
  }

  //搜索 - 体检仪id输入框值改变时触发
  searchDeviceIdChange(e) {
    this.setState({
      searchDeviceId: e.target.value
    });
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
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
        render: text => this.getNameByTypeId(text)
      },
      {
        title: "服务站地区",
        dataIndex: "station",
        key: "station",
        render: (text, record) => {
          return `${record.province}/${record.city}/${record.region}`;
        }
      },
      {
        title: "服务站名称",
        dataIndex: "stationName",
        key: "stationName"
      },
      {
        title: "联系方式",
        dataIndex: "stationTel",
        key: "stationTel"
      },
      {
        title: "设备id",
        dataIndex: "deviceId",
        key: "deviceId"
      },
      {
        title: "设备型号",
        dataIndex: "deviceType",
        key: "deviceType",
        render: text =>
          String(text) === "1" ? (
            <span>体检仪一号</span>
          ) : (
            <span>体检仪二号</span>
          )
      },
      {
        title: "上线时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "状态",
        dataIndex: "deviceStatus",
        key: "deviceStatus",
        render: text =>
          String(text) === "1" ? (
            <span style={{ color: "green" }}>已上线</span>
          ) : (
            <span style={{ color: "red" }}>未上线</span>
          )
      },
      {
        title:'最后修改时间',
        dataIndex:'updateTime',
        key:'updateTime'
      },
      {
        title: "操作",
        key: "control",
        width: 150,
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
          record.deviceStatus === 2 &&
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
          record.deviceStatus === 2 &&
            controls.push(
              <span
                key="3"
                className="control-btn blue"
                onClick={() => this.onUpdateClick2(record)}
              >
                <Tooltip placement="top" title="上线">
                  <Icon type="caret-up" />
                </Tooltip>
              </span>
            );
          record.deviceStatus === 1 &&
            controls.push(
              <span
                key="4"
                className="control-btn red"
                onClick={() => this.onUpdateClick2(record)}
              >
                <Tooltip placement="top" title="下线">
                  <Icon type="caret-down" />
                </Tooltip>
              </span>
            );
          record.deviceStatus === 2 &&
            controls.push(
              <Popconfirm
                key="5"
                title="确定删除吗?"
                onConfirm={() => this.onDeleteClick(record)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn red">
                  <Tooltip placement="top" title="删除">
                    <Icon type="delete" />
                  </Tooltip>
                </span>
              </Popconfirm>
            );

          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider type="vertical" key={`line${index}`} />);
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
        address: item.address,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        typeId: item.typeId,
        station: item.station,
        typeName: this.getNameByTypeId(item.typeId),
        stationId: this.getStationId,
        stationName: item.stationName,
        stationTel: item.stationTel,
        companyName: item.station.companyName,
        province: item.province,
        city: item.city,
        region: item.region,
        contactPhone: item.contactPhone,
        dayCount: item.dayCount,
        name: item.name,
        state: item.state,
        updateTime:item.updateTime,
        deviceStatus: item.deviceStatus,
        onlineId: item.onlineId,
        deviceType: item.deviceType,
        deviceId: item.deviceId,
        createTime: item.createTime,
        productType: item.productType
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
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };
    console.log("是啥：", form.getFieldValue("addnewTypeId"));
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span style={{ marginRight: "10px" }}>产品类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.onSearchTypeId(e)}
              >
                {this.state.productTypes.map((item, index) => {
                  return (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>服务站地区</span>
              <Cascader
                placeholder="请选择服务区域"
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
                changeOnSelect
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>体检仪型号</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchIdChange(e)}
              >
                <Option value={1}>体检仪一号</Option>
                <Option value={2}>体检仪二号</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchNameChange(e)}
              >
                <Option value={2}>未上线</Option>
                <Option value={1}>已上线</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>设备id</span>
              <Input
                style={{ width: "172px", marginRight: "10px" }}
                placeholder="请输入设备id"
                onChange={e => this.searchDeviceIdChange(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>上线时间</span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchBeginTime(e)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchEndTime(e)}
                onOk={onOk}
              />
            </li>
            <li style={{ width: "80px", marginRight: "15px" }}>
              <Button
                icon="search"
                type="primary"
                onClick={() => this.onSearch()}
              >
                搜索
              </Button>
            </li>
            <li>
              <Button icon="download" type="primary" onClick={()=>this.onExport()}>
                导出
              </Button>
            </li>
            <li>
              <ul className="search-func">
                <li style={{ marginLeft: "10px" }}>
                  <Button type="primary" onClick={() => this.onAddNewShow()}>
                    产品上线
                  </Button>
                </li>
              </ul>
             </li>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
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
          title={this.state.addOrUp === "add" ? "设备上线" : "修改设备上线"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="服务站地区" {...formItemLayout}>
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
                    message: "请选择服务站名称"
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
            <FormItem label="服务站公司名称" {...formItemLayout}>
              {getFieldDecorator("addnewStationName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请选择服务站公司名称"
                  }
                ]
              })(
                <Select placeholder="请选择服务站公司名称">
                  {this.state.stations.map((item, index) => (
                    <Option key={index} value={`${item.id}`}>
                      {item.companyName}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select placeholder="请选择产品类型">
                  {this.state.productTypes.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="设备型号" {...formItemLayout}>
              {getFieldDecorator("addnewUnittype", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择设备型号" }]
              })(
                <Select placeholder="请选择体检仪型号">
                  <Option value={1}>体检仪一号</Option>
                  <Option value={2}>体检仪二号</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="设备id" {...formItemLayout}>
              {getFieldDecorator("addnewId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入设备id" }]
              })(<Input placeholder="请输入设备id" />)}
            </FormItem>
          </Form>
        </Modal>
        {/* 查看详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByTypeId(this.state.nowData.productType)
                : ""}
            </FormItem>
            <FormItem label="服务站地区" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getCity(
                    this.state.nowData.province,
                    this.state.nowData.city,
                    this.state.nowData.region
                  )
                : ""}
            </FormItem>
            <FormItem label="服务站名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.stationName : ""}
            </FormItem>
            <FormItem label="联系方式" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.stationTel : ""}
            </FormItem>
            <FormItem label="设备id" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.deviceId : ""}
            </FormItem>
            <FormItem label="设备型号" {...formItemLayout}>
              {!!this.state.nowData ? (
                String(this.state.nowData.deviceType) === "1" ? (
                  <span>体检仪一号</span>
                ) : (
                  <span>体检仪二号</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="上线时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                String(this.state.nowData.deviceStatus) === "1" ? (
                  <span style={{ color: "green" }}>已上线</span>
                ) : (
                  <span style={{ color: "red" }}>未上线</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="最后修改时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updateTime : ''}
            </FormItem>
          </Form>
        </Modal>
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
        findAllProvince,
        findCityOrCounty,
        findStationByArea,
        editProductLine,
        updateProductLine,
        deleteStation,
        findProductTypeByWhere,
        findProductLine,
        addProductLine,
        warning
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
