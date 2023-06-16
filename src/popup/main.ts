// @TS-NOCHECK
window.pageType = 'Popup'

import 'amfe-flexible'
import '@vant/touch-emulator';
import { createApp } from 'vue'
import '@/popup/utils/ether'
import i18n from '@/popup/language/index'
import BigNumber from 'bignumber.js'
import App from './App.vue'
import '@/popup/assets/icon/iconfont.css'
import router from './router'
import store from './store'
import 'vant/lib/index.css'
import './styles/index.scss'
import '@/popup/utils/web3.ts'
import CancelBtn from '@/popup/components/cancelBtn/index.vue'
// import '@/popup/plugins/vconsole'
import TradeConfirm from '@/popup/plugins/tradeConfirmationsModal/tradeConfirm'
import Toast from '@/popup/plugins/toast/toast'
import Dialog from '@/popup/plugins/dialog/dialog'
import NoData from '@/popup/components/noData/index.vue'
import 'element-plus/dist/index.css'

window.BigNumber = BigNumber
const app = createApp(App)

app.component('no-data',NoData)
app.component('cancel-btn',CancelBtn)
app.use(store)
app.use(router)
app.use(i18n)
app.use(Toast)
app.use(Dialog)
app.use(TradeConfirm)
app.mount('#app')

