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
          v-model:fit="fit"
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
      <editDialog
          v-model:dialogVisible="dialogVisible"
          @getData="getTableList"
          v-model:dialogList="dialogList"
      />
      <lookDialog
          ref="lookRef"
          v-model:dialogVisible="detailVisible"
          v-model:dialogList="detailList"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
  import buttonRef from "/@/components/global/buttonRef.vue";
  import queryRef from "/@/components/global/queryRef.vue";
  import tableRef from "/@/components/global/tableRef.vue";
  import lookDialog from "./InvoicefileList.vue";
  import editDialog from "./InvoiceDialog.vue";
  import type {
    TableColumnProps,
    TableProps,
    ButtonProps,
    JsonProps,
    DialogProps,
  } from "/@/types/appinfo/InvoiceTypes";
  import { getDataListApi, del, putMultiDel
  } from "/@/api/appinfo/InvoiceApi";
  import { translate } from "/@/i18n";
  import { getTopButton } from "/@/utils/Button";
  import { ElMessage, ElMessageBox } from "element-plus";
  defineOptions({
    name: 'InvoiceList',
  });

const route = useRoute();
  const router = useRouter();
  let title: any = route.meta.title;
  const fit = ref<boolean>(true)
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
 const ischeckSelectData = ref<any[]|[]>([])
  // 创建下拉框对象数组
  // 获取头部左侧及右侧按钮配置或自己配置json
  const getButton = () => {
    leftBtnObj.value = getTopButton([
    { name: "新增", funName: "addClick" },
    ]) as ButtonProps[];
    rightBtnObj.value = getTopButton([
      { name: "搜索", funName: "searchClick" },
      { name: "重置", funName: "resetClick" },
    ]) as ButtonProps[];
  };
  const getTableOptions = () => {
  };

  // 获取查询条件接口或json
  const getQueryList = () => {
    queryList.value = [
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'事项名称:',
        },
        bindVal: 'title',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('事项名称'),
             clearable: true,
             autocomplete: "off",
             type: "text",
        },
      },
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'生成号:',
        },
        bindVal: 'autonum',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('生成号'),
             clearable: true,
             autocomplete: "off",
             type: "text",
        },
      },
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'提交时间:',
        },
        bindVal: 'addtime',
        curEleTag: "el-date-picker",
        curOptions: {
              clearable: true,
              type: "datetimerange",
                    "range-separator": "至",
                    "start-placeholder": "提交开始日期",
                    "end-placeholder": "提交结束日期",
              format: "YYYY-MM-DD HH:mm:ss",
                    "value-format": "YYYY-MM-DD HH:mm:ss",
             },

      },
      {
        parentEleTag:'el-form-item',
        parentOptions:{
            label:'核实状态:',
        },
        bindVal: 'ischeck',
        curEleTag: "el-select",
        childEleTag: "el-option",
        curOptions: {
              placeholder:translate('核实状态'),
              clearable: true,
        },
        childOptions: ischeckSelectData.value,
      },
  ]};
  //格式化表格某些字段的数据
  const formatStatus = (obj: any) => {
    return obj == 0 ? "未办理" : "已办理";
  };

  //列表字段数据获取或json配置
  const getTableColumns = () => {
    tableColumns.value = [
                    {prop: 'title', label: '事项名称',sortable:false},

                    {prop: 'autonum', label: '生成号',sortable:false},

                    {prop: 'addtime', label: '添加时间',sortable:false},

                    {prop: 'ischeck', label: '核实状态',sortable:false},

     ]
  }

  const getOperate = () => {
    operateBtn.value = getTopButton([
      { name: "编辑", funName: "editClick" },
      { name: "查看", funName: "lookClick" },
      { name: "删除", funName: "delClick" },
    ]) as ButtonProps[];
  };

  //添加事件
  const addClick = () => {
    console.log("add");
    dialogList.value.modeType = "add";
    dialogList.value.title = "新增";
    dialogList.value.pid="-1";
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
    detailList.value.title = "电子发票列表";
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

  //需要触发的按钮需要在这里定义一下
  const map = new Map([
    ['addClick',addClick],
    ['batchDel',batchDel],
    ['searchClick',searchClick],
    ['resetClick',resetClick],
    ['editClick',editClick],
    ['lookClick',lookClick],
    ['delClick',delClick]

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
         if (i == "addtime" && queryForm[i]) {
           params.bgaddtime = queryForm[i][0];
           params.edaddtime = queryForm[i][1];
         } else {
           params[i] = queryForm[i];
         }
     }
    }
    let res: any = await getDataListApi(params);
    if (res.code == 200) {
      tableData.value = res.data.list;
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
   const getstatusSelectData =async () =>{
     let tempSelectData=[{label:"未核实",value:"未核实"},{label:"已核实",value:"已核实"}]
     let arr:any[] = tempSelectData.map((item:any)=>{
        return {
            label:item.lable,
            value:item.value
        }
     })
     ischeckSelectData.value = arr
   }
  //下拉框数据赋值
watch(()=> router.currentRoute.value.path,async (newVal,oldValue)=>{
  $pub('reload-router-view')
},{deep:true})
  //下拉框数据赋值
  //生命周期hooks
  onMounted(async () => {
    await getstatusSelectData();
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
