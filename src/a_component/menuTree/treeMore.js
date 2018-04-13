/* MenuTree 菜单树 - 多选 */
import React from "react";
import P from "prop-types";
import { Modal, Tree, Checkbox } from "antd";
import "./index.scss";

const TreeNode = Tree.TreeNode;
class MenuTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceData: [], // 原始数据 - 层级数据
      checkedKeys: [], // 受控，所有选中的项,[key],单纯的控制tree选中效果
      checked: [], // 受控，所选中的项，用于最终结果{key,id,title}
      treeDom: [] // 缓存treeDom
    };
  }

  componentDidMount() {
    this.makeSourceData(this.props.menuData, this.props.noShowId);
  }

  componentWillReceiveProps(nextProps) {
    // allMenu变化后，重新处理原始数据; 所选择的项变化，需要隐藏所选择的项
    if (
      nextProps.menuData !== this.props.menuData ||
      nextProps.noShowId !== this.props.noShowId
    ) {
      this.makeSourceData(nextProps.menuData, nextProps.noShowId);
    }
    // if (nextProps.modalShow !== this.props.modalShow && nextProps.modalShow) {
    //     console.log('到这里吗：', this.props.defaultChecked);
    //     this.setState({
    //         checkedKeys: this.props.defaultChecked.map((item) => item.key),
    //         checked: this.props.defaultChecked,
    //     });
    // }
    if (nextProps.defaultChecked !== this.props.defaultChecked) {
      console.log("到这里了没有：", nextProps.defaultChecked);
      this.setState({
        checkedKeys: nextProps.defaultChecked
          .filter(item => {
            // 排除父级，只有最后一级自动默认选中，因为可能有半选的情况
            return !!this.checkLeaf(this.state.sourceData, item.key);
          })
          .map(item => item.key),
        checked: nextProps.defaultChecked
      });
    }
  }

  // 提交
  onOk() {
    this.props.onOk && this.props.onOk(this.state.checked);
  }

  // 关闭模态框
  onClose() {
    this.props.onClose();
  }

  // 复选框选中时触发
  onTreeSelect(keys, e) {
    console.log("复选框选中：", keys, e);
    const checked = e.checkedNodes.map(item => {
      return { key: item.key, id: item.props.id, title: item.props.title };
    });
    // 半选的也算选中
    const checkedHalf = e.halfCheckedKeys.map(item => {
      const temp = this.props.menuData.find(v => `${v.id}` === item);
      return { key: `${temp.id}`, id: temp.id, title: temp.menuName };
    });
    this.setState({
      checkedKeys: keys,
      checked: [...checked, ...checkedHalf]
    });
  }

  // 权限被选中
  onBtnChange(e, id) {
    console.log("权限点击：", e, id);
  }
  // 处理原始数据，将原始数据处理为层级关系
  makeSourceData(data, noShowId = null) {
    console.log("原始数据是什么：", data, this.props.noShowId);
    let d = _.cloneDeep(data);
    // 按照sort排序
    d.sort((a, b) => {
      return a.sorts - b.sorts;
    });
    if (noShowId || noShowId === 0) {
      d = d.filter(item => {
        return item.id !== noShowId;
      });
    }
    const sourceData = [];
    d.forEach(item => {
      if (item.parentId === 0) {
        const temp = this.dataToJson(d, item);
        sourceData.push(temp);
      }
    });
    console.log("jsonMenu是什么：", sourceData);
    const treeDom = this.makeTreeDom(sourceData);
    this.setState({
      sourceData,
      treeDom
    });
  }

  // 递归将扁平数据转换为层级数据
  dataToJson(data, one) {
    const child = _.cloneDeep(one);
    child.children = [];
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

  // 工具函数 - 查找当前ID是否是最底层叶子节点 - 递归 是true, 否false
  checkLeaf(data, key) {
    const t = data.find(item => `${item.id}` === key);
    if (t) {
      return !(t.children && t.children.length > 0);
    } else {
      let result = null;
      const tData = data.filter(
        item => item.children && item.children.length > 0
      );
      for (let i = 0; i < tData.length; i++) {
        const temp = this.checkLeaf(tData[i].children, key);
        if (temp !== null) {
          result = temp;
          break;
        }
      }
      return result;
    }
  }

  // 构建树结构
  makeTreeDom(data) {
    return data.map((item, index) => {
      if (item.children) {
        return (
          <TreeNode
            title={this.makeTreeDomForBtn(item)}
            key={`${item.id}`}
            id={item.id}
            p={item.parentId}
            data={item}
          >
            {this.makeTreeDom(item.children)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            title={this.makeTreeDomForBtn(item)}
            key={`${item.id}`}
            id={item.id}
            p={item.parentId}
            data={item}
          />
        );
      }
    });
  }

  // 构建树结构连带的权限按钮们 - 工具函数
  makeTreeDomForBtn(item) {
    let btnDoms;
    if (item.btnDtoList && item.btnDtoList.length > 0) {
      btnDoms = item.btnDtoList.map((v, i) => {
        return (
          <Checkbox key={v.id} onChange={e => this.onBtnChange(e, v.id)}>
            {v.btnName}
          </Checkbox>
        );
      });
    }
    return (
      <span className="btn-doms">
        {item.menuName}
        {btnDoms}
      </span>
    );
  }
  render() {
    const me = this;
    return (
      <Modal
        className="menu-tree-more"
        zIndex={1001}
        width={680}
        title={this.props.title || "菜单选择"}
        visible={this.props.modalShow}
        onOk={() => this.onOk()}
        onCancel={() => this.onClose()}
        confirmLoading={this.props.loading}
      >
        {this.props.initloading ? (
          <span>正在加载中……</span>
        ) : (
          <Tree
            checkable
            checkedKeys={this.state.checkedKeys}
            onCheck={(keys, e) => this.onTreeSelect(keys, e)}
            selectedKeys={[]}
            onSelect={e => {
              e.stopPropagation();
            }}
          >
            {this.state.treeDom}
          </Tree>
        )}
      </Modal>
    );
  }
}

MenuTree.propTypes = {
  title: P.string, // 指定模态框标题
  menuData: P.any, // 所有的菜单原始后台数据
  defaultChecked: P.array, // 需要默认选中的项
  noShowId: P.number, // 不显示的项（比如，选择父级时，不能选择自己）
  modalShow: P.any, // 是否显示
  initloading: P.bool, // 初始化时，树是否处于加载中状态
  loading: P.bool, // 提交表单时，树的确定按钮是否处于等待状态
  onClose: P.any, // 关闭模态框
  onOk: P.any // 确定选择，将所选项信息返回上级
};

export default MenuTree;
