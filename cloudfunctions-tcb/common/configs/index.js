const fs = require("fs");
/**
 * 支付配置文件
 */
const config = require("./config.json");
const model = {
	/**
	 * 支付成功异步通知,返回结果例如：http://www.mydomain.com/market_notify/app-plus/alipay 
	 * @param {String} platform 运行平台，返回值为 mp-weixin、app-plus等
	 * @param {String} provider 服务供应商：alipay，wxpay 
	 * @param {String} model 支付类型：mall，task
	 * @tutorial https://uniapp.dcloud.io/api/plugins/provider?id=getprovider
	 * @tutorial https://uniapp.dcloud.io/uniCloud/http
	 */
	getPaymentNotifyUrl(platform, provider, model) {
		//notify-floder为自定义目录，防止被攻击,建议修改成无意义的字符串，然后在后台云函数那里填写
		//设置URL的PATH部分:/market_notify，在请求的时候，
		//支付宝app回调地址为:http://www.mydomain.com/market_notify/app-plus/alipay/mall
		return [config["domain"], config["notify-floder"], platform, provider, model].join("/");
	},
	/**
	 * 返回支付配置
	 */
	getPaymentConfig(platform, provider) {
		if (!provider) {
			return config[platform]["payment"];
		}
		let res = config[platform]["payment"][provider];
		if (provider == "wxpay") {
			if (res.pfx != '') {
				res.pfx = fs.readFileSync(__dirname + '/cert/' + res.pfx);
			} else {
				delete res.pfx;
			}
		}
		return res;
	},
	/**
	 * 登录配置
	 */
	getLoginConfig(platform, provider) {
		if (!provider) {
			return config[platform]["oauth"];
		}
		return config[platform]["oauth"][provider];
	},
	/**
	 * 获取打印机配置
	 */
	getPrinterConfig(name) {
		return config["printer"][name];
	},
	/**
	 * 获取发送短信模板id，需要在dc官方报备，否则提示：errCode: 10002 ，errMsg: 短信发送失败：应用名称未报备
	 * @link https://dev.dcloud.net.cn/uniSms/sign
	 */
	getSmsTemplateId(name) {
		return config.service.sms.templateId[name];
	},
	/**
	 * 获取推送配置,支持多个客户端
	 * @param {Object} client
	 * @link https://dev.dcloud.net.cn/uni/push?appid=__UNI__9900639&type=0
	 */
	getPushConfig(client) {
		client = client || "default";
		return config.push[client];
	},
	/**
	 * 简单字符串模板，如果模板中找不到对于的字符，则默认源字符串
	 * @param {Object} templateId 对于到config.json的key，例如：payment.error
	 * @param {Object} data 参数{name:'支付宝'}
	 */
	getStringFormat(templateId, data) {

		let ids = templateId.split(".");
		//找不到对于的模板字符串
		if (!config.templates || !config.templates[ids[0]] || !config.templates[ids[0]][ids[1]]) {
			console.log("请配置模板 common/configs/config.json 添加templates节点")
			return "";
		}
		//"退款将{name}退回至您的{payName}账户，请{bbq}注意查收"
		let format = config.templates[ids[0]][ids[1]];
		//模板字符串不需要替换变量
		if (!data) {
			return format;
		}
		//匹配大括号+英文字符
		return format.replace(/\{([a-zA-Z0-9$_]+)\}/g, key => {
			//去掉大括号，得到变量
			let key1 = key.replace(/[\{\}]/g, "");
			if (data[key1]) {
				//存在变量对于的value
				return data[key1];
			}
			return key;
		});
	}
}
module.exports = model;
