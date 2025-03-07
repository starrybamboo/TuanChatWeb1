<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/instance'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const visible = ref(false)
const isRegisterForm = ref(false)

const loginForm = ref({
  userId: '',
  password: ''
})

const registrationData = ref({
  nickname: '',
  password: ''
})

const handleLogin = async () => {
  try {
    loading.value = true
    const result = await api.userController.login({
      userId: Number(loginForm.value.userId),
      password: loginForm.value.password
    })
    const userInfo = await api.userController.getUserInfo(Number(loginForm.value.userId))
    // 保存token和用户信息
    userStore.setToken(result.data!)
    userStore.setUserInfo(userInfo.data!)
    // 登录成功后跳转到首页
    router.push('/feed')
    visible.value = false
  } catch (error) {
    console.error('登录失败：', error)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  try {
    loading.value = true
    // TODO: 实现注册逻辑
    console.log('注册信息：', registrationData.value)
    // 注册成功后切换到登录表单
    isRegisterForm.value = false
  } catch (error) {
    console.error('注册失败：', error)
  } finally {
    loading.value = false
  }
}

const show = () => {
  visible.value = true
  isRegisterForm.value = false
}

const switchForm = () => {
  isRegisterForm.value = !isRegisterForm.value
}

defineExpose({
  show
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isRegisterForm ? '注册' : '登录'"
    width="600px"
    :close-on-click-modal="false"
    class="login-dialog"
  >
    <el-form
      v-if="!isRegisterForm"
      :model="loginForm"
      label-width="auto"
      :disabled="loading"
      @submit.prevent="handleLogin"
      class="login-form"
    >
      <el-form-item
        label="账号ID"
        prop="userId"
        :rules="[
          { required: true, message: '账号ID是必须项' },
          { type: 'number', message: '账号ID必须是一个数字' }
        ]"
      >
        <el-input
          v-model.number="loginForm.userId"
          type="text"
          autocomplete="on"
          class="input-field"
        />
      </el-form-item>
      <el-form-item
        label="密码"
        prop="password"
        :rules="[{ required: true, message: '密码是必填项' }]"
      >
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          class="input-field"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="login-button"
          @click="handleLogin"
        >
          登录
        </el-button>
        <el-button
          type="text"
          @click="switchForm"
          class="register-button"
        >
          注册新账号
        </el-button>
      </el-form-item>
    </el-form>

    <el-form
      v-else
      :model="registrationData"
      label-width="auto"
      :disabled="loading"
      @submit.prevent="handleRegister"
      class="login-form"
    >
      <el-form-item
        label="昵称"
        prop="nickname"
        :rules="[{ required: true, message: '昵称是必填项' }]"
      >
        <el-input
          v-model="registrationData.nickname"
          placeholder="请输入昵称"
          class="input-field"
        />
      </el-form-item>

      <el-form-item
        label="密码"
        prop="password"
        :rules="[{ required: true, message: '密码是必填项' }]"
      >
        <el-input
          v-model="registrationData.password"
          type="password"
          placeholder="请输入密码"
          class="input-field"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="login-button"
          @click="handleRegister"
        >
          注册
        </el-button>
        <el-button
          type="text"
          @click="switchForm"
          class="register-button"
        >
          返回登录
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog) {
  background: url('https://t.alcy.cc/ycy') no-repeat center center;
  background-size: cover;
}

:deep(.el-dialog__body) {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 10px 10px;
}

:deep(.el-dialog__header) {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px 10px 0 0;
  margin-right: 0;
}

.login-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.login-form {
  width: 100%;
}

.input-field {
  width: 100%;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s;
}

:deep(.el-input__wrapper:hover) {
  border-color: #75409a;
}

.login-button {
  width: 100%;
  margin-bottom: 1rem;
  background-color: #75409a;
  border: none;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #5a307a;
}

.register-button {
  width: 100%;
  color: #75409a;
}

.register-button:hover {
  color: #5a307a;
}
</style>