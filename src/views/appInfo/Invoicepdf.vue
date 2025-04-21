<template>
  <component :is="dialogList?.parentEleTag" v-bind="dialogList?.parentOptions">
  <!--<PDFPreview v-if="dialogVisible" page-scale="page-fit" width="100%" :height="700" theme="light" :src="pdfUrl" @loaded="onLoaded" />-->
    <PreviewPDF v-if="dialogVisible" :pdfUrl="pdfUrl" />
  </component>
</template>

<script lang="ts" setup>
// import PDFPreview from "/@/components/global/PDFPreview.vue";
import PreviewPDF from "/@/components/global/PreviewPDF.vue";
import { Loading } from '@element-plus/icons-vue'
import type {DialogProps} from "/@/types/appinfo/InvoicefileTypes.ts";
defineOptions({
  name: 'Invoicepdf',
});

const dialogVisible = defineModel<boolean>("dialogVisible");
const dialogList = defineModel<DialogProps | any>("dialogList");

const pdfUrl = ref<string>('http://storage.xuetangx.com/public_assets/xuetangx/PDF/PlayerAPI_v1.0.6.pdf');
//const pdfUrl = ref<string>('');

// 判断文件加载完成
const onLoaded = (pdfApp) => {

}
// 获取pdf预览地址
const getPdfList = ()=>{

}

// 监听获得弹出框内容
watch(dialogVisible, async (newValue, b) => {
  if(newValue){
    getDialog()
    debugger;
    pdfUrl.value=dialogList.value.pid
  }

});
const getDialog = () => {
  // 标签名
  dialogList.value.parentEleTag = "el-dialog";
  // 属性
  dialogList.value.parentOptions = {
    modelValue: dialogVisible,
    title: dialogList.value?.title,
    width: "68%",
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
  console.log('789855241')
  dialogVisible.value = false;
  pdfUrl.value='';
  for (let i = 0; i < dialogList.value.length; i++) {
    const item = dialogList.value[i];
    item.value = "";
  }
};

</script>

<style lang="scss" scoped>
</style>
