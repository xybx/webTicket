<template>
  <div class="page-tool">
    <div class="page-tool-item" @click="lastPage">上一页</div>
    <div class="page-tool-item" @click="nextPage">下一页</div>
    <div class="page-tool-item">{{ state.pageNum }}/{{ state.numPages }}</div>
    <div class="page-tool-item" @click="pageZoomOut">放大</div>
    <div class="page-tool-item" @click="pageZoomIn">缩小</div>
  </div>
  <div class="pdf-preview">
    <div class="pdf-wrap">
      <vue-pdf-embed :source="{url:state.source, cMapUrl: 'https://unpkg.com/browse/pdfjs-dist@3.4.120/cmaps/', cMapPacked: true }" :style="scale" class="vue-pdf-embed" :page="state.pageNum" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, computed } from "vue";
import VuePdfEmbed from "vue-pdf-embed";
import { createLoadingTask } from "vue3-pdfjs";

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
  },
});

const state = reactive({
  source: props.pdfUrl, //预览pdf文件地址
  pageNum: 1, //当前页面
  scale: 1, // 缩放比例
  numPages: 1, // 总页数
});
const scale = computed(() => `transform:scale(${state.scale})`);

function lastPage() {
  if (state.pageNum > 1) {
    state.pageNum -= 1;
  }
}

function nextPage() {
  if (state.pageNum < state.numPages) {
    state.pageNum += 1;
  }
}

function pageZoomOut() {
  if (state.scale < 2) {
    state.scale += 0.1;
  }
}

function pageZoomIn() {
  if (state.scale > 1) {
    state.scale -= 0.1;
  }
}

onMounted(()=>{
  // const loadingTask = createLoadingTask(state.source);
  // loadingTask.promise.then((pdf) => {
  //   console.log(pdf)
  //   state.numPages = pdf.numPages;
  // });
})


</script>

<style lang="scss" scoped>
.pdf-preview {
  margin-top: 10px;
  display: flex;
  flex: 1;
  padding:0;
  height:74vh;
  box-sizing: border-box;
  background-color: #fff;
}
.pdf-wrap {
  display: flex;
  flex: 1;
  height: 100%;
  overflow-y:auto;
}
:deep(.vue-pdf-embed) {
  text-align: center;
  width: 100%;
  border: 1px solid #e5e5e5;
  margin: 0 auto;
  box-sizing: border-box;
  &>div{
    width: 100%;
    height: 100%;
  }
}

.page-tool {
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(66, 66, 66);
  color: white;
  border-radius: 19px;
  margin-left: 10%;
  margin-right: 10%;
}

.page-tool-item {
  cursor: pointer;
  padding: 10px 0;
  padding-left: 10px;
  width: 33%;
  text-align: center;
}
:deep(.vue-pdf-embed__page){
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  canvas{
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
