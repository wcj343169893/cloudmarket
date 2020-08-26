/**
 * 支付配置文件
 */
const config = require("./config.json")
/**
 * 支付成功异步通知,返回结果例如：http://www.mydomain.com/market_notify/app-plus/alipay 
 * @param {String} platform 运行平台，返回值为 mp-weixin、app-plus等
 * @param {String} provider 服务供应商：alipay，wxpay 
 * @param {String} model 支付类型：mall，task
 * @tutorial https://uniapp.dcloud.io/api/plugins/provider?id=getprovider
 * @tutorial https://uniapp.dcloud.io/uniCloud/http
 */
const getPaymentNotifyUrl = (platform, provider,model) => {
	//notify-floder为自定义目录，防止被攻击,建议修改成无意义的字符串，然后在后台云函数那里填写
	//设置URL的PATH部分:/market_notify，在请求的时候，
	//支付宝app回调地址为:http://www.mydomain.com/market_notify/app-plus/alipay 
	return [config["domain"], config["notify-floder"], platform, provider,model].join("/");
}
/**
 * 返回支付配置
 */
const getPaymentConfig = (platform, provider) => {
	if (!provider) {
		return config[platform]["payment"];
	}
	return config[platform]["payment"][provider];
}
/**
 * 登录配置
 */
const getLoginConfig = (platform, provider) => {
	if (!provider) {
		return config[platform]["oauth"];
	}
	return config[platform]["oauth"][provider];
}
/**
 * 获取打印机配置
 */
const getPrinterConfig = (name) => {
	return config["printer"][name];
}

module.exports = {
	config,
	getPaymentConfig,
	getPaymentNotifyUrl,
	getLoginConfig,
	getPrinterConfig
}
