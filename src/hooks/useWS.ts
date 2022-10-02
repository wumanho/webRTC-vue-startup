import {Onmessage, Onopen} from "../types";
import {CONFIG} from '../../config'

export function useWS() {
  const ws = new WebSocket(CONFIG.WS_END_POINT)

  const initWs = (onopen: Onopen, onmessage: Onmessage) => {
    ws.onopen = onopen
    ws.onmessage = onmessage
  }
  const wsSend = (userName: string, type: string, data: string) => {
    // 通过 websocket 发送 offer 数据
    ws.send(JSON.stringify({
      userName,
      type,
      data
    }))
  }
  return {initWs, wsSend}
}
