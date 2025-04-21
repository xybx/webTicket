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
import { getImageCode } from "/@/api/user.ts";
import { isPassword, isPhone } from "/@/utils/validate";
import * as crypto from "sm-crypto";
import { publicKeyStore } from "/@/store/modules/publicKey";
import * as dd from 'dingtalk-jsapi'; // 此方式为整体加载，也可按需进行加载
import { initDingH5RemoteDebug } from "dingtalk-h5-remote-debug";
initDingH5RemoteDebug();
defineOptions({
  name: "Login",
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

const validatePhone = (rule: any, value: any, callback: any) => {
  if (!isPhone(value)) callback(new Error(translate("请输入正确的手机号格式")));
  else callback();
};
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!isPassword(value))
    callback(new Error(translate("密码为8-20位字母和数字的组合")));
  else callback();
};

const getLoginTitle = () => {
  let str = "";
  loginBigTit.value = "迪普电子发票管理系统";
  loginEnTit.value = str.toUpperCase();
  FormTitle.value = "系统自动登录中";
};

function checkCapslock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapslock.value = event.getModifierState("CapsLock");
  }
}

const loginRules = reactive<FormRules>({
  phone: [
    {
      required: true,
      trigger: "blur",
      message: "请输入手机号",
    },
    {
      min: 11,
      message: "请输入正确的手机号格式",
      trigger: "blur",
      validator: validatePhone,
    },
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    {
      trigger: "blur",
      validator: validatePassword,
    },
  ],
  code: [
    { required: true, trigger: "blur", message: "请输入验证码" },
    {
      min: 5,
      max: 5,
      trigger: "blur",
      message: "请输入正确格式的验证码",
    },
  ],
});

const handleRoute = () => {
  return redirect.value === "/404" || redirect.value === "/403"
    ? "/"
    : redirect.value;
};

const handleLogin = async () => {

  dd.ready(() => {
        // 获取临时授权码
        dd.runtime.permission.requestAuthCode({
          corpId: 'dinged6a98a5bae57f31', // 替换为你的CorpID
          onSuccess: function(result:any) {
            const tmpAuthCode = result.code;
           // FormTitle.value=tmpAuthCode;
            console.log('临时授权码:', tmpAuthCode);

            autologinclick(tmpAuthCode);
            // 使用临时授权码获取用户信息
          },
          onFail: function(err:any) {
            FormTitle.value=err;
            console.error('获取临时授权码失败:', err);
          }
        });
      });
}

const autologinclick = async (code: any) => {
  try
  {
       let json: string = JSON.stringify({
           code: code
       });
       await userStore.autologin(json).catch(async () => {
       });
       await router.push(handleRoute());
     } finally {
       loading.value = false;
     }
};

       



onMounted(async () => {
  getLoginTitle();
  await handleLogin();
  //await autologinclick('0ef61c64ce7c3977809c11c8cf23539e');
});
// 刷新验证码
const reLoadCode = async () => {
  let res = (await getImageCode()) as any;
  captchaImg.value = res.captchaImg;
  captchaKey.value = res.captchaKey;
};

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
