'use strict';
const {
	Router
} = require('uni-cloud-router')
const router = new Router(require('./config.js'))
exports.main = async (event, context) => {
	//支付模块相关http请求https://3fbab731-e993-47e6-882f-a74e444709a3.bspapp.com/http/mall/notify/verify/mp-weixin/wxpay/mall
	//通知/http/mall/notify/mp-weixin/wxpay/mall
	///http/mall/payment/wxpay/verify/mp-weixin/mall
	if (event.path && event.path.indexOf("payment/notify") != -1) {
		let notifys = event.path.split("payment/notify/");
		//得到mp-weixin/mall
		let subModule = notifys[1].split("/");
		console.log("module", subModule)
		event.queryStringParameters.subModule = subModule;
		//通知验证
		event.path = "/payment/notify"
	} else if (event.timingTriggerConfig) {
		//定时器
		event.path = "/system/app/timer"
	}
	//请求内容为json
	if (event.path && event.headers && event.headers["content-type"] && event.headers["content-type"].indexOf(
			"application/json") != -1) {
		//转换为对象
		event.queryStringParameters = Object.assign({}, {
			...event.queryStringParameters,
			...JSON.parse(event.body),
			isHttp: true
		});
	}
	console.log("context.CLIENTUA", context.CLIENTUA)
	return router.serve(event, context)
};
