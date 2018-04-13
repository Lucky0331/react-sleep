/* 权限控制 */
const power = {
  // 获取当前用户拥有的菜单 - 扁平数据
  // 获取当前用户拥有的菜单 - 层级数据
  // 获取当前用户拥有的角色
  // 获取当前用户拥有的按钮(权限)
  // 获取当前用户当前路由下拥有的子路由

  // 获取权限数据
  makeData() {
    let data = sessionStorage.getItem("adminMenu");
    let btns = [];
    if (data) {
      data = JSON.parse(data);
      data = data.filter(item => item.menuAfiliation === "Y");
      data.forEach(item => {
        if (item.btnDtoList && item.btnDtoList.length > 0) {
          btns = [
            ...btns,
            ...item.btnDtoList.filter(item => item.menuAfiliation === "Y")
          ];
        }
      });
    }
    return { menus: data || null, btns };
  },

  // 根据权限CODE判断当前用户是否拥有该权限
  test(code) {
    let user = sessionStorage.getItem("adminUser");
    if (user) {
      user = JSON.parse(user);
    }
    if (user.id === 1) {
      // 系统默认id为1的用户拥有所有权限
      return true;
    }

    const p = power.makeData();
    console.log("测试的什么：", code, p);
    return !!p.btns.find(item => item.btnCode === code);
  }
};

export default power;
