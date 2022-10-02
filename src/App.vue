<template>
  <div style="display: flex;flex-direction: column;width: 500px">
    <button @click="getMediaDevices" style="width: 200px">获取摄像头和麦克风</button>
    <video ref="localVideoRef" autoplay controls style="width: 400px;height: 200px"></video>
    <button @click="addLocalStreamToRTCConnection" style="width: 300px;margin: 80px 0">将本地视频流添加到 RTC 连接中</button>
    <video ref="remoteVideoRef" autoplay controls style="width: 400px;height: 200px"></video>
    <button @click="createRTCConnection" style="width: 200px">创建RTC连接</button>
    <button @click="createOffer" style="width: 200px">创建 offer</button>
    <textarea ref="textAreaRef" style="width: 200px"></textarea>
    <button @click="setRemoteDescription" style="width: 200px">设置远程描述</button>
    <button @click="createAnswer" style="width: 200px">创建 answer</button>
    <button @click="addCandidate" style="width: 200px">添加候选</button>
  </div>
</template>

<script setup lang="ts">

import {ref} from "vue";

const localVideoRef = ref<HTMLVideoElement>()
const pc = ref<RTCPeerConnection>()
const textAreaRef = ref<HTMLTextAreaElement>()
const remoteVideoRef = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()

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
      console.log('candidate', JSON.stringify(e.candidate))
    }
  }
  _pc.ontrack = e => {
    remoteVideoRef.value!.srcObject = e.streams[0]
  }
  pc.value = _pc
  console.log('创建 rtc 连接成功')
}

// 创建 offer，用于创建会话描述协议 SDP 包含音视频解码器，主机候选地址等信息
// 建立连接的双方需要互相交换 SDP
const createOffer = async () => {
  const sdp = await pc.value?.createOffer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  })
  console.log(sdp, 'offer')
  pc.value?.setLocalDescription(sdp)
}

// 创建 answer ，跟 offer 对应
const createAnswer = async () => {
  const sdp = await pc.value?.createAnswer({
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  })
  console.log(sdp, 'answer')
  pc.value?.setLocalDescription(sdp)
}

// 设置远程描述
const setRemoteDescription = () => {
  const remoteSDP = JSON.parse(textAreaRef.value!.value)
  pc.value?.setRemoteDescription(new RTCSessionDescription(remoteSDP))
  console.log('设置远程描述成功', remoteSDP)
}

// 添加候选地址
const addCandidate = () => {
  const candidate = JSON.parse(textAreaRef.value!.value)
  pc.value?.addIceCandidate(new RTCIceCandidate(candidate))
  console.log('添加候选成功', candidate)
}

const addLocalStreamToRTCConnection = () => {
  const _localStream = localStream.value
  _localStream?.getTracks().forEach(track => {
    pc.value?.addTrack(track, _localStream)
  })
}

</script>

<style scoped>
</style>
