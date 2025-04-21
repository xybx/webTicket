<template>
   <component :is="dialogList?.parentEleTag" v-bind="dialogList?.parentOptions">
   <el-card class="box-card ticketcard">
    <template #header>
      <div class="card-header">
        <span>电子发票上传</span>
        <u>(提示:请上传pdf格式,不可以上传重复的电子发票)</u>
      </div>
    </template>
    <div class="text item">
      <el-form class="ticketForm" :model="form" label-width="auto" :rules="rules" label-position="left" ref="formRef">
        <el-form-item v-for="item in detailsTitle" :label="item.dp_title" :prop="item.dp_name"><!-- 输入框 -->
          <template v-if="item.dp_type == 'text'" >
            <el-input v-model="form[item.dp_name]" :placeholder="item.dp_placeholder"/>
          </template>
        </el-form-item>
        <el-button type="primary" v-show="editform" class="save" @click="save(formRef)">保存</el-button>
      </el-form>
      <el-upload   :file-list="[]" list-type="text" class="fileUpload" action="#"   :http-request="(params) => UploadFTPFiles(params)">
      <el-button v-show="editform" type="primary">上传文件</el-button> 
     </el-upload>
      <div class="tablebox">
        <span>共上传了<u>{{total}}</u>张</span>
        <tableRef
          ref="tableRefs"
          v-model:tableData="tableData"
          v-model:tableColumns="tableColumns"
          v-model:tabloading="tabloading"
          v-model:loadingText="loadingText"
          v-model:operateBtn="operateBtn"
          v-model:index="index"
          v-model:fit="fit"
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
    </div>
</el-card>
<Invoicepdf v-model:dialogVisible="pdfVisible" v-model:dialogList="pdfList" />
</component>
</template>
<style>
.upload-hide-list .el-upload-list {
  display: none;
}
 .el-upload-list
 {
  display: none;
 }
/* 如果需要隐藏上传按钮下方的提示信息 */
.upload-hide-list .hidden {
  display: none;
}
</style>
<script setup lang="ts">
import tableRef from "/@/components/global/tableRef.vue";
import {ElMessage, ElMessageBox, FormRules,ElLoading  } from "element-plus";
import type { DialogProps } from "/@/types/listTypes";
import type {TableColumnProps, TableProps, ButtonProps, JsonProps,} from "/@/types/appinfo/InvoicefileTypes";
import {selectById, addfile, update,addinvoice} from "/@/api/appinfo/InvoiceDialogApi";
import { getDataListApi, del, putMultiDel,downloadfiletoken,baseUrl} from "/@/api/appinfo/InvoicefileApi";
import {getTopButton} from "/@/utils/Button.ts";
import Invoicepdf from './Invoicepdf.vue'
const emits = defineEmits(["getData"]);

const formRef = ref();
const form: any = reactive({});
const btnRef = ref<any>();
const queRef = ref<any>();
const tableRefs = ref<any>();
const tableData = ref<TableProps[] | []>([]);
const tabloading = ref<boolean>(true);
let editform = true;
const tableColumns = ref<TableColumnProps[] | []>([]);
const loadingText = ref<string>("");
const stitle = ref<string>("");
const stitletip = ref<string>("请输入事项标题");

const total = ref<number>(0);
const pageSizes = ref<number[]>([10, 15, 20, 30]);
const pageSize = ref<number>(10);
const pageNum = ref<number>(1);
const operateBtn = ref<ButtonProps[] | []>([]);
const sortColumn = ref<string | null>("pid");
const sortType = ref<string | null>("DESC");
const tailRef = ref<any>();
const menuRef = ref<any>();
const labelwidth = ref<string>("80px");
const tableList = ref<JsonProps>({});
let queryForm = reactive<any>({});
const selectedRows = ref<string[]>([]);
const index = ref<boolean>(true)
const fit = ref<boolean>(true)

const detailVisible = ref<boolean>(false);
const detailList = ref<DialogProps>({});

const pdfVisible = ref<boolean>(false);
const pdfList = ref<DialogProps>({});


// 删除加载的图片/
const deleteImg = (file: any, item: any) => {
  console.log(file, item);

  ElMessageBox.confirm(`确定要删除这个文件嘛?`).then(
    async () => {
      let res = (await del({ pid: file.pid })) as any;
      console.log(res);
      if (res.code == 200) {
        // 获得文件列表
        getTableList();
        ElMessage.success("删除成功");
      } else {
        ElMessage.error(res.msg);
      }
    },
    () => {
      ElMessage.info("取消删除");
    }
  );
};
let pid="-1";
// 保存
const save = async (formEl: any) => {
  await formEl.validate(async (valid: any, fields: any) => {
    if (valid) {
      let loadingInstance1 = ElLoading.service({ fullscreen: true });
      // 编辑
      if (pid!="-1") {
        form.pid = pid;
        await update(form)
          .then((result: any) => {
            if (result.code == 200) {
              ElMessage.success("编辑成功");
              loadingInstance1.close();
              emits("getData");
            }
            else
            {
              ElMessage.error(result.msg);
            }
          })
          .catch((err) => {
            loadingInstance1.close();
          });
      } else if (pid=="-1") {
        form.drivermsgpid = 1;
        await addinvoice(form)
          .then((result: any) => {
            if (result.code == 200) {
              ElMessage.success("保存成功");
               pid=result.data;
               loadingInstance1.close();
               emits("getData");
            }
            else
            {
              ElMessage.error(result.msg);
            }
          })
          .catch((err) => {
            loadingInstance1.close();
          });
      }
    } else {
      ElMessage.error("请输入必填项");
    }
  });
};
const clearForm = () => {
  for (let i = 0; i < detailsTitle.value.length; i++) {
    const item = detailsTitle.value[i];

    item[item.dp_name] = "";
    item.dp_fileList = [];
  }

  for (const key in form) {
    form[key] = "";
  }
};

