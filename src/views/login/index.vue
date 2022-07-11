/* eslint-disable vue/no-deprecated-slot-attribute */
<template>
  <div class="page">
    <el-row type="flex" justify="center" align="middle" class="container">
      <el-col :lg="14" :xl="10" class="hidden-md-and-down">
        <el-row class="panel">
          <el-col :span="12">
            <div class="left">
              <img src="@/assets/login/logo.png" class="logo" />
              <img src="@/assets/login/big-1.png" class="big" />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="right">
              <div class="title-container">
                <h2>智慧社区运营平台</h2>
              </div>

              <div class="login-container">
                <el-form class="login-form" :model="loginForm" :rules="loginRules" ref="loginFormRef">
                  <el-form-item prop="username">
                    <span class="svg-container">
                      <svg-icon icon="user" />
                    </span>
                    <el-input placeholder="username" name="username" type="text" v-model="loginForm.username" />
                  </el-form-item>

                  <el-form-item prop="password">
                    <span class="svg-container">
                      <svg-icon icon="password" />
                    </span>
                    <el-input placeholder="password" name="password" v-model="loginForm.password" :type="passwordType">
                    </el-input>
                    <span class="show-pwd">
                      <svg-icon :icon="passwordType === 'password' ? 'eye' : 'eye-open'" @click="onChangePwdType" />
                    </span>
                  </el-form-item>

                  <el-button
                    type="primary"
                    style="width: 100%; margin-bottom: 30px"
                    :loading="loading"
                    @click="handleLogin"
                  >
                    登录
                  </el-button>
                </el-form>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { validatePassword } from './rules'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
// 数据源
const loginForm = ref({
  username: 'admin',
  password: '123123'
})
// 验证规则
const loginRules = ref({
  username: [
    {
      required: true,
      trigger: 'blur',
      message: '用户名为必填项'
    }
  ],
  password: [
    {
      required: true,
      trigger: 'blur',
      validator: validatePassword()
    }
  ]
})

// 处理密码框文本显示状态
const passwordType = ref('password')
const onChangePwdType = () => {
  if (passwordType.value === 'password') {
    passwordType.value = 'text'
  } else {
    passwordType.value = 'password'
  }
}

// 登录动作处理
const loading = ref(false)
const loginFormRef = ref(null)
const store = useStore()
const router = useRouter()
const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    store
      .dispatch('user/login', loginForm.value)
      .then(() => {
        loading.value = false
        // TODO: 登录后操作
        // 登录消息推送服务端的账户
        axios
          .post('http://106.14.169.149:8089/api/account/login', {
            account: 'admin',
            password: 'admin123'
          })
          .then((res) => {
            localStorage.setItem('chatToken', res.data.data.chatToken)
            console.log(res.data)
          })
        router.push('/dashboard')
      })
      .catch((err) => {
        console.log(err)
        loading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
$cursor: #fff;

.page {
  background-image: url('@/assets/login/bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
}
.container {
  height: inherit;
}
.panel {
  width: 100%;
  min-width: 800px;
  height: 80%;
  max-height: 80%;
  background-color: #fff;
  border-radius: 10px;
  padding: 50px 60px;
  .left {
    box-sizing: border-box;
    .logo {
      display: block;
      width: 80%;
      margin-bottom: 35px;
    }
    .big {
      display: block;
      width: 75%;
      height: auto;
    }
  }
  .right {
    .title-container {
      display: flex;
      margin-top: 10px;
      margin-bottom: 30px;
      h2 {
        font-size: 28px;
        color: #2691ff;
        margin-top: 0;
        margin-bottom: 0;
      }
      span {
        font-size: 16px;
        margin-top: 12px;
        margin-left: 10px;
        color: #999;
      }
    }
    .row {
      margin-bottom: 20px;
      text-align: center;
    }
    .btn {
      width: 100%;
    }
    .link {
      font-size: 14px;
      color: #999;
      cursor: pointer;
      user-select: none;
    }
    .qrCode-container {
      display: flex;
      margin-bottom: 30px;
      .ercode {
        margin-right: 0px;
      }
    }
  }
}

.login-container {
  min-height: 100%;
  width: 100%;
  // background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    // padding: 60px 35px 0;
    margin: 0 auto;
    overflow: hidden;

    ::v-deep(.el-form-item) {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      // color: #454545;
    }

    ::v-deep(.el-input) {
      display: inline-block;
      height: 47px;
      width: 85%;

      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        // color: $light_gray;
        height: 47px;
        caret-color: $cursor;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
