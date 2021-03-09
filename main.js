import Vue from 'vue'
import store from './store'
import App from './App'
import config from './config'

import {
	msg,
	success,
	loading,
	debounce,
	throttle,
	checkStr,
	prePage,
} from '@/common/common.js'

import mixin from './common/mixin/mixin'
Vue.mixin(mixin)

Vue.config.productionTip = false
Vue.prototype.$config = config;
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {
	msg,
	success,
	debounce,
	throttle,
	loading,
	checkStr,
	prePage
};
import filter from '@/common/filter'

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
