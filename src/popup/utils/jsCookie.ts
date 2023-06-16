
//@ts-nocheck
import Cookies from 'js-cookie'
import { sendBackground } from './sendBackground';

import { encrypt,decrypt } from '@/popup/utils/cryptoJS.js'
import { passwordExpires } from '@/popup/enum/time'
import store from '@/popup/store/index'
export const pwdKey = 'password'
// const pwdKey = 'wallet-token'
const handleGetPwd = (str: string,time: number | string) => {
  return decrypt(str,time)
}

const handleSetPwd = (msg: string,time: number | string) => {
  return encrypt(msg,time)
}

/*
 * get pwd
 * */
export async function getCookies(key: string = pwdKey):WalletToken | null {
  const val = store.state.system.wallet_token
  let localPwd = await chrome.storage.local.get(['password'])
  const password = localPwd.password || Cookies.get(key)
  if(password){
    const {time} = val
    return handleGetPwd(password, time)
  }
  return ''
}
/*
 * set pwd
 * */
export async function setCookies(key: string = pwdKey, value: any, expiresTime?: number) {
  let seconds = expiresTime || passwordExpires;
  const time = new Date().getTime()
  const pwd = handleSetPwd(value,time)
  const pwdObj = {
    value: '',
    time,
    seconds
  }
  // Cookies expire 5s 
  let cookieExpires = new Date(new Date() * 1 + 5 * 1000)
  Cookies.set(key, pwd, { expires: cookieExpires });
  sendBackground({method:"login", response:{ password: pwd}})
  store.commit('system/UPDATE_WALLET_TOKEN',pwdObj)
  return value
 
}
/*
 * logout
 * */
export async function loginOut() {
  // localStorage.removeItem('login');
  const pwd = getPwd() 
  const {seconds,time, value} = pwd
  store.commit('system/UPDATE_WALLET_TOKEN',{
    time,
    seconds,
    value:''
  })
  Cookies.set(pwdKey, '')
  await chrome.storage.local.set({ password: "" })
  
}


/**
 * hasLogin
 */
export function hasLogin() {
  const pwd = Cookies.get(pwdKey)
  return pwd ? true : false
}

export function getPwd(){
  const p = store.state.system.wallet_token
  return p || ''
}