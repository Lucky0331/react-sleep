/* Banner 商城管理/内容管理/banner管理 */

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
  DatePicker,
  Input,
  Table,
  message,
  Select,
  Icon
} from "antd";
import "./index.scss";
import moment from "moment";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {deleteImage,onChange,onOk,} from "../../../../a_action/shop-action";
import {Cardlist} from "../../../../a_action/card-action";
import {OperationLog} from "../../../../a_action/sys-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      datatry: 1, // 当前页面全部数据
      productTypes: [], //所有的产品类型
      titleList: [], // 所有的标题位置
      titles: [], //所有的标题
      searchTitle: "", //搜索 - 操作页面
      searchPerson:'',//搜索 - 操作人
      searchDeleteStatus: "", //搜索 - 是否发布
      searchTypeCode: "", //搜索 - 代言卡分类
      searchBeginTime:'',//搜索 - 操作开始时间
      searchEndTime:'',//搜索 - 操作结束时间
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      deleteStatus: this.state.searchDeleteStatus,
      operationPage: String(this.state.searchTitle),//操作页面搜索
      operator: this.state.searchPerson,//操作人
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",//搜索 - 操作开始时间
      endTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : "",//搜索 - 操作结束时间
    };
    this.props.actions.OperationLog(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data.result);
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total || []
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
      console.log("啥操作页面：", res.data.result);
    });
  }

  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchDeleteStatus: e
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }
  
  //操作页面的搜索
  searchTitleChange(e){
    this.setState({
     searchTitle:e.target.value
    })
  }
  
  //操作人的搜索
  searchPersonChange(e){
    this.setState({
      searchPerson:e.target.value
    })
  }
  
  //操作时间 - 开始时间
  searchBeginTimeChange(v){
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    })
  }
  
  //操作时间 - 结束时间
  searchEndTimeChange(v){
    this.setState({
      searchEndTime: _.cloneDeep(v)
    })
  }
  
  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchTitle: ""
    });
  }//操作页面
  
  emitEmpty1() {
    this.setState({
      searchPerson: ""
    });
  }//操作人

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      {
        title: "操作页面",
        dataIndex:'operationPage',
        key:'operationPage',
        width:240
      },
      {
        title: "操作类型",
        dataIndex:'operationType',
        key:'operationType',
        width:100
      },
      {
        title: "操作对象",
        dataIndex:'operationObject',
        key:'operationObject',
        width:400
      },
      {
        title: "描述",
        dataIndex:'description',
        key:'description',
        width:900
      },
      {
        title: "操作人",
        dataIndex:'operator',
        key:'operator'
      },
      {
        title: "操作时间",
        dataIndex:'operationDate',
        key:'operationDate'
      },
    ];
    return columns;
  }

  //构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        operationPage:item.operationPage,//操作页面
        operator:item.operator,//操作人
        description:item.description,//描述
        operationType:item.operationType,//操作类型
        operationObject:item.operationObject,//操作对象
        operationDate:item.operationDate,//操作时间
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
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
  
    const { searchTitle } = this.state;
    const { searchPerson } = this.state;
    const suffix = searchTitle ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix1 = searchPerson ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>操作页面</span>
              <Input
                style={{ width: '270px' }}
                suffix={suffix}
                value={searchTitle}
                onChange = { e =>this.searchTitleChange(e)}
              />
            </li>
            <li>
              <span>操作人</span>
              <Input
                style={{ width: '172px' }}
                suffix={suffix1}
                value={searchPerson}
                onChange = { e =>this.searchPersonChange(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>操作时间</span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={v => this.searchBeginTimeChange(v)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={v => this.searchEndTimeChange(v)}
                onOk={onOk}
              />
            </li>
            <li style={{marginLeft:'40px',marginRight:'15px'}}>
            <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
            </li>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
            dataSource={this.makeData(this.state.data)}
            scroll={{ x: 2100 }}
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
  actions: P.any
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
        onChange,
        deleteImage,
        onOk,
        Cardlist,
        OperationLog,
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
