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
          v-model:fit="fit"
          @sortClick="sortChange"
          @rowClick="rowClick"
          @selectClick="handleSelectionChange"
          @operateClick="operateClick"
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
      <lookDialog ref="lookRef" v-model:dialogVisible="dialogVisible" v-model:dialogList="dialogList"/>

    </div>
  </el-card>
</template>

<script setup lang="ts">
  import buttonRef from "/@/components/global/buttonRef.vue";
  import queryRef from "/@/components/global/queryRef.vue";
  import tableRef from "/@/components/global/tableRef.vue";
  import lookDialog from "./InvoicefileList.vue";
  import type {
    TableColumnProps,
    TableProps,
    ButtonProps,
    JsonProps,
    DialogProps,
  } from "/@/types/appinfo/InvoiceTypes";
  import { getAllDataListApi, updateChecck, putMultiDel,getbathStaticDownloadFileToken,baseUrl
  } from "/@/api/appinfo/InvoiceApi";
  import { translate } from "/@/i18n";
  import { getTopButton } from "/@/utils/Button";
  import {ElMessage, ElMessageBox, FormRules,ElLoading  } from "element-plus";

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

 // 创建下拉框对象数组
 const ischeckSelectData = ref<any[]|[]>([])


  const dialogVisible = ref<boolean>(false);
  const dialogList = ref<DialogProps>({});
  const detailVisible = ref<boolean>(false);
  const detailList = ref<DialogProps>({});
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
            label:'提交人:',
        },
        bindVal: 'addusername',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('提交人'),
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
                   { prop: 'title', label: '事项名称', sortable: false },
                    {prop: 'filenum', label: '发票数量',sortable:false},

                    {prop: 'autonum', label: '生成号',sortable:false},

                    {prop: 'addusername', label: '提交人',sortable:false},

                    {prop: 'addtime', label: '提交时间',sortable:false},

                    {prop: 'ischeck', label: '核实状态',sortable:false},

     ]
  }

  const getOperate = () => {
    operateBtn.value = getTopButton([
     { name: "核实", funName: "updateChecckClick" },
      { name: "一键下载", funName: "allDownClick" },
      { name: "查看", funName: "lookClick" },
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

  //一键下载
  const allDownClick = async (pid: any) => {
  debugger;
    let loadingInstance1 = ElLoading.service({ fullscreen: true });
    console.log(222);
    
    let res = (await getbathStaticDownloadFileToken({ pid: pid })) as any;
           console.log(res,'11111');
           loadingInstance1.close();
           if (res.code == 200) {
             downLoadFile(res.data);
             //window.open('invoice/appsystem-invoicefile/downloadfile?token='+res.data);
           } else {
             ElMessage.error(res.msg);
           }
  };

  //查看事件
  const lookClick = (pid: any) => {
    dialogList.value.modeType = "look";
    dialogList.value.title = "电子发票列表";
    dialogList.value.pid = pid;
    dialogVisible.value = true;
  };

  //核实
  const updateChecckClick = async (pid: any) => {
    console.log(pid);
    ElMessageBox.confirm(`确定要核实该信息吗?`).then(
        async () => {
          var d={};
          d.pid=pid;
          let res = (await updateChecck(d)) as any;
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

    ['searchClick',searchClick],
    ['resetClick',resetClick],
    ['allDownClick',allDownClick],
    ['lookClick',lookClick],
    ['updateChecckClick',updateChecckClick]

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
      //if (arr.includes(i)) {
        //Object.assign(params, queryForm);
      //}
      //有时间段需自行获取值之后赋值相应属性
       if (arr.includes(i)) {
         if (i == "addtime" && queryForm[i]) {
           params.bgaddtime = queryForm[i][0];
           params.edaddtime = queryForm[i][1];
         } else {
           params[i] = queryForm[i];
         }
     }
    }
    let res: any = await getAllDataListApi(params);
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

  //生命周期hooks
  onMounted(async () => {
    await getstatusSelectData()
    await getQueryList();
    await getButton();
    await getTableColumns();
    await getOperate();
    await getTableList();
  });

  // 下载文件
const downLoadFile = (pid: any) => {
  let a = document.createElement("a") as any;
  a.style = "display: none"; // 创建一个隐藏的a标签
  a.target="_blank";
  a.href = baseUrl+pid;
  a.download=pid+".pdf";
  document.body.appendChild(a);
  a.click(); // 触发a标签的click事件
  document.body.removeChild(a);
};
</script>

<style scoped lang="scss">
  @use "/@/styles/base/base.scss";
  @use "/@/styles/listpage/listpage.scss";
</style>
