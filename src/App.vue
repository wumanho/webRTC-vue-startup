<template>
  <div style="display: flex;flex-direction: column;width: 500px">
    <div>当前用户：{{ userName }}</div>
    <button @click="initRTC">初始化 RTC 流</button>
    <video ref="localVideoRef" autoplay controls style="width: 400px;height: 200px"></video>
    <video ref="remoteVideoRef" autoplay controls style="width: 400px;height: 200px"></video>
    <button @click="createOffer" style="width: 200px">创建 offer</button>
    <button @click="createAnswer" style="width: 200px">创建 answer</button>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const localVideoRef = ref<HTMLVideoElement>()
const pc = ref<RTCPeerConnection>()
const remoteVideoRef = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
const ws = ref(new WebSocket('ws://127.0.0.1:1234'))
const userName = Math.random().toString(36).substring(7)


const initRTC = async () => {
  // getMediaDevices 获取音视频设备
  initWs()
  await getMediaDevices()
  // createRTCConnection 创建 RTC 连接
  createRTCConnection()
  // addLocalStreamToRTCConnection 将本地视频流添加到 RTC 连接
  addLocalStreamToRTCConnection()

}

const initWs = () => {
  ws.value.onopen = () => {
    console.log('ws 已经打开')
  }
  ws.value.onmessage = onWSMessage
}

const onWSMessage = (e: MessageEvent) => {
  const _wsData = JSON.parse(e.data)
  // 如果消息是自己发送的，跳过处理
  if (_wsData['userName'] === userName) return
  const wsData = _wsData['data']
  // 将远端 candidate 候选地址自动填入
  if (_wsData['type'] === 'candidate') {
    setCandidate(wsData)
  } else {
    // 将远端 offer/answer 消息自动填入
    setRemoteDesc(wsData)
  }
}

const setRemoteDesc = (wsData: any) => {
  const remoteSDP = JSON.parse(wsData)
  pc.value?.setRemoteDescription(new RTCSessionDescription(remoteSDP))
  console.log('设置远程描述成功')
}

// 添加候选地址
const setCandidate = (wsData: any) => {
  pc.value?.addIceCandidate(new RTCIceCandidate(JSON.parse(wsData)))
  console.log('添加候选成功')
}

const getMediaDevices = async () => {
  // 获取用户的视频和音频权限
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
  localVideoRef.value!.srcObject = stream
  localStream.value = stream
}

// 创建 rtc 连接
const createRTCConnection = () => {
  const _pc = new RTCPeerConnection({
    iceServers: [{urls: 'stun:stun.stunprotocol.org:3478'}]
  })
  _pc.onicecandidate = e => {
    if (e.candidate) {
      wsSend('candidate', JSON.stringify(e.candidate))
    }
  }
  // 监听远程媒体流，当远程媒体流有数据时，将数据添加到 video 标签
  _pc.ontrack = e => {
    remoteVideoRef.value!.srcObject = e.streams[0]
  }
  pc.value = _pc
  console.log('创建 rtc 连接成功')
}

// 将本地视频流添加到 RTC 连接中
const addLocalStreamToRTCConnection = () => {
  const _localStream = localStream.value
  _localStream?.getTracks().forEach(track => {
    pc.value?.addTrack(track, _localStream)
  })
}

// 创建 offer，用于创建会话描述协议 SDP 包含音视频解码器，主机候选地址等信息
// 建立连接的双方需要互相交换 SDP
const createOffer = async () => {
  const sdp = await pc.value?.createOffer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  })
  pc.value?.setLocalDescription(sdp)
  // 通过 websocket 发送 offer 数据
  wsSend('offer', JSON.stringify(sdp))
}

// 创建 answer ，跟 offer 对应
const createAnswer = async () => {
  const sdp = await pc.value?.createAnswer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  })
  pc.value?.setLocalDescription(sdp)
  wsSend('answer', JSON.stringify(sdp))
}

const wsSend = (type: string, data: any) => {
  // 通过 websocket 发送 offer 数据
  ws.value.send(JSON.stringify({
    userName,
    type,
    data
  }))
}

</script>

<style scoped>
</style>
