<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    <div class="text item">
      <buttonRef
          ref="btnRef"
          :leftBtn="leftBtnObj"
          :rightBtn="rightBtnObj"
          @leftClick="leftClick"
          @rightClick="rightClick"
      />
      <queryRef
          ref="queRef"
          v-model:queryForm="queryForm"
          :queryData="queryList"
          v-model:labelwidth="labelwidth"
      />
      <tableRef
          ref="tableRefs"
          v-model:tableData="tableData"
          v-model:tableColumns="tableColumns"
          v-model:tabloading="tabloading"
          v-model:loadingText="loadingText"
          v-model:operateBtn="operateBtn"
          @sortClick="sortChange"
          @rowClick="rowClick"
          @selectClick="handleSelectionChange"
          @operateClick="operateClick"
          @formatData="formatStatus"
      />
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          background
          layout="total, sizes , prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
   
      <lookDialog
          ref="lookRef"
          v-model:detailVisible="detailVisible"
          v-model:detailList="detailList"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
  import buttonRef from "/@/components/global/buttonRef.vue";
  import queryRef from "/@/components/global/queryRef.vue";
  import tableRef from "/@/components/global/tableRef.vue";
  import lookDialog from "/@/views/appInfo/components/ReportDetail.vue";
  import type {
    TableColumnProps,
    TableProps,
    ButtonProps,
    JsonProps,
    DialogProps,
  } from "/@/types/appinfo/ReportTypes";
  import { getDataListApi, del, putMultiDel,operdate
  } from "/@/api/appinfo/ReportApi";
  import { translate } from "/@/i18n";
  import { getTopButton } from "/@/utils/Button";
  import { ElMessage, ElMessageBox } from "element-plus";
  import Utils from "~/src/utils/base64";
  defineOptions({
    name: 'ReportList',
  });

  const route = useRoute();
  let title: any = route.meta.title;
  let baseUtil = new Utils();
  const btnRef = ref<any>();
  const queRef = ref<any>();
  const tableRefs = ref<any>();
  const tableData = ref<TableProps[] | []>([]);
  const tabloading = ref<boolean>(true);
  const tableColumns = ref<TableColumnProps[] | []>([]);
  const loadingText = ref<string>("");
  const total = ref<number>(0);
  const pageSizes = ref<number[]>([10, 15, 20, 30]);
  const pageSize = ref<number>(10);
  const pageNum = ref<number>(1);
  const leftBtnObj = ref<ButtonProps[] | []>([]);
  const rightBtnObj = ref<ButtonProps[] | []>([]);
  const operateBtn = ref<ButtonProps[] | []>([]);
  const sortColumn = ref<string | null>("pid");
  const sortType = ref<string | null>("DESC");
  const tailRef = ref<any>();
  const menuRef = ref<any>();
  const labelwidth = ref<string>("80px");
  const queryList = ref<JsonProps[] | []>([]);
  const tableList = ref<JsonProps>({});
  let queryForm = reactive<any>({});
  const selectedRows = ref<string[]>([]);

  const dialogVisible = ref<boolean>(false);
  const dialogList = ref<DialogProps>({});
  const detailVisible = ref<boolean>(false);
  const detailList = ref<DialogProps>({});
    // 创建下拉框对象数组
    const ishandleSelectData = ref<any[]|[]>([])
  // 创建下拉框对象数组
  // 获取头部左侧及右侧按钮配置或自己配置json
  const getButton = () => {
    leftBtnObj.value = getTopButton([
    ]) as ButtonProps[];
    rightBtnObj.value = getTopButton([
      { name: "搜索", funName: "searchClick" },
      { name: "重置", funName: "resetClick" },
    ]) as ButtonProps[];
  };
  const getTableOptions = () => {
  };

  // 获取查询条件接口或json
 // 获取查询条件接口或json
 const getQueryList = () => {
    queryList.value = [
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'举报人:',
        },
        bindVal: 'addnickname',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('举报人昵称'),
             clearable: true,
             autocomplete: "off",
             type: "text",
        },
      },
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'被举报人:',
        },
        bindVal: 'tonickname',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('被举报人昵称'),
             clearable: true,
             autocomplete: "off",
             type: "text",
        },
      },
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'举报内容:',
        },
        bindVal: 'scontent',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('举报内容'),
             clearable: true,
             autocomplete: "off",
             type: "text",
        },
      }, {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'待处理:',
        },
        bindVal: 'ishandle',
        curEleTag: "el-select",
        childEleTag: "el-option",
        curOptions: {
              placeholder:translate('待处理'),
              clearable: true,
        },
        childOptions: ishandleSelectData.value,
      },
      
  ]};
  //格式化表格某些字段的数据
  const formatStatus = (obj: any) => {
    return obj == 0 ? "未办理" : "已办理";
  };

  //列表字段数据获取或json配置
  const getTableColumns = () => {
    tableColumns.value = [
                    {prop: 'addnickname', label: '举报人昵称',sortable:false},

                    {prop: 'tonickname', label: '被举报人昵称',sortable:false},

                    {prop: 'scontent', label: '举报内容',sortable:false},

                    {prop: 'addtime', label: '举报时间',sortable:false},

                    {prop: 'ishandle', label: '待处理',sortable:false},

                    {prop: 'operuser', label: '处理人',sortable:false},

                   {prop: 'opertime', label: '处理时间',sortable:false},

     ]
  }

  const getOperate = () => {
    operateBtn.value = getTopButton([
      { name: "查看", funName: "lookClick" },
      { name: "处理", funName: "operdateClick" },
      { name: "删除", funName: "delClick" },
      
    ]) as ButtonProps[];
  };

  //添加事件
  const addClick = () => {
    console.log("add");
    dialogList.value.modeType = "add";
    dialogList.value.title = "新增";
    dialogVisible.value = true;
  };

  //批量删除
  const batchDel = async () => {
    if (selectedRows.value.length == 0) {
      ElMessage({
        type: "error",
        message: "请勾选需要删除的数据！",
      });
      return false;
    }
    let params = { pids: selectedRows.value.join(",") };
    let res: any = await putMultiDel(params);
    if (res.code == 200) {
      ElMessage.success("删除成功");
      getTableList();
    } else {
      ElMessage.error("删除失败");
    }
  };

  //获取模板
  const getTemplate = () => {};

  //导入
  const getImport = () => {};

  //导出
  const getExport = () => {};

  //查询搜索事件
  const searchClick = () => {
    getTableList();
  };

  //重置
  const resetClick = () => {
    queryForm = reactive<any>({});
    getTableList();
  };

  const leftClick = (name: string) => {
      if(map.has(name)){
        const func:any = map.get(name);
        func();
      }
  };

  const rightClick = (name: string) => {
    if(map.has(name)){
      const func:any = map.get(name);
      func();
    }
  };

  //排序事件
  const sortChange = async (column: any) => {
    console.log(column);
    if (column.order != null && column.prop != null) {
      sortColumn.value = column.prop;
      if (column.order == "ascending") {
        sortType.value = "ASC";
      } else if (column.order == "descending") {
        sortType.value = "DESC";
      }
    } else {
      sortType.value = null;
      sortColumn.value = null;
    }
    pageNum.value = 1;
    await getTableList();
  };

  //列表行点击事件
  const rowClick = (row: any, column: any, event: any) => {};

  //列表勾选事件
  const handleSelectionChange = (rows: any) => {
    selectedRows.value = rows.map((item: any) => {
      return item.pid;
    });
    console.log(selectedRows.value);
  };

  //编辑事件
  const editClick = (pid: number) => {
    console.log(pid);
    dialogList.value.modeType = "edit";
    dialogList.value.title = "编辑";
    dialogList.value.pid = pid;
    dialogVisible.value = true;
  };

  //查看事件
  const lookClick = (pid: number) => {
    detailList.value.modeType = "look";
    detailList.value.title = "查看";
    detailList.value.pid = pid;
    detailVisible.value = true;
  };

  //删除事件
  const delClick = async (pid: number) => {
    console.log(pid);
    ElMessageBox.confirm(`确定要删除该信息吗?`).then(
        async () => {
          let res = (await del({ pid: pid })) as any;
          console.log(res);
          if (res.code == 200) {
            ElMessage.success("删除成功");
            getTableList();
          } else {
            ElMessage.error(res.msg);
          }
        },
        () => {
          ElMessage("取消删除");
        }
    );
  };

   //处理举报
   const operdateClick = async (pid: number) => {
    console.log(pid);
    ElMessageBox.confirm(`确定要操作吗?`).then(
        async () => {
          let res = (await operdate({ pid: pid })) as any;
          console.log(res);
          if (res.code == 200) {
            ElMessage.success("操作成功");
            getTableList();
          } else {
            ElMessage.error(res.msg);
          }
        },
        () => {
          ElMessage("取消操作");
        }
    );
  };

  //需要触发的按钮需要在这里定义一下
  const map = new Map([
    ['addClick',addClick],
    ['batchDel',batchDel],
    ['searchClick',searchClick],
    ['resetClick',resetClick],
    ['editClick',editClick],
    ['lookClick',lookClick],
    ['delClick',delClick],
    ['operdateClick',operdateClick],
    

  ])

  //字符串转函数方法--列表按钮方法
  const operateClick = (name: string, pid: number,row:any) => {
      if(map.has(name)){
        const func:any = map.get(name);
        console.log(name, pid);
        // dialogList.value.parentEleTag = 'el-dialog'

        func(pid);
      }
  };

  //获取列表数据事件
  const getTableList = async () => {
    let params: any = { pageNum: pageNum.value, pageSize: pageSize.value,sortType:sortType.value,sortColumn:sortColumn.value };
    let arr = Object.keys(queryForm);
    for (let i in queryForm) {
      //无时间段可直接使用
      if (arr.includes(i)) {
        Object.assign(params, queryForm);
      }
      //有时间段需自行获取值之后赋值相应属性
      // if (arr.includes(i)) {
      //   if (i == "lgtime" && queryForm[i]) {
      //     params.startTime = queryForm[i][0];
      //     params.endTime = queryForm[i][1];
      //   } else {
      //     params[i] = queryForm[i];
      //   }
      // }
    }
    let res: any = await getDataListApi(params);
    if (res.code == 200) {
      var data=res.data.list
      const formattedData = data.map(item => ({
        ...item,
        scontent: baseUtil.base64_decode(item.scontent)
     }));
      tableData.value = formattedData;
      total.value = res.data.total;
    } else {
      tableData.value = [];
      total.value = 0;
    }
    setTimeout(() => {
      tabloading.value = false;
    }, 200);
  };

  //分页条数事件
  const handleSizeChange = (val: number) => {
    pageSize.value = val;
    getTableList();
  };

  //页码切换事件
  const handleCurrentChange = (val: number) => {
    pageNum.value = val;
    getTableList();
  };
    //下拉框数据赋值
    const getishandleSelectData =async () =>{
     let tempSelectData=[{label:"待处理",value:"待处理"},{label:"已处理",value:"已处理"}]
     let arr:any[] = tempSelectData.map((item:any)=>{
        return {
            label:item.label,
            value:item.value
        }
     })
     ishandleSelectData.value = arr
  }
  //下拉框数据赋值
  //生命周期hooks
  onMounted(async () => {
    await getishandleSelectData();
    await getQueryList();
    await getButton();
    await getTableColumns();
    await getOperate();
    await getTableList();
  });
</script>

<style scoped lang="scss">
  @use "/@/styles/base/base.scss";
  @use "/@/styles/listpage/listpage.scss";
</style>
