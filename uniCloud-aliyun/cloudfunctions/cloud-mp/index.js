'use strict';
const {
	Router
} = require('uni-cloud-router')
const router = new Router(require('./config.js'))
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	if (event.timingTriggerConfig || event.Type == "Timer") {
		//定时器
		context.APPID = "all"
		//定时器
		event.path = "/system/app/timer"
	} else if (event.path) {
		//	https://fc-mp-9ed4ee2c-a639-46f8-8556-a9a242d272ad.next.bspapp.com/http/cloud/mp/__UNI__9900639/mp-weixin/mp/message
		let paths = event.path.split("/");
		context.LOCALE = 'zh-Hans'
		if (paths[1].indexOf("__UNI__") != -1) {
			context.APPID = paths[1];
			context.PLATFORM = paths[2];
			paths = paths.slice(3);
			paths.unshift("")
		} else {
			context.PLATFORM = "web";
			context.APPID = "uni-app";
		}
		event.path = paths.join("/");
	}
	return router.serve(event, context)
};