async function UploadFTPFiles(option: any) {
  if (pid == "-1") {
    ElMessage.error("请选保存事项");
    return;
  }
  var data = new FormData(); //自定义 参数类型必须为 FormData格式 此为强制要求
  data.append("file", option.file);
  data.append("invoiceid", pid);
  // let loadingInstance1 = ElLoading.service({ fullscreen: true });
  try {
    const res = (await addfile(data)) as any;
    if (res.code === 200) {
      console.log(res, res.data.filePid);
      getTableList();
    } else {
      if (res.data != "" && res.data != undefined && res.data != null) {
        ElMessageBox.alert(
          res.msg + ":" + res.data,
          '提示',
          {
            confirmButtonText: '确定',
            type: 'success',
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
          }
        ).then(() => {
          console.log('已确认')
        })
      }
      else {
        ElMessage.error(res.msg)

      }
    }
  }
  catch (res: any) {
    console.log('上传失败' + res.msg);
    if (res.data != "" && res.data != undefined && res.data != null) {
      ElMessageBox.alert(
        res.msg + ":" + res.data,
        '提示',
        {
          confirmButtonText: '确定',
          type: 'success',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
        }
      ).then(() => {
        console.log('已确认')
      })
    }
    else {
      ElMessage.error(res.msg)

    }

  }
}

// 获取文件列表


const dialogVisible = defineModel<boolean>("dialogVisible");
const dialogList = defineModel<DialogProps | any>("dialogList");

const detailsTitle = ref<any>([
      {
        dp_title: "事项名称:",
        dp_name: "title",
        title: "",
        dp_type: "text",
        dp_placeholder:"请输入事项名称",
      }
]);

const rules = reactive<FormRules>({
});


// 下载文件
const downLoadFile = (file: any) => {

  let a = document.createElement("a") as any;
  a.style = "display: none"; // 创建一个隐藏的a标签
  a.href = baseUrl + file;
  document.body.appendChild(a);
  a.click(); // 触发a标签的click事件
  document.body.removeChild(a);
};
const getOperate = () => {
  debugger;
  let btndata=[
  { name: "查看", funName: "lookFileClick" },
    { name: "下载", funName: "lookClick" },
    { name: "删除", funName: "delClick" },
  ];
  if(!editform)
{
  btndata=[
  { name: "查看", funName: "lookFileClick" },
    { name: "下载", funName: "lookClick" }]
}
  operateBtn.value = getTopButton(btndata) as ButtonProps[];
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

const getTableColumns = () => {
  tableColumns.value = [
    {prop: 'invoicenum', label: '发票号码',sortable:false},
  ]
}
  //查看事件
  const lookClick = async (pid: number) => {
   
    let res = (await downloadfiletoken({ pid: pid })) as any;
           console.log(res);
           if (res.code == 200) {
             downLoadFile(res.data);
             //window.open('invoice/appsystem-invoicefile/downloadfile?token='+res.data);
           } else {
             ElMessage.error(res.msg);
           }
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
    ['lookFileClick',lookFileClick],
    ['lookClick',lookClick],
    ['delClick',delClick]
  ])

  //字符串转函数方法--列表按钮方法
  const operateClick = (name: string, pid: number,row:any) => {
      if(map.has(name)){
        const func:any = map.get(name);
        console.log(name, pid);
        func(pid);
      }
  };

  //获取列表数据事件
  const getTableList = async () => {
    let params: any = {invoiceid:pid, pageNum: pageNum.value, pageSize: pageSize.value,sortType:sortType.value,sortColumn:sortColumn.value };
    let arr = Object.keys(queryForm);
    for (let i in queryForm) {
      //无时间段可直接使用
      if (arr.includes(i)) {
        Object.assign(params, queryForm);
      }
    }
     let res: any = await getDataListApi(params);
    tableData.value = [];
    total.value = 0;
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

  //获取列表数据事件
  const getInfo = async () => {
    debugger;
    let res = (await selectById({ pid: pid })) as any;
    debugger;
      if (res.code == 200) {
        debugger;
        if(res.data["ischeck"]=="已核实")
      {
        editform=false;
      }
        detailsTitle.value.map((key: any) => {
          key[key.dp_name] = res.data[key.dp_name];
          form[key.dp_name] = key[key.dp_name];
        });
      } else {
        ElMessage.error(res.msg);
      }
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

  onMounted(async () => {

  });


// 监听获得弹出框内容
watch(dialogVisible, async (newValue, b) => {
  if(newValue){
    getDialog();
    debugger;
    pid=dialogList.value?.pid
    if(pid!="-1")
      {
        await getInfo();
      }
      await getTableColumns();
      await getOperate();
      await getTableList();
      
  }
    
   
});


  const getDialog = () => {
    console.log(dialogVisible);
    
  // 标签名
  dialogList.value.parentEleTag = "el-dialog";
  // 属性
  dialogList.value.parentOptions = {
    modelValue: dialogVisible,
    title: dialogList.value?.title,
    width: "50%",
    class: "dialogbox",
    "close-on-click-modal": false,
    appendToBody: true,
    "align-Center": true,
    center: true,
    "before-close": handleClose,
  };
  // 方法
  // dialogList.value.parentEvent = {};
  };

  const handleClose = () => {
    clearForm();
    editform=true;
    tableData.value = [];
    total.value = 0;
    dialogVisible.value = false;
    for (let i = 0; i < dialogList.value.length; i++) {
     const item = dialogList.value[i];
     item.value = "";
    
  }
};
</script>

<style scoped lang="scss">
@use "/@/styles/dialog/dialog.scss";
@use "/@/styles/base/base.scss";
</style>
