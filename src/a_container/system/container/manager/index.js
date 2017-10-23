/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Popconfirm } from 'antd';
import './index.scss';
// ==================
// 所需的所有组件
// ==================

import UrlBread from '../../../../a_component/urlBread';

// ==================
// 本页面所需action
// ==================

import { findAll } from '../../../../a_action/sys-action';

// ==================
// Definition
// ==================
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      searchUserName: '',
    };
  }

  componentDidMount() {
    this.props.actions.findAll().then((res) => {
       if(res.returnCode === "0") {
          this.setState({
              data: res.messsageBody,
          });
       } else {
         message.error(res.returnMessaage || '获取数据失败，请重试');
       }
    });
  }

  // 搜索 - 用户名输入框值改变时触发
    searchUserNameChange(e) {
      if (e.target.value.length < 20) {
          this.setState({
              searchUserName: e.target.value,
          });
      }
    }

   // 修改某一条数据
    onUpdateClick(id) {

    }

    // 删除某一条数据
    onDeleteClick() {

    }

    // 搜索
    onSearch() {

    }

    // 查询某一条数据的详情
    onQueryClick(record) {

    }

    // 构建字段
  makeColumns(){
    const columns = [
      {
        title: 'ID',
        dataIndex: 'adminUserId',
        key: 'adminUserId',
      },
      {
        title: '用户名',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        key: 'sex',
        render: (text, record) => {
          console.log('性别是什么：', text);
          return text === 1 ? '男' : '女';
        },
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: '电话',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: '操作',
        key: 'control',
          width: 200,
        render: (text, record) => {
          return (
              [
                <span key="0" className="control-query" onClick={() => this.onQueryClick(record)}>查看</span>,
                <span key="line1" className="ant-divider" />,
                <span key="1" className="control-update" onClick={() => this.onUpdateClick(record.adminUserId)}>修改</span>,
                <span key="line2" className="ant-divider" />,
                <Popconfirm key="2" title="确定删除吗?" onConfirm={() => this.onDeleteClick(record.adminUserId)} okText="确定" cancelText="取消">
                  <span className="control-delete">删除</span>
                </Popconfirm>
              ]
          );
        },
      }
    ];
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
          key: index,
          adminIp: item.adminIp,
          adminUserId: item.adminUserId,
          age: item.age,
          conditions: item.conditions,
          creator: item.creator,
          description: item.description,
          email: item.email,
          orgCode: item.orgCode,
          phone: item.phone,
          sex: item.sex,
          updateTime: item.updateTime,
          updater: item.updater,
          userName: item.userName,
          control: item.adminUserId,
      }
    });
  }

  render() {
    return (
      <div>
        <UrlBread location={this.props.location}/>
        <div className="system-search">
          <ul className="search-func">
            <li><Button type="primary"><Icon type="plus-circle-o" />添加用户</Button></li>
          </ul>
          <span className="ant-divider" />
          <ul className="search-ul">
            <li><Input placeholder="请输入用户名" onChange={(e) => this.searchUserNameChange(e)} value={this.state.searchUserName}/></li>
            <li><Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
          </ul>
        </div>
        <div className="system-table">
          <Table
              columns={this.makeColumns()}
              dataSource={this.makeData(this.state.data)}
          />
        </div>
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
};

// ==================
// Export
// ==================

export default connect(
  (state) => ({

  }), 
  (dispatch) => ({
    actions: bindActionCreators({ findAll }, dispatch),
  })
)(Manager);
