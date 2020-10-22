let _debounceTimeout = null,
	_throttleRunning = false;
/**
 * 防抖
 * @param {Function} 执行函数
 * @param {Number} delay 延时ms   
 */
export const debounce = (fn, delay = 500) => {
	clearTimeout(_debounceTimeout);
	_debounceTimeout = setTimeout(() => {
		fn();
	}, delay);
}
/**
 * 节流
 * @param {Function} 执行函数
 * @param {Number} delay 延时ms  
 */
export const throttle = (fn, delay = 500) => {
	if (_throttleRunning) {
		return;
	}
	_throttleRunning = true;
	fn();
	setTimeout(() => {
		_throttleRunning = false;
	}, delay);
}

/**
 *  因工具函数属于公司资产, 所以直接在Vue实例挂载几个常用的函数
 *  
 *  css部分使用了App.vue下的全局样式和iconfont图标。
 *  示例使用了uni.scss下的变量, 除变量外已尽量移除特有语法,可直接替换为其他预处理器使用
 */
export const msg = (title, duration = 1500, mask = false, icon = 'none') => {
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
export const success = (title, duration = 1500, mask = false, ) => {
	msg(title, duration, mask, "success");
}
/* 数据加载中 */
export const loading = (title, mask = true) => {
	//统一提示方便全局修改
	if (Boolean(title) === false) {
		title = "加载中...";
	}
	uni.showLoading({
		title: title
	})
}
export const prePage = () => {
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}
