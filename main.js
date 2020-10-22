import Vue from 'vue'
import store from './store'
import App from './App'

import {
	msg,
	success,
	loading,
	debounce,
	throttle,
	prePage,
} from '@/common/common.js'

import mixin from './common/mixin/mixin'
Vue.mixin(mixin) 

Vue.config.productionTip = false
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {
	msg,
	success,
	debounce,
	throttle,
	loading,
	prePage
};
/**
 * 时间统一格式化,dateFormat('yyyy-MM-dd hh:mm:ss')}
 * @param {Object} value
 * @param {Object} fmt
 */
Vue.filter('dateFormat', function(value, fmt) {
	if (!value) {
		return '';
	}
	let getDate = new Date(value);
	let o = {
		'M+': getDate.getMonth() + 1,
		'd+': getDate.getDate(),
		'h+': getDate.getHours(),
		'm+': getDate.getMinutes(),
		's+': getDate.getSeconds(),
		'q+': Math.floor((getDate.getMonth() + 3) / 3),
		'S': getDate.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
		}
	}
	return fmt;
})
/**
 * 格式化数字
 * @param {Object} value
 * @param {Object} num
 */
Vue.filter('toFixed', function(value, num) {
	if(!num){
		//默认2位小数
		num=2;
	}
	if(!value){
		return 0;
	}
	if(typeof(value)=="number"){
		return value.toFixed(num);
	}
	return value;
});
/**
 * 动态处理缩略图
 * @param {Object} value
 * @param {Object} num
 */
Vue.filter('thumbImg', (value, fmt) =>{
	if(!fmt){
		//腾讯云   ?imageMogr2/thumbnail/!200x200r/|imageMogr2/gravity/center/crop/200x200/interlace/0
		fmt="";
	}
	return value;
});

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
