// //@ts-nocheck
// import Cookies from 'js-cookie'
// import { encrypt,decrypt } from '@/popup/utils/cryptoJS.js'
// import { passwordExpires } from '@/popup/enum/time'
// const pwdKey = 'password'
// const handleGetPwd = (str: string,time: number | string) => {
//   return  decrypt(str,time)
// }

// const handleSetPwd = (msg: string,time: number | string) => {
//   return encrypt(msg,time)
// }

// /*
//  * get pwd
//  * */
// export function getCookies(key: string = pwdKey) {
//   let val = getPwd() 
//   if(val){
//     const {seconds,value,time} = val
//     const now = new Date().getTime()
//     const diff = (now - time) > seconds
//     if(diff){
//       localStorage.setItem(pwdKey,JSON.stringify({
//         time,
//         seconds,
//         value:''
//       }))
//       return ''
//     } else {
//       return handleGetPwd(value, time)
//     }
//   }
//   return ''
// }
// /*
//  * set pwd
//  * */
// export function setCookies(key: string = pwdKey, value: any, expiresTime?: number) {
//   let seconds = expiresTime || passwordExpires;
//   const time = new Date().getTime()
//   const pwd = handleSetPwd(value,time)
//   const pwdObj = {
//     value: pwd,
//     time,
//     seconds
//   }
//   localStorage.setItem(key, JSON.stringify(pwdObj))
//   return value
 
// }
// /*
//  * logout
//  * */
// export function loginOut() {
//   // localStorage.removeItem('login');
//   const pwd = getPwd() 
//   const {seconds,time,value} = pwd
//   localStorage.setItem(pwdKey,JSON.stringify({
//     time,
//     seconds,
//     value:''
//   }))
// }


// /**
//  * hasLogin
//  */
// export function hasLogin() {
//   const pwd = getPwd() 
//   return pwd && pwd.value ? true : false
// }

// export function getPwd(){
//   const p = localStorage.getItem(pwdKey)
//   return p ? JSON.parse(p) : ''
// }
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
export function getCookies(key: string = pwdKey):WalletToken | null {
  const val = store.state.system.wallet_token
  const value = Cookies.get(pwdKey)
  //debugger
  if(value){
    const {time} = val
    return handleGetPwd(value, time)
  }
  return ''
}
/*
 * set pwd
 * */
export function setCookies(key: string = pwdKey, value: any, expiresTime?: number) {
  let seconds = expiresTime || passwordExpires;
  const time = new Date().getTime()
  const pwd = handleSetPwd(value,time)
  const pwdObj = {
    value: '',
    time,
    seconds
  }
  let expires = new Date(new Date() * 1 + seconds * 1000)
  Cookies.set(key, pwd, { expires: expires });
  sendBackground({method:"login", response:{ password: pwd}})
  store.commit('system/UPDATE_WALLET_TOKEN',pwdObj)
  return value
 
}
/*
 * logout
 * */
export function loginOut() {
  // localStorage.removeItem('login');
  const pwd = getPwd() 
  const {seconds,time, value} = pwd
  store.commit('system/UPDATE_WALLET_TOKEN',{
    time,
    seconds,
    value:''
  })
  Cookies.set(pwdKey, '')
  sendBackground({method:"logout"})
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