/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";

//import './index.scss';
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  Popconfirm,
  Modal,
  Radio,
  InputNumber,
  Select,
  Tooltip,
  Divider,
  Cascader,
  Popover
} from "antd";
import RoleTree from "../../../../a_component/roleTree"; // 角色树 用于选角色

// ==================
// 本页面所需action
// ==================

import {
  findAdminUserByKeys,
  addAdminUserInfo,
  deleteAdminUserInfo,
  updateAdminUserInfo,
  findAllRole,
  findAllRoleByUserId,
  assigningRole,
  findAllOrganizer,
  findAllProvince,
  findCityOrCounty,
  findStationByArea
} from "../../../../a_action/sys-action";
import { findUserInfo, myCustomers } from "../../../../a_action/info-action";
import { cashRecord } from "../../../../a_action/shop-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      Tdata: [], //推广客户所有信息
      searchUserName: "",
      searchConditions: null,
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情
      orgCodeValue: null, // 新增、修改 - 选择的组织部门对象
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      extensionShow: false, //推广客户详情是否显示
      upLoading: false, // 是否正在修改用户中
      roleTreeShow: false, // 角色树是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      userId: "", // 获取用户id
      eId: "",
      addOrUp: "add", // 当前操作是新增还是修改
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
      searchType: "", //搜索 - 用户类型
      searchMobile: "", // 搜索 - 用户手机号
      searchName: "", //搜索 - 用户真实姓名
      searchEId: "" // 搜索 - 用户e家号
    };
  }

  componentDidMount() {
    // 现在组织结构写死的，暂时不用，但接口保留
    // if((!this.props.allOrganizer) || (!this.props.allOrganizer.length)) {
    //     this.getAllOrganizer();
    // }
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

  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }

  // 根据上级区域找下级区域  获取省下面所有的市
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

  //工具 - 根据服务站地区返回服务站名称id
  getNameStationId(id) {
    const t = this.state.stations.find(item => String(item.id) === String(id));
    return t ? t.name : "";
  }

  // 工具 - 根据ID获取用户类型
  getListByModelId(id) {
    switch (String(id)) {
      case "0":
        return "经销商（体验版）";
      case "1":
        return "经销商（微创版）";
      case "2":
        return "经销商（个人版）";
      case "3":
        return "分享用户";
      case "4":
        return "普通用户";
      case "5":
        return "企业版经销商";
      case "6":
        return "企业版子账号";
      case "7":
        return "分销商";
      default:
        return "";
    }
  }

  //工具 - 省市区的拼接
  getCity(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}`;
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userName: this.state.searchUserName,
      conditions: this.state.searchConditions,
      userType: this.state.searchType,
      mobile: this.state.searchMobile ? this.state.searchMobile : "",
      realName: this.state.searchName ? this.state.searchName : "",
      userId: this.state.searchEId ? this.state.searchEId : ""
    };

    this.props.actions.findUserInfo(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true
    });
    console.log("record是：", record);
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  //搜索 - 用户类型
  onSearchType(v) {
    this.setState({
      searchType: v
    });
  }

  //搜索 - 用户手机号
  onSearchMobile(e) {
    this.setState({
      searchMobile: e.target.value || []
    });
  }

  //搜索 - 用户真实姓名
  onSearchName(c) {
    this.setState({
      searchName: c.target.value
    });
  }

  //搜索 - e家号
  onSearchEId(e) {
    this.setState({
      searchEId: e.target.value
    });
  }

  // 添加新用户模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewUsername",
      "addnewPassword",
      "addnewSex",
      "addnewAge",
      "addnewPhone",
      "addnewEmail",
      "addnewDescription",
      "addnewOrgCode",
      "addCascader"
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true,
      orgCodeValue: null
    });
  }

  // 添加新用户确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    const checks = [
      "addnewUsername",
      "addnewPassword",
      "addnewSex",
      "addnewAge",
      "addnewPhone",
      "addnewEmail",
      "addnewDescription",
      "addnewOrgCode",
      "addCascader"
    ];
    if (form.getFieldValue("addnewOrgCode") === 18) {
      // 有服务站的情况
      checks.push("addnewServiceStation");
    }

    form.validateFields(checks, (err, values) => {
      console.log("都返回的是什么；", values);
      if (err) {
        return false;
      }
      me.setState({
        addnewLoading: true
      });
      const params = {
        userName: values.addnewUsername,
        password: values.addnewPassword,
        sex: values.addnewSex,
        age: values.addnewAge || "",
        phone: values.addnewPhone || "",
        email: values.addnewEmail || "",
        orgType: values.addnewOrgCode || "",
        description: values.addnewDescription || "",
        adminIp: "",
        conditions: "0",
        stationId: values.addnewServiceStation
          ? values.addnewServiceStation.key
          : null,
        stationName: this.getNameStationId(String(values.addnewStationId)),
        province: this.getProvinceStationId(String(values.addnewStationId)),
        city: this.getCityStationId(String(values.addnewStationId)),
        region: this.getRegionStationId(String(values.addnewStationId))
      };

      me.props.actions
        .addAdminUserInfo(tools.clearNull(params))
        .then(res => {
          console.log("添加用户返回数据：", res);
          if (res.status === "0") {
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onAddNewClose();
          } else {
            message.error(res.message || "添加失败，请重试");
          }
          me.setState({
            addnewLoading: false
          });
        })
        .catch(() => {
          me.setState({
            addnewLoading: false
          });
        });
    });
  }

  // 添加新用户取消
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
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
        title: "e家号",
        dataIndex: "eId",
        key: "eId"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getListByModelId(text)
      },
      {
        title: "真实姓名",
        dataIndex: "realName",
        key: "realName"
      },
      {
        title: "手机号",
        dataIndex: "mobile",
        key: "mobile"
      },
      {
        title: "用户头像",
        dataIndex: "headImg",
        key: "headImg",
        width: 200,
        render: (text, index) => {
          if (text) {
            const img = text.split(",");
            return (
              <Popover
                key={index}
                placement="right"
                content={<img className="table-img-big" src={img[0]} />}
              >
                <img className="table-img" src={img[0]} />
              </Popover>
            );
          }
          return "";
        }
      },
      {
        title: "用户昵称",
        dataIndex: "nickName",
        key: "nickName"
      },
      {
        title: "服务站地区",
        dataIndex: "station",
        key: "station",
        render: (text, record) => {
          return `${record.province}/${record.city}/${record.region}`
            ? `${record.province}${record.city}${record.region}`
            : "";
        }
      },
      {
        title: "操作",
        key: "control",
        width: 200,
        render: (text, record) => {
          let controls = [];

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
          // controls.push(
          //     <span key="1" className="control-btn red" onClick={() => this.onUpdateClick(record)}>
          //         <Tooltip placement="top" title="健康大使">
          //             <Icon type="user" />
          //         </Tooltip>
          //     </span>
          // );
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onRoleTreeShow(record)}
            >
              <Tooltip placement="top" title="推广用户">
                <Icon type="usergroup-add" />
              </Tooltip>
            </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }

  //推广客户的详情列表
  Extend() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "e家号",
        dataIndex: "eId",
        key: "eId"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getListByModelId(text)
      },
      {
        title: "用户头像",
        dataIndex: "headImg",
        key: "headImg",
        render: (text, index) => {
          if (text) {
            const img = text.split(",");
            return (
              <Popover
                key={index}
                placement="right"
                content={<img className="table-img-big" src={img[0]} />}
              >
                <img className="table-img" src={img[0]} />
              </Popover>
            );
          }
          return "";
        }
      },
      {
        title: "用户手机号",
        dataIndex: "mobile",
        key: "mobile"
      },
      {
        title: "创建时间",
        dataIndex: "updateTime",
        key: "updateTime"
      },
      {
        title: "用户所在地",
        dataIndex: "station",
        key: "station",
        render: (text, record) => {
          return `${record.province}/${record.city}/${record.region}`
            ? `${record.province}${record.city}${record.region}`
            : "";
        }
      }
    ];
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    console.log("DATA:", data);
    if (!data) {
      return [];
    }
    return data.map((item, index) => {
      return {
        key: index,
        adminIp: item.adminIp,
        password: item.password,
        eId: item.id,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        age: item.age,
        conditions: item.conditions,
        creator: item.creator,
        createTime: item.createTime,
        description: item.description,
        email: item.email,
        orgCode: item.orgType,
        mobile: item.mobile,
        headImg: item.headImg,
        updateTime: item.updateTime,
        updater: item.updater,
        userName: item.userName,
        control: item.id,
        userId: item.eId,
        nickName: item.nickName,
        stationId: item.stationId,
        stationName: item.stationName,
        userType: item.userType,
        realName: item.realName,
        station:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        province: item.province ? item.province : "",
        city: item.city ? item.city : "",
        region: item.region ? item.region : ""
      };
    });
  }

  // 构建table所需数据
  TmakeData(Tdata) {
    console.log("推广客户信息又是什么:", Tdata);
    if (!Tdata) {
      return [];
    }
    return Tdata.map((item2, index) => {
      return {
        key: index,
        adminIp: item2.adminIp,
        password: item2.password,
        eId: item2.id,
        citys:
          item2.province && item2.city && item2.region
            ? `${item2.province}/${item2.city}/${item2.region}`
            : "",
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        age: item2.age,
        conditions: item2.conditions,
        creator: item2.creator,
        createTime: item2.createTime,
        description: item2.description,
        email: item2.email,
        orgCode: item2.orgType,
        mobile: item2.mobile,
        headImg: item2.headImg,
        updater: item2.updater,
        userName: item2.userName,
        control: item2.id,
        userId: item2.eId,
        nickName: item2.nickName,
        stationId: item2.stationId,
        stationName: item2.stationName,
        userType: item2.userType,
        updateTime: item2.updateTime,
        realName: item2.realName,
        station:
          item2.province && item2.city && item2.region
            ? `${item2.province}/${item2.city}/${item2.region}`
            : "",
        province: item2.province ? item2.province : "",
        city: item2.city ? item2.city : "",
        region: item2.region ? item2.region : ""
      };
    });
  }

  // 打开查看我的推广客户列表
  onRoleTreeShow(record) {
    const params = {
      userId: record.eId
    };
    this.props.actions.myCustomers(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          Tdata: res.data || [],
          TnowData: record,
          extensionShow: true
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
      console.log("推广客户信息是：", res.data);
    });
  }
  // 关闭我的推广客户列表
  onRoleTreeClose() {
    this.setState({
      extensionShow: false
    });
  }

  // 添加区域被改变  选择省市区后查询对应的服务站
  onAddCascader(e) {
    console.log("是什么:", e);
    const me = this;
    const { form } = me.props;
    form.resetFields(["addnewServiceStation", "upServiceStation"]);
    this.props.actions
      .findStationByArea({
        province: e[0],
        city: e[1],
        region: e[2],
        pageNum: 0,
        pageSize: 9999
      })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            stations: res.data.result
          });
        }
      });
  }

  // 添加组织被改变
  onAddOrgCodeChange(e) {
    const me = this;
    const { form } = me.props;
    form.resetFields(["addnewServiceStation"]);
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
    const addOrgCodeShow = getFieldValue("addnewOrgCode") === 18;
    const upOrgCodeShow = getFieldValue("upOrgCode") === 18;
    // console.log('code是什么：', addOrgCodeShow);
    return (
      <div>
        <div className="system-search">
          <ul className="search-ul">
            <li>
              <span style={{ marginRight: "4px" }}>e家号</span>
              <Input
                style={{ width: "172px" }}
                onChange={e => this.onSearchEId(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px" }}>用户类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.onSearchType(e)}
              >
                <Option value={0}>经销商（体验版）</Option>
                <Option value={1}>经销商（微创版）</Option>
                <Option value={2}>经销商（个人版）</Option>
                <Option value={3}>分享用户</Option>
                <Option value={4}>普通用户</Option>
                <Option value={5}>企业版经销商</Option>
                <Option value={6}>企业版子账号</Option>
                <Option value={7}>分销商</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "4px" }}>真实姓名</span>
              <Input
                style={{ width: "172px" }}
                onChange={e => this.onSearchName(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px" }}>手机号</span>
              <Input
                onChange={e => this.onSearchMobile(e)}
                style={{ width: "172px" }}
              />
            </li>
            <li>
              <Button
                icon="search"
                type="primary"
                onClick={() => this.onSearch()}
              >
                搜索
              </Button>
            </li>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
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
        {/* 查看用户详情模态框 */}
        <Modal
          title="用户信息详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="e家号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.eId : ""}
            </FormItem>
            <FormItem label="用户类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getListByModelId(this.state.nowData.userType)
                : ""}
            </FormItem>
            <FormItem label="真实姓名" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.realName : ""}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.mobile : ""}
            </FormItem>
            <FormItem label="用户头像" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.headImg
                ? this.state.nowData.headImg.split(",").map((item, index) => {
                    return (
                      <Popover
                        key={index}
                        placement="right"
                        content={<img className="table-img-big" src={item} />}
                      >
                        <img className="small-img" src={item} />
                      </Popover>
                    );
                  })
                : ""}
            </FormItem>
            <FormItem label="用户昵称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.nickName : ""}
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
          </Form>
        </Modal>
        {/* 推广客户详情 */}
        <Modal
          title="推广客户信息详情"
          width="950px"
          visible={this.state.extensionShow}
          onOk={() => this.onRoleTreeClose()}
          onCancel={() => this.onRoleTreeClose()}
        >
          <div className="system-table">
            <Table
              columns={this.Extend()}
              dataSource={this.TmakeData(this.state.Tdata)}
              bordered={true}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

Manager.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  allRoles: P.any,
  allOrganizer: P.any,
  citys: P.array
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
  state => ({
    allRoles: state.sys.allRoles,
    allOrganizer: state.sys.allOrganizer,
    citys: state.sys.citys
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findAdminUserByKeys,
        addAdminUserInfo,
        deleteAdminUserInfo,
        updateAdminUserInfo,
        findAllRole,
        findAllRoleByUserId,
        assigningRole,
        findAllOrganizer,
        findAllProvince,
        findCityOrCounty,
        findStationByArea,
        findUserInfo,
        myCustomers
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
