<template>
  <main class="main">
    <p>当前用户：{{ userName }}</p>
    <button @click="init">初始化聊天</button>
    <Streams :chatInit="chatInit" :userName="userName"/>
  </main>
</template>

<script setup lang="ts">
import {ref} from "vue";
import Streams from "./components/Streams.vue";
const chatInit = ref<boolean>(false)
const userName = Math.random().toString(36).substring(7)

const init = () => {
  chatInit.value = true
}

</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
