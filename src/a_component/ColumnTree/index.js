/* MenuTree 菜单树 - 单选 */
import React from "react";
import P from "prop-types";
import { Modal, Tree, message } from "antd";
import "./index.scss";

const TreeNode = Tree.TreeNode;
class MenuTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false, // 是否正在分配菜单中
      nowRoles: [], // 当前用户所拥有的角色
      selectedKeys: [], // 受控，所有选中的项,[key],单纯的控制tree选中效果
      selected: null, // 受控，所选中的项，用于最终结果{key,id,title}
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
    if (nextProps.modalShow !== this.props.modalShow && nextProps.modalShow) {
      console.log("默认选中啊：", this.props.defaultKey);
      this.setState({
        selectedKeys: this.props.defaultKey,
        selected: (() => {
          const temp = nextProps.menuData.find(
            item => `${item.id}` === this.props.defaultKey[0]
          );
          if (temp) {
            return { key: `${temp.id}`, id: temp.id, title: temp.menuName };
          } else {
            return [];
          }
        })()
      });
    }
  }

  // 提交
  onOk() {
    console.log("选择的是：", this.state.selected);
    this.props.onOk && this.props.onOk(this.state.selected);
  }

  // 关闭模态框
  onClose() {
    this.props.onClose();
  }

  // 复选框选中时触发
  onTreeSelect(keys, e) {
    // 无论如何默认选中根
    console.log("怎么回事：", keys, e);
    let selected = null;
    let keyed = [];
    if (e.selected) {
      selected = {
        key: e.node.props.eventKey,
        id: e.node.props.id,
        title: e.node.props.title
      };
      keyed = keys;
    } else {
      selected = { key: "0", id: 0, title: "直播栏目" };
      keyed = ["0"];
    }
    this.setState({
      selectedKeys: keyed,
      selected
    });
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

  // 构建树结构
  makeTreeDom(data) {
    return data.map((item, index) => {
      if ((item.subList).length >0) {
        return (
          <TreeNode
            title={item.name}
            key={`${item.id}`}
            id={item.id}
            p={item.parentId}
            data={item}
          >
            {this.makeTreeDom(item.subList)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            title={item.name}
            key={`${item.id}`}
            id={item.id}
            p={item.parentId}
            data={item}
          />
        );
      }
    });
  }

  render() {
    const me = this;
    return (
      <Modal
        className="menu-tree"
        zIndex={1001}
        title={this.props.title || "菜单选择"}
        visible={this.props.modalShow}
        onOk={() => this.onOk()}
        onCancel={() => this.onClose()}
        confirmLoading={this.state.loading}
      >
        <Tree
          defaultExpandedKeys={["0"]}
          selectedKeys={this.state.selectedKeys}
          onSelect={(selectedKeys, e) => this.onTreeSelect(selectedKeys, e)}
        >
          <TreeNode title="直播栏目" key="0" id={0} data={{}}>
            {this.state.treeDom}
          </TreeNode>
        </Tree>
      </Modal>
    );
  }
}

MenuTree.propTypes = {
  title: P.string, // 指定模态框标题
  menuData: P.any, // 所有的菜单原始后台数据
  defaultKey: P.array, // 需要默认选中的项
  noShowId: P.any, // 不显示的项（比如，选择父级时，不能选择自己）
  modalShow: P.any, // 是否显示
  onClose: P.any, // 关闭模态框
  onOk: P.any // 确定选择，将所选项信息返回上级
};

export default MenuTree;
