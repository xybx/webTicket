<template>
    <div class="login-container animate__animated animate__backInLeft">
      <el-row>
        <el-col :span="24">
          <div class="top-container">
            <h2
              class="animate__animated animate__backInDown animate__delay-1s"
              :title="loginBigTit"
            >
              {{ loginBigTit }}
            </h2>
            <span
              class="enbox animate__animated animate__fadeInLeft animate__delay-1s"
              >{{ loginEnTit }}</span
            >
          </div>
          <el-card
            class="formbox animate__animated animate__pulse animate__delay-2s"
          >
            <h3>{{ FormTitle }}</h3>
          
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script lang="ts" setup>
  import type { FormInstance, FormRules, InputInstance } from "element-plus";
  import type { OptionProps, LoginData } from "/@/types/loginTypes.ts";
  import { translate } from "/@/i18n";
  import { useUserStore } from "/@/store/modules/user";
  import { isPassword, isPhone } from "/@/utils/validate";
  import * as crypto from "sm-crypto";
  import { publicKeyStore } from "/@/store/modules/publicKey";
  defineOptions({
    name: "AutoLogin",
  });
  
  const keyStore = publicKeyStore();
  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const login = (form: any) => userStore.login(form);
  const loading = ref<boolean>(false);
  const redirect = ref<any>(undefined);
  let timer: ReturnType<typeof setInterval>;
  const isCapslock = ref<boolean>(false); // 是否大写锁定
  const loginFormRef = ref(ElForm); // 登录表单ref
  const loginBigTit = ref<string>("");
  const loginEnTit = ref<string>("");
  const FormTitle = ref<string>("");
  const loginData = ref<LoginData>({
    phone: "",
    password: "",
    code: "",
  });
  const sm2 = crypto.sm2;
  const cipherMode = 1;
  let captchaImg: any = ref("");
  let captchaKey: any = ref("");
  

  
  const getLoginTitle = () => {
    let str = "fapiaoguanlizidongdenglu";
    loginBigTit.value = "发票管理自动登录";
    loginEnTit.value = str.toUpperCase();
    FormTitle.value = "自动登录....";
  };
  
  function checkCapslock(event: KeyboardEvent) {
    // 防止浏览器密码自动填充时报错
    if (event instanceof KeyboardEvent) {
      isCapslock.value = event.getModifierState("CapsLock");
    }
  }
  

  
  const handleRoute = () => {
    return redirect.value === "/404" || redirect.value === "/403"
      ? "/"
      : redirect.value;
  };
  
  const handleLogin = async () => {
    try {
       
       let json: string = JSON.stringify({
           code: "2222222222222222222222"
       });
       await userStore.Testlogin(json).catch(async () => {
        
       });

       localStorage.setItem("phone", loginData.value.phone);
       await router.push(handleRoute());
     } finally {
       loading.value = false;
     }
  };
  
  onMounted(async () => {
    getLoginTitle();
    await handleLogin();
    loginData.value.phone = localStorage.getItem("phone") as any;
  });
 
  
  watchEffect(() => {
    redirect.value = (route.query && route.query.redirect) || "/";
  });
  
  onBeforeRouteLeave((to, from, next) => {
    try {
      if (timer) clearTimeout(timer);
    } catch {
      /* empty */
    }
    next();
  });
  </script>
  <style scoped lang="scss">
  @use "/@/styles/login/loginst.scss";
  </style>
  