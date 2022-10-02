<template>
  <div>
    <button @click="getMediaDevices">获取摄像头和麦克风</button>
    <video style="width: 500px;height: 500px"></video>
  </div>
</template>

<script setup lang="ts">

const getMediaDevices = async () => {
  // 获取用户的视频和音频权限
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
  console.log(stream, 'st')
}

</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
