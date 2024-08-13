var util = {};
/*
 * 此方法不支持微信公众号
util.getWeixinCode().then((code) => {

});
*/
util.getWeixinCode = function() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.login({
			provider: 'weixin',
			success(res) {
				resolve(res.code)
			},
			fail(err) {
				reject(new Error('获取微信code失败'))
			}
		})
		// #endif
		// #ifdef APP-PLUS
		plus.oauth.getServices((services) => {
			let weixinAuthService = services.find((service) => {
				return service.id === 'weixin';
			});
			if (weixinAuthService) {
				weixinAuthService.authorize(function(res) {
					resolve(res.code);
				}, function(err) {
					console.log(err);
					reject(new Error('获取微信code失败'));
				});
			}
		});
		// #endif
	})
};

util.getAlipayCode = function() {
	// #ifdef APP-PLUS || MP-ALIPAY
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'alipay',
			success(res) {
				resolve(res.code);
			},
			fail(err) {
				reject(new Error('获取支付宝code失败，可能是没有关联appid或你的支付宝开发者工具还没有登录'));
			}
		});
	});
	// #endif
};

util.checkPlatform = function() {
	// #ifdef H5
	let system = {
		win: false,
		mac: false,
		xll: false
	};
	let p = navigator.platform;
	system.win = p.indexOf("Win") == 0;
	system.mac = p.indexOf("Mac") == 0;
	system.x11 = p == "X11" || p.indexOf("Linux") == 0;
	if (system.win || system.mac || system.xll) {
		let ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf("micromessenger") > -1) {
			// 微信开发者工具下访问（注意微信开发者工具下无法唤起微信公众号支付）
			return "pc-weixin";
		} else {
			return "pc";
		}
	} else {
		if (p.indexOf("iPhone") > -1 || p.indexOf("iPad") > -1) {
			return "ios";
		} else {
			return "android";
		}
	}
	// #endif
};

/**
 * 获取当前H5所在的环境
 */
util.getH5Env = function() {
	let ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger' && (ua.match(/miniprogram/i) == 'miniprogram')) {
		// 微信小程序
		return "mp-weixin";
	}
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		// 微信公众号
		return "h5-weixin";
	}
	if (ua.match(/alipay/i) == 'alipay' && ua.match(/miniprogram/i) == 'miniprogram') {
		return "mp-alipay";
	}
	if (ua.match(/alipay/i) == 'alipay') {
		return "h5-alipay";
	}
	// 外部 H5
	return "h5";
};


/**
 * 日期格式化
 * @params {Date || Number} date 需要格式化的时间
 * timeFormat(new Date(),"yyyy-MM-dd hh:mm:ss");
 */
util.timeFormat = function(time, fmt = 'yyyy-MM-dd hh:mm:ss', targetTimezone = 8) {
	try {
		if (!time) {
			return "";
		}
		if (typeof time === "string" && !isNaN(time)) time = Number(time);
		// 其他更多是格式化有如下:
		// yyyy-MM-dd hh:mm:ss|yyyy年MM月dd日 hh时MM分等,可自定义组合
		let date;
		if (typeof time === "number") {
			if (time.toString().length == 10) time *= 1000;
			date = new Date(time);
		} else {
			date = time;
		}

		const dif = date.getTimezoneOffset();
		const timeDif = dif * 60 * 1000 + (targetTimezone * 60 * 60 * 1000);
		const east8time = date.getTime() + timeDif;

		date = new Date(east8time);
		let opt = {
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (let k in opt) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (opt[k]) : (("00" + opt[k]).substr(("" + opt[k]).length)));
			}
		}
		return fmt;
	} catch (err) {
		// 若格式错误,则原值显示
		return time;
	}
};

export default util;