/* List 服务站/服务站管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import P from "prop-types";
import moment from "moment";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  Icon,
  InputNumber,
  Popconfirm,
  Table,
  DatePicker,
  message,
  TimePicker,
  Popover,
  Modal,
  Radio,
  Tooltip,
  Select,
  Upload,
  Divider,
  Cascader,
  Input
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import {power} from "../../../../util/data";
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
  findCityOrCounty
} from "../../../../a_action/sys-action";
import {
  findProductLine,
  addProductLine,
  updateProductLine,
  updateContract,
  downContract,
  ContractList,
  updateStation,
  findColumnCount,
  addColumnCount,
  deleteColumnCount,
  updateColumnCount,
  warning,
  deleteImage,
  onOk
} from "../../../../a_action/shop-action";
import {recordCard} from "../../../../a_action/info-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { TextArea } = Input;
const format = 'HH:mm';

class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      data2:[],//栏目数据
      stations: [], // 当前省市区下面的服务站
      productModels: [], // 所有的产品型号
      searchTypeId: undefined, // 搜索 - 产品类型
      searchContract: "", // 搜索 - 状态
      searchAddress: [], // 搜索 - 地址
      searchStationName: [], // 搜索 - 服务站名称
      searchCompanyName: [], // 搜索 - 公司名称
      searchBeginTime:'',//承包开始时间
      searchEndTime:'',//承包结束时间
      addOrUp: "add", // 当前操作是新增还是修改
      upOrDown:'up', //承包信息录入还是编辑
      upModalShow: false, // 修改承包信息录入模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      maskClose:false,//蒙层是否关闭
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      addnewModalShow:false, //添加栏目时的弹窗
      updatenewModalShow:false, //修改栏目时的弹窗
      queryModalShow: false, // 查看详情模态框是否显示
      updateModalShow:false, //承包录入信息模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [], // 符合Cascader组件的城市数据
      fileList: [], // 服务站图片已上传的列表
      fileListLan: [], // 自定义栏目图片已上传的列表
      id:'',// 栏目id
    };
  }
  
  componentDidMount() {
    if (!this.props.citys.length) {
      // 获取所有省，全局缓存
      this.getAllCity0();
    } else {
      this.setState({
        citys: this.props.citys.map((item,index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
    this.onGetData(this.state.pageNum,this.state.pageSize);
  }
  
  componentWillReceiveProps(nextP) {
    if (nextP.citys !== this.props.citys) {
      this.setState({
        citys: nextP.citys.map((item,index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
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
  getCity(s,c,q) {
    if (!s) {
      return " ";
    }
    return `${s}/${c}/${q}`;
  }
  
  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 搜索 - 服务站名称关键字
  onSearchStationName(e) {
    this.setState({
      searchStationName: e.target.value
    });
  }
  
  // 搜索 - 公司名称关键字
  onSearchCompanyName(e) {
    this.setState({
      searchCompanyName: e.target.value
    });
  }
  
  //搜索 -
  onSearchStation(e){
  
  }
  
  //搜索 - 承包上下线状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchContract: e
    });
  }
  
  // 表单页码改变
  onTablePageChange(page,pageSize) {
    console.log("页码改变：",page,pageSize);
    this.onGetData(page,pageSize);
  }
  
  // 查询当前页面所需列表数据
  onGetData(pageNum,pageSize) {
    const params = {
      pageNum,
      pageSize,
      contract: this.state.searchContract,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      stationName: this.state.searchStationName,
      companyName: this.state.searchCompanyName,
      minContractTime:this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      maxContractTime:this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : "",
    };
    this.props.actions.ContractList(tools.clearNull(params)).then(res => {
      if (res.returnCode === "0") {
        this.setState({
          data: res.messsageBody.result || [],
          pageNum,
          pageSize,
          total: res.messsageBody.total
        });
      } else {
        message.error(res.returnMessaage || "获取数据失败，请重试");
      }
    });
  }
  
  //栏目列表 数据
  onGetData2(pageNum,pageSize) {
    const params = {
      pageNum,
      pageSize,
      // stationId:this.state.nowData.id,
    };
    this.props.actions.findColumnCount(tools.clearNull(params)).then(res => {
      if (res.returnCode === "0") {
        this.setState({
          data2: res.messsageBody.result || [],
        });
      } else {
        message.error(res.returnMessaage || "获取数据失败，请重试");
      }
    });
  }
  
  // 搜索 - 承包开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    });
  }
  
  // 搜索 - 承包结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: _.cloneDeep(v)
    });
  }
  
  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }
  
  // 获取某省下面的市
  getAllCitySon(selectedOptions) {
    console.log("SSS",selectedOptions);
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    this.props.actions
      .findCityOrCounty({
        parentId: selectedOptions[selectedOptions.length - 1].id
      })
      .then(res => {
        if (res.returnCode === "0") {
          targetOption.children = res.messsageBody.map((item,index) => {
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
  
  // 添加新用户模态框出现
  onAddColumnShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields(["addnewRoleName", "addnewRoleDuty"]);
    this.setState({
      addnewModalShow: true,
      fileListLan: [],
      // nowData: record
    });
  }
  
  // 添加新的确定
  onAddColumnOk(record) {
    // console.log('里面有没有id',record)
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewColumnTitle",
        "addnewColumntextContent",
        "addnewImgs",
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });
        const params = {
          stationId:Number(this.state.nowData.id),
          title: values.addnewColumnTitle,
          textContent: values.addnewColumntextContent,
          imgs: this.state.fileListLan.map(item => item.url).join(",")
        };
        
        me.props.actions
          .addColumnCount(params)
          .then(res => {
            console.log("添加用户返回数据：", res);
            me.setState({
              addnewLoading: false
            });
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onAddColumnClose();
          })
          .catch(() => {
            me.setState({
              addnewLoading: false
            });
          });
      }
    );
  }
  
  // 添加新用户取消
  onAddColumnClose() {
    this.setState({
      addnewModalShow: false
    });
  }
  
  // 承包信息录入模态框出现
  onAddNewShow(record) {
    console.log('record出来了么：',record)
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewName",  //承包人姓名
      "addnewMobile",  //承包人手机号
      "addnewContractorIdentityNumber", //承包人身份证号
      "addnewBeginTime", //承包开始时间
      "addnewEndTime",  //承包结束时间
    ]);
    this.setState({
      upOrDown: "up",
      updateModalShow: true,
      nowData:record
    });
  }
  
  //修改承包信息录入问题
  onUpNewShow(record){
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewName: record.contractor,//承包人姓名
      addnewMobile: record.contractorPhone,// 承包人手机号
      addnewContractorIdentityNumber: record.contractorIdentityNumber ,//承包人身份证号
      addnewBeginTime:new moment(record.contractStartTime),//承包开始时间 (因为时间组件接受的是moment形式，不是字符串形式，所以需要转化)
      addnewEndTime: new moment(record.contractEndTime), //承包结束时间
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      // pullnowData:record,
      upOrDown: "down",
      updateModalShow: true,
    });
  }
  
  // 承包信息录入或者修改承包信息
  onAddNewOk(record) {
    // console.log("id是什么:",record.id);
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewName",
        "addnewMobile",
        "addnewContractorIdentityNumber",
        "addnewBeginTime",
        "addnewEndTime",
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        const params = {
          stationId:Number(this.state.nowData.id),
          contractorPhone:Number(values.addnewMobile),
          contractStartTime: `${tools.dateToStr(values.addnewBeginTime.utc()._d)}`, //开始时间
          contractEndTime: `${tools.dateToStr(values.addnewEndTime.utc()._d)}`,   //结束时间
          contractorIdentityNumber: String(values.addnewContractorIdentityNumber),
          contractor:values.addnewName,
        };
        if (this.state.upOrDown === "up") {   //录入承包信息
          me.props.actions
            .updateContract(params)
            .then(res => {
              console.log("录入承包信息返回数据：",res);
              me.setState({
                addnewLoading: false
              });
              this.onGetData(this.state.pageNum,this.state.pageSize);
              this.onAddNewClose();
            })
            .catch(() => {
              me.setState({
                addnewLoading: false
              });
            });
          } else if (this.state.upOrDown === "down"){   //修改承包信息
          // params.id = this.state.nowData.id;
          me.props.actions
            .updateContract(params)
            .then(res => {
              console.log('这个是什么：',res)
              me.setState({
                addnewLoading: false
              });
              this.onGetData(this.state.pageNum,this.state.pageSize);
              this.onAddNewClose();
            })
            .catch(() => {
              me.setState({
                addnewLoading: false
              });
            });
        }
      }
    );
    console.log('是什么啊:',record)
  }
  
  // 关闭模态框
  onAddNewClose() {
    this.setState({
      updateModalShow: false
    });
  }
  
  // 录入信息模态框取消
  onAddNewClose() {
    this.setState({
      updateModalShow: false
    });
  }
  
  
// 搜索
  onSearch() {
    this.onGetData(1,this.state.pageSize);
  }
  // 导出
  onExport() {
    this.onGetData(this.state.pageNum,this.state.pageSize);
  }
  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      id:record.id,
      queryModalShow: true
    });
    console.log('是什么详情：',record)
  }
  
  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }
  
  // 承包下线
  onUpdateDown(record) {
    const params = {
      id: Number(record.id)
    };
    this.props.actions
      .downContract(params)
      .then(res => {
        if (res.returnCode === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.returnMessaage || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const params = {
      stationId:record.id,
    };
    this.props.actions.findColumnCount(tools.clearNull(params)).then(res => {
      if (res.returnCode === "0") {
        this.setState({
          data2: res.messsageBody || [],
        });
      } else {
        message.error(res.returnMessaage || "获取数据失败，请重试");
      }
    });
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewName: record.name,
      addnewTypeId: `${record.typeId}`,
      addnewTypeCode: String(record.typeCode),
      addnewOnShelf: record.onShelf ? "1" : "0",
      addnewProductImg: record.productImg,
      addnewDetailImg: record.detailImg,
      addnewTimeLimitNum: record.timeLimitNum,
      addnewTimeLimitType: record.timeLimitType,
      addnewActivityType: record.activityType,
      addnewMobile:record.contractorPhone,
      addnewName:record.contractor,
      addnewTime:record.contractTime,
      addnewContractorIdentityNumber:record.contractorIdentityNumber,
    });
    console.log("是什么：", record);
    me.setState({
      addOrUp: "up",
      nowData: record,
      upModalShow: true,
      code: record.typeId,
    });
  }
  
  // 确定修改承包信息里的数据数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewRecommended",
        "addnewSorts",
        "addnewEstablishedTime",
        "addnewStoreArea",
        "addnewEmployeeNum",
        "addnewBusinesHoursStart",
        "addnewBusinessHoursEnd",
        "addnewImgs",
      ],
      (err, values) => {
        if (err) {
          return;
        }
        
        me.setState({
          upLoading: true
        });
        const params = {
          id: me.state.nowData.id,
          recommended: values.addnewRecommended,  // 是否推荐
          sorts:values.addnewSorts,//排序位置
          imgs: this.state.fileList.map(item => item.url).join(","), //服务站图片
          establishedTime: `${tools.dateToStr(values.addnewEstablishedTime.utc()._d)}`, //成立时间
          storeArea: values.addnewStoreArea,//门店规模
          employeeNum: values.addnewEmployeeNum,//员工数量
          businessHoursStart: `${tools.dateToStrHM(values.addnewBusinesHoursStart._d)}`,//营业开始时间
          businessHoursEnd: `${tools.dateToStrHM(values.addnewBusinessHoursEnd._d)}`, //营业结束时间
        };
        
      this.props.actions
          .updateStation(params)
          .then(res => {
            if (res.returnCode === "0") {
              message.success("修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onUpClose();
            } else {
              message.error(res.returnMessaage || "修改失败，请重试");
            }
            me.setState({
              upLoading: false
            });
          })
          .catch(() => {
            me.setState({
              upLoading: false
            });
          });
      }
    );
  }
  
  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }
  
  // 修改某一条数据 模态框出现
  onUpdateColumnClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record:", record);
    console.log('栏目id是：',record.id)
    form.setFieldsValue({
      upColumnTitle: record.title,
      upColumntextContent: record.textContent,
    });
    me.setState({
      fileListLan: record.imgs
        ? record.imgs
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // 封面图上传的列表
      updatenewModalShow: true
    });
  }
  
  // 确定修改某一条数据
  onUpColumnOk(record) {
    const me = this;
    const { form } = me.props;
    console.log('是什么是：',me)
    form.validateFields(
      ["upColumnTitle","upColumntextContent","upImgs"],
      (err, values) => {
        if (err) {
          return;
        }
        console.log("values:", values);
        me.setState({
          upLoading: true
        });
        const params = {
          staitonId: me.state.nowData.id,
          title: values.upColumnTitle,
          id:me.state.data2[0].id,
          textContent: values.upColumntextContent,
          imgs: this.state.fileListLan.map(item => item.url).join(","),
        };
        this.props.actions
          .updateColumnCount(params)
          .then(res => {
            if (res.returnCode === "0") {
              message.success("修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onUpClose();
            } else {
              message.error(res.returnMessaage || "修改失败，请重试");
            }
            me.setState({
              upLoading: false
            });
          })
          .catch(() => {
            me.setState({
              upLoading: false
              // fileList: record.typeIcon ? record.typeIcon.split(',').map((item, index) => ({ uid: index, url: item, status: 'done' })) : [],   // 标题图上传的列表
            });
          });
      }
    );
  }
  // 关闭修改某一条数据
  onUpColumnClose() {
    this.setState({
      updatenewModalShow: false
    });
  }
  
  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.deleteColumnCount({ stationColumnId: id }).then(res => {
      if (res.returnCode === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.returnMessaage || "删除失败，请重试");
      }
    });
  }
  
  // 服务站图片 - 上传中、上传成功、上传失败的回调
  onUpLoadChange(obj) {
    console.log("图片上传：", obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.messsageBody) {
        const list = _.cloneDeep(this.state.fileList);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.messsageBody;
        this.setState({
          fileList: list,
          fileLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileList);
        this.setState({
          fileList: list.filter(item => item.uid !== obj.file.uid),
          fileLoading: false
        });
        message.error("图片上传失败");
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileList);
      this.setState({
        fileList: list.filter(item => item.uid !== obj.file.uid),
        fileLoading: false
      });
      message.error("图片上传失败");
    }
  }
  
  // 服务站图片 - 上传前
  onUploadBefore(f, fl) {
    console.log("上传前：", f, fl);
    if (
        ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileList);
      newList.push(f);
      this.setState({
        fileList: newList
      });
      return true;
    }
  }
  
  // 服务站图片 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }
  
  // 真正从服务端删除商品的图片
  deleteImg(uri) {
    const temp = uri.split("/");
    const fileName = temp.splice(-1, 1);
    const params = {
      path: temp.join("/"),
      fileName
    };
    console.log("删除后的是啥？", temp.join("/"), fileName);
    this.props.actions.deleteImage(params);
  }
  
  // 列表封面图片 - 上传前
  onUploadDetailBefore(f) {
    if (
        ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileListLan);
      newList.push(f);
      this.setState({
        fileListLan: newList
      });
      return true;
    }
  }
  
  // 列表封面图片 - 上传中、成功、失败
  onUpLoadDetailChange(obj) {
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.messsageBody) {
        const list = _.cloneDeep(this.state.fileListLan);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.messsageBody;
        this.setState({
          fileListLan: list,
          fileDetailLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileListLan);
        this.setState({
          fileListLan: list.filter(item => item.uid !== obj.file.uid),
          fileDetailLoading: false
        });
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileDetailLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileListLan);
      this.setState({
        fileListLan: list.filter(item => item.uid !== obj.file.uid),
        fileLoading: false
      });
      message.error("图片上传失败");
    }
  }
  
  // 列表封面图片 - 删除
  onUpLoadDetailRemove(f) {
    const list = _.cloneDeep(this.state.fileListLan);
    this.setState({
      fileListLan: list.filter(item => item.uid !== f.uid)
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
        title: "服务站名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "公司名称",
        dataIndex: "companyName",
        key: "companyName"
      },
      {
        title:'省',
        dataIndex:'province',
        key:'province'
      },
      {
        title:'市',
        dataIndex:'city',
        key:'key'
      },
      {
        title:'区',
        dataIndex:'region',
        key:'region'
      },
      {
        title:'服务站地址',
        dataIndex:'address',
        key:'address'
      },
      {
        title: "承包状态",
        dataIndex: "contract",
        key: "contract",
        render: text =>
          Boolean(text) === true ? (
            <span style={{color: "green"}}>已承包</span>
          ) : (
            <span style={{color: "red"}}>未承包</span>
          )
      },
      {
        title:'承包时间',
        dataIndex:'contractAllTime',
        key:'contractAllTime',
      },
      {
        title: "HRA设备上线状态",
        dataIndex: "hraIsOnline",
        key: "hraIsOnline",
        render: text =>
          Boolean(text) === true ? (
            <span style={{color: "green"}}>已上线</span>
          ) : (
            <span style={{color: "red"}}>未上线</span>
          )
      },
      {
        title: "是否推荐",
        dataIndex: "recommended",
        key: "recommended",
        render: text =>
          Boolean(text) === true ? (
           <span style={{color: "green"}}>是</span>
        ) : (
           <span style={{color: "red"}}>否</span>
        )
      },
      {
        title: "操作",
        key: "control",
        fixed:"right",
        width:150,
        render: (text,record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="查看">
                <Icon type="eye"/>
              </Tooltip>
            </span>
          );
          record.contract === true &&
          controls.push(
            <span className="control-btn blue" key="1" onClick={() => this.onUpNewShow(record)}>
              <Tooltip placement="top" title="修改承包信息">
                <Icon type="setting"/>
              </Tooltip>
           </span>
          );
          record.contract === false &&
          controls.push(
            <span className="control-btn blue" key="2" onClick={() => this.onAddNewShow(record)}>
              <Tooltip placement="top" title="承包上线">
                <Icon type="caret-up"/>
              </Tooltip>
            </span>
          );
          record.contract === true &&
          controls.push(
            <span className="control-btn red">
              <Tooltip placement="top" title="承包下线" key="3" onClick={() => this.onUpdateDown(record)}>
                <Icon type="caret-down"/>
              </Tooltip>
            </span>
          );
          controls.push(
            <span className="control-btn blue" key="4" onClick={() => this.onUpdateClick(record)}>
            <Tooltip placement="top" title="编辑">
              <Icon type="edit"/>
            </Tooltip>
          </span>
          );
          const result = [];
          controls.forEach((item,index) => {
            if (index) {
              result.push(<Divider type="vertical" key={`line${index}`}/>);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }
  
  //添加栏目信息
  makeColumnsSmall(){
    const columns = [
      {
        title: "栏目标题",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "栏目文本",
        dataIndex: "textContent",
        key: "textContent"
      },
      {
        title: "栏目图片",
        dataIndex: "imgs",
        key: "imgs",
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
        title: "操作",
        key: "control",
        width: 150,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="5"
              className="control-btn blue"
              onClick={() => this.onUpdateColumnClick(record)}
            >
            <Tooltip placement="top" title="编辑">
              <Icon type="edit" />
            </Tooltip>
            </span>
          );
          controls.push(
            <Popconfirm
              key="6"
              title="确定删除吗?"
              onConfirm={() => this.onRemoveClick(record.id)}
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
              result.push(
                  <span key={`line${index}`} className="ant-divider" />
              );
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
    console.log("data是个啥：",data);
    return data.map((item,index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        province: item.province,
        typeId: item.typeId,
        station: item.station,
        name: item.name,
        person: item.person,
        recommended:item.recommended ? item.recommended : "",
        phone: item.phone,
        companyName: item.companyName,
        stationTel: item.stationTel,
        city: item.city,
        address:item.address,
        region: item.region,
        contactPhone: item.contactPhone ? item.contactPhone :'',
        dayCount: item.dayCount,
        hraIsOnline:item.hraIsOnline,
        state: item.state,
        contract: item.contract,
        deviceStatus: item.deviceStatus ? item.deviceStatus : '',
        contractEndTime: item.contractEndTime,
        contractStartTime:item.contractStartTime,
        contractAllTime:item.contractEndTime ? `${item.contractStartTime}-${item.contractEndTime}` : '',
        contractor:item.contractor,
        contractorPhone:item.contractorPhone ? item.contractorPhone :"",
        contractorIdentityNumber:item.contractorIdentityNumber ? item.contractorIdentityNumber :'',
        createTime: item.createTime ? item.createTime :'',
        productType: item.productType ? item.productType : "",
        person:item.person,
      };
    });
  }
  
  // 构建table所需数据
  makeData2(data2) {
    return data2.map((item,index) => {
      return {
        key: index,
        id: item.id,
        title: item.title,
        textContent: item.textContent,
        imgs: item.imgs,
        stationId:item.stationId,
      };
    });
  }
  
  render(record) {
    const me = this;
    const {form} = me.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8}
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16}
      }
  };
  const formItemLayout2 = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 8}
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 16}
    }
  };
  
  const formItemLayout3 = {
    labelCol: {
      xs: {span: 24},
      sm: {span: 5}
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 19}
    }
  }
  console.log("是啥：",this.state.pageNum);
  
  return (
      <div style={{width: "100%"}}>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>服务站名称</span>
              <Input
                placeholder="关键字"
                style={{
                  width: "160px",
                  marginRight: "20px",
                  marginLeft: "10px"
                }}
                onChange={e => this.onSearchStationName(e)}
              />
            </li>
            <li>
              <span>公司名称</span>
              <Input
                placeholder="关键字"
                style={{
                  width: "160px",
                  marginRight: "20px",
                  marginLeft: "10px"
                }}
                onChange={e => this.onSearchCompanyName(e)}
              />
            </li>
            <li style={{marginRight: "20px"}}>
              <span style={{marginRight: "10px"}}>服务站地区</span>
              <Cascader
                placeholder="请选择服务区域"
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
                changeOnSelect
              />
            </li>
            <li>
              <span>服务站地址</span>
              <Input
                placeholder="关键字"
                style={{
                  width: "160px",
                  marginRight: "20px",
                  marginLeft: "10px"
                }}
                onChange={e => this.onSearchStation(e)}
              />
            </li>
            <li>
              <span style={{marginRight: "10px"}}>承包状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{width: "120px",marginRight: "25px"}}
                onChange={e => this.searchNameChange(e)}
              >
                <Option value={0}>未承包</Option>
                <Option value={1}>已承包</Option>
              </Select>
            </li>
            <li>
              <span style={{marginRight: "10px"}}>HRA设备上线状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{width: "120px",marginRight: "25px"}}
                // onChange={e => this.searchNameChange(e)}
              >
                <Option value={0}>已上线</Option>
                <Option value={1}>未上线</Option>
              </Select>
            </li>
            <li>
              <span style={{marginRight: "10px"}}>是否推荐</span>
              <Select
                placeholder="全部"
                allowClear
                style={{width: "120px",marginRight: "25px"}}
                // onChange={e => this.searchNameChange(e)}
              >
                <Option value={0}>是</Option>
                <Option value={1}>否</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px", marginLeft: "23px" }}>
                承包时间
              </span>
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
            <li style={{width: "80px",marginRight: "15px"}}>
              <Button
                type="primary"
                icon="search"
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
            className="my-table"
            dataSource={this.makeData(this.state.data)}
            scroll={{x:2100}}
            pagination={{
              total: this.state.total,
              current: this.state.pageNum,
              pageSize: this.state.pageSize,
              showQuickJumper: true,
              showTotal: (total,range) => `共 ${total} 条数据`,
              onChange: (page,pageSize) =>
                this.onTablePageChange(page,pageSize)
            }}
          />
        </div>
        {/*承包上线信息录入模态框*/}
        <Modal
          title={this.state.upOrDown === "up" ? "添加承包相关信息" : "修改承包相关信息"}
          visible={this.state.updateModalShow}
          onOk={()=>this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          maskClosable={this.state.maskClose}
        >
          <Form>
            <FormItem label="承包时间" {...formItemLayout}>
              {getFieldDecorator("addnewBeginTime", {
                initialValue: undefined,
                rules: [
                  {required: true},
                ]
              })(<DatePicker
                  showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="开始时间"
                  style={{width:'200px'}}
                  onOk={onOk}
              />)}
              {getFieldDecorator("addnewEndTime", {
                initialValue: undefined,
                rules: [
                  {required: true},
                ]
              })(<DatePicker
                  showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="结束时间"
                  style={{width:'200px'}}
                  onOk={onOk}
              />)}
            </FormItem>
            <FormItem label="承包人姓名" {...formItemLayout}>
             {getFieldDecorator("addnewName", {
               initialValue: undefined,
               rules: [
                { required: true, message: "请输入承包人姓名" },
                {
                   validator: (rule, value, callback) => {
                     const v = tools.trim(value);
                     if (v) {
                       if (v.length > 8) {
                         callback("最多输入8个字");
                       }
                     }
                     callback();
                   }
                 }
               ]
             })(<Input placeholder="请输入承包人姓名" />)}
            </FormItem>
            <FormItem label="承包人手机号" {...formItemLayout}>
              {getFieldDecorator("addnewMobile", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入承包人手机号" },
                  {
                    validator: (rule, value, callback) => {
                      if (!tools.checkPhone(value)) {
                        callback("请输入正确的承包人手机号");
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入承包人手机号" />)}
            </FormItem>
            <FormItem label="承包人身份证号" {...formItemLayout}>
              {getFieldDecorator("addnewContractorIdentityNumber", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入承包人身份证"
                  },
                  { max: 18, message: "最多输入18位字符" }
                ]
              })(<Input placeholder="请输入承包人身份证号" />)}
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
            <FormItem label="服务站名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="公司名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.companyName : ""}
            </FormItem>
            <FormItem label="省" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.province : ""}
            </FormItem>
            <FormItem label="市" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.city : ""}
            </FormItem>
            <FormItem label="区" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.region : ""}
            </FormItem>
            <FormItem label="联系方式" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.phone : ""}
            </FormItem>
            <FormItem label="上线时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="承包时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.contractAllTime : ""}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.contract) === true ? (
                  <span style={{color: "green"}}>已承包</span>
                ) : (
                  <span style={{color: "red"}}>未承包</span>
                )
              ) : (
                ""
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 添加栏目模态框 */}
        <Modal
          title="添加栏目"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddColumnOk()}
          onCancel={() => this.onAddColumnClose()}
          confirmLoading={this.state.addnewLoading}
          onClick={() => this.onGetData2()}
        >
          <Form>
            <FormItem label="栏目标题" {...formItemLayout}>
              {getFieldDecorator("addnewColumnTitle", {
                initialValue: undefined,
                rules: [
                  {
                    whitespace: true,
                    message: "请输入栏目标题"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 12) {
                          callback("最多输入12位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入栏目标题" />)}
            </FormItem>
            <FormItem label="栏目文本" {...formItemLayout}>
              {getFieldDecorator("addnewColumntextContent", {
                initialValue: undefined,
                rules: [
                  {
                    whitespace: true,message: "请输入栏目文本"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 50) {
                          callback("最多输入50个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入栏目文本" />)}
            </FormItem>
            <FormItem label="栏目图片" {...formItemLayout}>
              {getFieldDecorator("addnewImgs", {
              })(
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/station/uploadImage`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.fileListLan}
                beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}
                onChange={f => this.onUpLoadDetailChange(f)}
                onRemove={f => this.onUpLoadDetailRemove(f)}
              >
                {this.state.fileListLan.length >= 5 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改栏目模态框 */}
        <Modal
          title="修改栏目"
          visible={this.state.updatenewModalShow}
          onOk={() => this.onUpColumnOk(record)}
          onCancel={() => this.onUpColumnClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="栏目标题" {...formItemLayout}>
              {getFieldDecorator("upColumnTitle", {
                initialValue: undefined,
                rules: [
                  {
                    whitespace: true,
                    message: "请输入栏目标题"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 12) {
                          callback("最多输入12位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入栏目标题" />)}
            </FormItem>
            <FormItem label="栏目文本" {...formItemLayout}>
              {getFieldDecorator("upColumntextContent", {
                initialValue: undefined,
                rules: [
                  {
                    whitespace: true,message: "请输入栏目文本"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 50) {
                          callback("最多输入50个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入栏目文本" />)}
            </FormItem>
            <FormItem label="栏目图片" {...formItemLayout}>
              {getFieldDecorator("upImgs", {
              })(
                <Upload
                  name="pImg"
                  action={`${Config.baseURL}/manager/station/uploadImage`}
                  listType="picture-card"
                  withCredentials={true}
                  fileList={this.state.fileListLan}
                  beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}
                  onChange={f => this.onUpLoadDetailChange(f)}
                  onRemove={f => this.onUpLoadDetailRemove(f)}
                >
                  {this.state.fileListLan.length >= 5 ? null : (
                    <div>
                      <Icon type="plus" />
                      <div className="ant-upload-text">选择文件</div>
                    </div>
                  )}
                </Upload>
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改承包信息录入模态框 */}
        <Modal
          title="修改承包信息"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          wrapClassName={"codNum"}
          width={"1000px"}
          maskClosable={this.state.maskClose}
          confirmLoading={this.state.addnewLoading}
        >
          <div className="system-table" style={{width:'-webkit-fill-available', display: 'inline-flex',border:'none',padding:'0px 0px 10px 70px',boxShadow:'4px 4px 10px #888888'}}>
          <Form style={{float:'left',width:'430px'}} className={"FormList"}>
            <FormItem label="服务站名称" {...formItemLayout2} style={{marginLeft:'41px'}}>
              <span style={{marginLeft:'-28px'}}>{!!this.state.nowData ? this.state.nowData.name : ""}</span>
            </FormItem>
            <FormItem label="省" {...formItemLayout2} style={{marginLeft:'97px'}}>
              <span style={{marginLeft:'-64px'}}>{!!this.state.nowData ? this.state.nowData.province : ""}</span>
            </FormItem>
            <FormItem label="区" {...formItemLayout2} style={{marginLeft:'97px'}}>
              <span style={{marginLeft:'-64px'}}>{!!this.state.nowData ? this.state.nowData.region : ""}</span>
            </FormItem>
            <FormItem label="联系方式" {...formItemLayout2} style={{marginLeft:'57px'}}>
              <span style={{marginLeft:'-39px'}}>{!!this.state.nowData ? this.state.nowData.phone : ""}</span>
            </FormItem>
            <FormItem label="HRA设备上线状态" {...formItemLayout2}>
               <span>{!!this.state.nowData ? (
                  Boolean(this.state.nowData.hraIsOnline) === true ? (
                      <span style={{color: "green"}}>已上线</span>
                  ) : (
                      <span style={{color: "red"}}>未上线</span>
                  )
              ) : (
                  ""
               )}</span>
            </FormItem>
            <FormItem label="承包时间" {...formItemLayout2} style={{marginLeft:'57px'}}>
              <span style={{marginLeft:'-39px'}}>{!!this.state.nowData ? this.state.nowData.contractAllTime : ""}</span>
            </FormItem>
            <FormItem label="承包人手机号" {...formItemLayout2} style={{marginLeft:'30px'}}>
              <span style={{marginLeft:'-20px'}}>{!!this.state.nowData ? this.state.nowData.contractorPhone : ""}</span>
            </FormItem>
            <FormItem label="承包人身份证号" {...formItemLayout} style={{marginLeft:'18px'}}>
              <span style={{marginLeft:'-10px'}}>{!!this.state.nowData ? this.state.nowData.contractorIdentityNumber : ""}</span>
            </FormItem>
          </Form>
          <Form style={{float:'right',width:'290px'}} className={"FormList"}>
            <FormItem label="公司名称" {...formItemLayout2} style={{marginLeft:'10px'}}>
              <span style={{marginLeft:'-6px'}}>{!!this.state.nowData ? this.state.nowData.companyName : ""}</span>
            </FormItem>
            <FormItem label="市" {...formItemLayout2} style={{marginLeft:'53px'}}>
              <span style={{marginLeft:'-34px'}}>{!!this.state.nowData ? this.state.nowData.city : ""}</span>
            </FormItem>
            <FormItem label="服务站地址" {...formItemLayout2}>
              <span>{!!this.state.nowData ? this.state.nowData.address : ""}</span>
            </FormItem>
            <FormItem label="联系人" {...formItemLayout2} style={{marginLeft:'28px'}}>
              <span style={{marginLeft:'-17px'}}>{!!this.state.nowData ? this.state.nowData.person : ""}</span>
            </FormItem>
            <FormItem label="上线时间" {...formItemLayout2} style={{marginLeft:'10px'}}>
              <span style={{marginLeft:'-4px'}}>{!!this.state.nowData ? this.state.nowData.createTime : ""}</span>
            </FormItem>
            <FormItem label="承包状态" {...formItemLayout2} style={{marginLeft:'10px'}}>
              <span >{!!this.state.nowData ? (
                  Boolean(this.state.nowData.contract) === true ? (
                    <span style={{color: "green"}}>已承包</span>
                  ) : (
                    <span style={{color: "red"}}>未承包</span>
                  )
              ) : (
                  ""
              )}</span>
            </FormItem>
            <FormItem label="承包人姓名" {...formItemLayout} >
              <span>{!!this.state.nowData ? this.state.nowData.contractor : ""}</span>
            </FormItem>
          </Form>
         </div>
          <div className="system-table" style={{width:'525px',padding:'20px 0px 0px 70px'}}>
            <Form>
              <FormItem label="是否推荐" {...formItemLayout3}>
                {getFieldDecorator("addnewRecommended", {
                  initialValue: undefined,
                  rules: [{ required: true, message: "请选择是否推荐" }]
                })(
                  <Select placeholder="请选择是否推荐" style={{width:'172px'}}>
                    <Option value={0}>否</Option>
                    <Option value={1}>是</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="推荐排序" {...formItemLayout3}>
                {getFieldDecorator("addnewSorts", {
                  initialValue: undefined,
                  rules: [{ required: true, message: "请输入排序序号" }]
                })(<InputNumber placeholder="请输入排序序号" style={{width:'172px'}}/> )}
              </FormItem>
              <FormItem label="服务站图片上传(最多3张)" {...formItemLayout3} labelCol={{ span: 10 }} wrapperCol={{ span: 16 }}>
                <Upload
                  name="pImg"
                  action={`${Config.baseURL}/manager/station/uploadImage`}
                  listType="picture-card"
                  withCredentials={true}
                  fileList={this.state.fileList}
                  beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                  onChange={f => this.onUpLoadChange(f)}
                  onRemove={f => this.onUpLoadRemove(f)}
                >
                  {this.state.fileList.length >= 3 ? null : (
                    <div>
                      <Icon type="plus" />
                      <div className="ant-upload-text">选择文件</div>
                    </div>
                  )}
                </Upload>
              </FormItem>
              <FormItem label="营业时间" {...formItemLayout3} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
                {getFieldDecorator("addnewBusinesHoursStart", {
                  initialValue: undefined,
                  rules: [
                    {required: true},
                ]
                })(<TimePicker placeholder="开始时间" format={format} />)}--
                {getFieldDecorator("addnewBusinessHoursEnd", {
                  initialValue: undefined,
                  rules: [
                    {required: true},
                ]
                })(<TimePicker placeholder="结束时间" format={format} />)}
              </FormItem>
              <FormItem label="成立时间" {...formItemLayout3}>
                {getFieldDecorator("addnewEstablishedTime", {
                  initialValue: undefined,
                  rules: [
                    {required: true},
                ]
                })(<DatePicker
                    showTime={{ defaultValue: moment }}
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="成立时间"
                    onOk={onOk}
                />)}
              </FormItem>
              <FormItem label="门店规模" {...formItemLayout3}>
                {getFieldDecorator("addnewStoreArea", {
                  initialValue: undefined,
                  rules: [{ required: true, message: "请输入门店规模" }]
                })(<InputNumber placeholder="请输入门店规模" style={{width:'172px'}}/> )}
              </FormItem>
              <FormItem label="员工数量" {...formItemLayout3}>
                {getFieldDecorator("addnewEmployeeNum", {
                  initialValue: undefined,
                  rules: [{ required: true, message: "请输入员工数量" }]
                })(<InputNumber placeholder="请输入员工数量" style={{width:'172px'}}/>)}
              </FormItem>
              <FormItem label="自定义栏目" {...formItemLayout3} style={{width:'800px',height:'230px'}}>
                  {getFieldDecorator("addnewCount", {
                    initialValue: undefined,
                  })(
                    <div>
                      <Button
                          icon="plus-circle-o"
                          type="primary"
                          onClick={() => this.onAddColumnShow()}
                      >
                        添加栏目
                      </Button>
                      <div className="system-table">
                        <Table
                          columns={this.makeColumnsSmall()}
                          dataSource={this.makeData2(this.state.data2)}
                          width={{ x: 900 }}
                        />
                      </div>
                    </div>
                  )}
              </FormItem>
            </Form>
          </div>
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
        updateProductLine,
        updateContract,
        downContract,
        ContractList,
        updateStation,
        addColumnCount,
        findProductLine,
        addProductLine,
        deleteColumnCount,
        updateColumnCount,
        findColumnCount,
        warning,
        onOk,
        deleteImage
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
