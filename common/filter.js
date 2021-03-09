import Vue from 'vue';

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
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k])
				.length)))
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
	if (!num) {
		//默认2位小数
		num = 2;
	}
	if (!value) {
		return 0;
	}
	if (typeof(value) == "number") {
		return value.toFixed(num).replace(".00", "");
	}
	return value;
});
/**
 * 动态处理缩略图，居中短边裁剪
 * @param {Object} value
 * @param {Object} fmt 宽x高 200x200
 */
Vue.filter('thumbImg', (value, fmt) => {
	if (!fmt) {
		fmt = "200x200";
	}
	if (!value) {
		return "/static/errorImage.jpg"
	}
	fmt = fmt.toLowerCase();
	if (value.indexOf("bspapp.com") > -1) {
		let wh = fmt.split("x");
		fmt = `w_${wh[0]},h_${wh[1]}`;
		//阿里云?x-oss-process=image/resize,m_fill,w_300,h_300
		return [value, "?x-oss-process=image/resize,m_fill,", fmt].join("");
	} else if (value.indexOf("qcloud.la") > -1) {
		//腾讯云?imageMogr2/crop/300x300/gravity/center
		return [value, "?imageMogr2/crop/", fmt, "/gravity/center"].join("");
	}
	return value;
});
Vue.filter('avatar', (value) => {
	if (!value) {
		return "/static/missing-face.png";
	}
	return value;
});
Vue.filter('formatDistance', (value) => {
	if (!value) {
		return "0m";
	}
	if (value < 1000) {
		return value + "m"
	}
	return value / 1000 + "km";
});
Vue.filter('formatNumber', (value) => {
	if (!value) {
		return "0";
	}
	if (value < 1000) {
		return value;
	}
	if (value < 10000000) {
		return (value / 10000).toFixed(2) + "w";
	}
	return (value / 100000000).toFixed(2) + "亿";
});
