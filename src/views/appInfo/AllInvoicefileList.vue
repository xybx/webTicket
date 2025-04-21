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
          v-model:operateBtnWidth="operateBtnWidth"
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
      </div>
      <Invoicepdf  v-model:dialogVisible="pdfVisible" v-model:dialogList="pdfList" />
    </el-card>
   
  </template>

<script setup lang="ts">
  import buttonRef from "/@/components/global/buttonRef.vue";
  import queryRef from "/@/components/global/queryRef.vue";
  import tableRef from "/@/components/global/tableRef.vue";
  import type {
    TableColumnProps,
    TableProps,
    ButtonProps,
    JsonProps,
    DialogProps,
  } from "/@/types/appinfo/InvoicefileTypes";
  import { getDataListApi, del, downloadfiletoken,baseUrl,selectAllInvoicefile
  } from "/@/api/appinfo/InvoicefileApi";
  import Invoicepdf from './Invoicepdf.vue'
  import { translate } from "/@/i18n";
  import { getTopButton } from "/@/utils/Button";
  import { ElMessage, ElMessageBox } from "element-plus";
  defineOptions({
    name: 'InvoicefileList',
  });

const route = useRoute();
    const router = useRouter();
  let title: any = route.meta.title;
  const btnRef = ref<any>();
  const queRef = ref<any>();
  const fit = ref<boolean>(true)
  const tableRefs = ref<any>();
  const operateBtnWidth=ref<number>(180);
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
  const pdfVisible = ref<boolean>(false);
  const pdfList = ref<DialogProps>({});

  const dialogVisible = defineModel<boolean>("dialogVisible");
  const dialogList = defineModel<DialogProps | any>("dialogList");

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
            label:'发票号码:',
        },
        bindVal: 'invoicenum',
        curEleTag: "el-input",
        curOptions: {
             placeholder: translate('发票号码'),
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
      }
  ]};
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

  //列表字段数据获取或json配置
  const getTableColumns = () => {
    tableColumns.value = [
      {prop: 'title', label: '事项名称',sortable:false},
      {prop: 'autonum', label: '生成号',sortable:false},
      {prop: 'invoicenum', label: '发票号码',sortable:false},
      {prop: 'addtime', label: '提交时间',sortable:false},
      {prop: 'addusername', label: '提交人',sortable:false},
     ]
  }

  const getOperate = () => {
    operateBtn.value = getTopButton([
      { name: "查看", funName: "lookFileClick" },
      { name: "下载", funName: "downFileClick" },
    ]) as ButtonProps[];
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

  const lookFileClick = async (pid:number)=>{
   
    let res = (await downloadfiletoken({ pid: pid })) as any;
           console.log(res);
           if (res.code == 200) {
            pdfList.value.modeType = "view";
    pdfList.value.title = "发票pdf预览";
    pdfList.value.pid = baseUrl+res.data;
    pdfVisible.value = true;
             //downLoadFile(res.data);
             //window.open('invoice/appsystem-invoicefile/downloadfile?token='+res.data);
           } else {
             ElMessage.error(res.msg);
           }
  }


  //查看事件
   const downFileClick = async (pid: number) => {
     console.log(pid);
     let res = (await downloadfiletoken({ pid: pid })) as any;
           console.log(res);
           if (res.code == 200) {
             downLoadFile(res.data);
             //window.open('invoice/appsystem-invoicefile/downloadfile?token='+res.data);
           } else {
             ElMessage.error(res.msg);
           }
   };

     //查询搜索事件
  const searchClick = () => {
    getTableList();
  };

  //重置
  const resetClick = () => {
    queryForm = reactive<any>({});
    getTableList();
  };

  //需要触发的按钮需要在这里定义一下
  const map = new Map([
     ['resetClick',resetClick],
     ['downFileClick',downFileClick],
     ['lookFileClick',lookFileClick],
     ['searchClick',searchClick],
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
    let params: any = {pageNum: pageNum.value, pageSize: pageSize.value,sortType:sortType.value,sortColumn:sortColumn.value };
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
    let res: any = await selectAllInvoicefile(params);
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
watch(()=> router.currentRoute.value.path,async (newVal,oldValue)=>{
  $pub('reload-router-view')
},{deep:true})
  //下拉框数据赋值
  //生命周期hooks
  onMounted(async () => {
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
