/* TreeTable 用于角色授权的树形表格 */
import React from "react";
import P from "prop-types";
import { Modal, Table, Checkbox, Spin } from "antd";
import "./index.scss";
import _ from "lodash";
class TreeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceData0: [], // 原始数据 - 扁平数据
      sourceData: [], // 原始数据 - 层级数据
      btnDtoChecked: [], // 受控，所有被选中的btnDto数据
      treeChecked: [] // 受控，所有被选中的表格行
    };
  }

  componentDidMount() {
    this.makeSourceData(this.props.menuData);
  }

  componentWillReceiveProps(nextProps) {
    // allMenu变化后，重新处理原始数据; 所选择的项变化，需要隐藏所选择的项
    if (nextProps.menuData !== this.props.menuData) {
      this.makeSourceData(nextProps.menuData);
    }
  }

  // 提交
  onOk() {
    this.props.onOk &&
      this.props.onOk({
        menus: this.state.treeChecked,
        btns: this.state.btnDtoChecked
      });
  }

  // 关闭模态框
  onClose() {
    this.props.onClose();
  }

  // 初始化，把默认选中的勾上
  init() {}

  // 处理原始数据，将原始数据处理为层级关系
  makeSourceData(data) {
    console.log("原始数据是什么：", data);
    let d = _.cloneDeep(data);
    // 按照sort排序
    d.sort((a, b) => {
      return a.sorts - b.sorts;
    });

    const sourceData = [];
    d.forEach(item => {
      if (item.parentId === 0) {
        const temp = this.dataToJson(d, item);
        sourceData.push(temp);
      }
    });
    console.log("jsonMenu是什么：", sourceData);
    // 再来看看哪些需要被默认选中
    const treeChecked = data
      .filter(item => item.menuAfiliation === "Y")
      .map(item => item.id);
    const btnDtoChecked = [];
    data.forEach(item => {
      if (item.btnDtoList && item.btnDtoList.length > 0) {
        item.btnDtoList
          .filter(item2 => item2.menuAfiliation === "Y")
          .forEach(item3 => btnDtoChecked.push(item3.id));
      }
    });
    this.setState({
      sourceData0: data,
      sourceData,
      treeChecked,
      btnDtoChecked
    });
  }

  // 递归将扁平数据转换为层级数据
  dataToJson(data, one) {
    const child = _.cloneDeep(one);
    child.children = [];
    child.key = child.id;
    let sonChild = null;
    data.forEach(item => {
      if (item.parentId === one.id) {
        sonChild = this.dataToJson(data, item);
        child.children.push(sonChild);
      }
    });
    if (child.children.length <= 0) {
      child.children = null;
    }
    return child;
  }

  // Dto受控
  dtoIsChecked(id) {
    return !!this.state.btnDtoChecked.find(item => item === id);
  }
  // TABLE 字段
  makeColumns() {
    const columns = [
      {
        title: "菜单",
        dataIndex: "menuName",
        key: "menuName",
        width: "30%"
      },
      {
        title: "权限",
        dataIndex: "btnDtoList",
        key: "btnDtoList",
        width: "70%",
        render: (value, record) => {
          if (value) {
            return value.map((item, index) => {
              return (
                <Checkbox
                  key={index}
                  checked={this.dtoIsChecked(item.id)}
                  onChange={e => this.onBtnDtoChange(e, item.id, record)}
                >
                  {item.btnName}
                </Checkbox>
              );
            });
          }
        }
      }
    ];
    return columns;
  }

  // TABLE 列表项前面是否有多选框，并配置行为
  makeRowSelection() {
    return {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log("有改变时触发", selectedRowKeys, selectedRows);
        this.setState({
          treeChecked: selectedRowKeys
        });
      },
      onSelect: (record, selected, selectedRows) => {
        console.log("单个选中或取消触发:", record, selected, selectedRows);
        const t = this.state.sourceData0.find(item => item.id === record.id);
        if (selected) {
          // 选中，连带其权限全部勾选
          if (t && Array.isArray(t.btnDtoList)) {
            const temp = Array.from(
              new Set([
                ...t.btnDtoList.map(item => item.id),
                ...this.state.btnDtoChecked
              ])
            );
            this.setState({
              btnDtoChecked: temp
            });
          }
        } else {
          // 取消选中，连带其权限全部取消勾选
          if (t && Array.isArray(t.btnDtoList)) {
            const mapTemp = t.btnDtoList.map(item => item.id);
            const temp = this.state.btnDtoChecked.filter(
              item => mapTemp.indexOf(item) < 0
            );
            this.setState({
              btnDtoChecked: temp
            });
          }
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
          // 选中
          this.setState({
            // treeChecked: this.state.sourceData0.map((item) => item.id),
            btnDtoChecked: this.state.sourceData0.reduce((v1, v2) => {
              console.log("处理中：", v1, v2);
              return [...v1, ...v2.btnDtoList.map(k => k.id)];
            }, [])
          });
        } else {
          this.setState({
            // treeChecked: [],
            btnDtoChecked: []
          });
        }
      },
      selectedRowKeys: this.state.treeChecked
    };
  }

  // TABLE btn权限选中和取消选中，需要记录哪些被选中
  onBtnDtoChange(e, id, record) {
    console.log(e, id, record);
    const old = _.cloneDeep(this.state.btnDtoChecked);
    let treeChecked = _.cloneDeep(this.state.treeChecked);
    if (e.target.checked) {
      // 选中
      old.push(id);
      treeChecked = Array.from(new Set([record.id, ...this.state.treeChecked]));
    } else {
      // 取消选中
      old.splice(old.indexOf(id), 1);
      // 判断当前这一行的权限中是否还有被选中的，如果全都没有选中，那当前菜单也要取消选中
      const tempMap = record.btnDtoList.map(item => item.id);
      if (
        !this.state.btnDtoChecked.some(
          item => item !== id && tempMap.indexOf(item) >= 0
        )
      ) {
        treeChecked.splice(treeChecked.indexOf(record.id), 1);
      }
    }
    this.setState({
      btnDtoChecked: old,
      treeChecked
    });
    console.log("现在选中的有：", old);
  }

  render() {
    const me = this;
    return (
      <Modal
        className="menu-tree-table"
        zIndex={1001}
        width={750}
        title={this.props.title || "菜单选择"}
        visible={this.props.modalShow}
        onOk={() => this.onOk()}
        onCancel={() => this.onClose()}
        confirmLoading={this.props.loading}
      >
        {this.props.initloading ? (
          <div style={{ textAlign: "center" }}>
            <Spin tip="加载中…" />
          </div>
        ) : (
          <Table
            columns={this.makeColumns()}
            rowSelection={this.makeRowSelection()}
            dataSource={this.state.sourceData}
            pagination={false}
            defaultExpandAllRows
          />
        )}
      </Modal>
    );
  }
}

TreeTable.propTypes = {
  title: P.string, // 指定模态框标题
  menuData: P.any, // 所有的菜单原始后台数据
  defaultChecked: P.array, // 需要默认选中的项
  modalShow: P.any, // 是否显示
  initloading: P.bool, // 初始化时，树是否处于加载中状态
  loading: P.bool, // 提交表单时，树的确定按钮是否处于等待状态
  onClose: P.any, // 关闭模态框
  onOk: P.any // 确定选择，将所选项信息返回上级
};

export default TreeTable;
