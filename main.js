import Vue from 'vue'
import store from './store'
import App from './App'
/**
 *  因工具函数属于公司资产, 所以直接在Vue实例挂载几个常用的函数
 *  
 *  css部分使用了App.vue下的全局样式和iconfont图标。
 *  示例使用了uni.scss下的变量, 除变量外已尽量移除特有语法,可直接替换为其他预处理器使用
 */
const msg = (title, duration = 1500, mask = false, icon = 'none') => {
	//统一提示方便全局修改
	if (Boolean(title) === false) {
		return;
	}
	uni.showToast({
		title,
		duration,
		mask,
		icon
	});
}
const success = (title, duration = 1500, mask = false,)=>{
	msg(title,duration,mask,"success");
}
/* 数据加载中 */
const loading = (title, mask = true) => {
	//统一提示方便全局修改
	if (Boolean(title) === false) {
		title = "加载中...";
	}
	uni.showLoading({
		title: title
	})
}

const prePage = () => {
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}


Vue.config.productionTip = false
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {
	msg,
	success,
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
	if(typeof(value)=="number"){
		return value.toFixed(num);
	}
	return value;
});

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
