'use strict';
const crypto = require('crypto');
const createConfig = require('uni-config-center');
const wxAuth = require('wx-auth');
const {
	getDateFormat
} = require("base-common");
const {
	getDeliveryConfig
} = require("configs");
const models = {
	//https://api.weixin.qq.com/cgi-bin/express/local/business/order/pre_add?access_token=ACCESS_TOKEN
	//https://api.weixin.qq.com/cgi-bin/express/local/business/delivery/getall?access_token=ACCESS_TOKEN
	testUrl: "https://api.weixin.qq.com/cgi-bin/express/local/business/",
	productUrl: "https://api.weixin.qq.com/cgi-bin/express/local/business/",
	config: {
		key: "",
		secret: "",
		shop: "",
		product: false //是否正式环境
	},
	context: {
		PLATFORM: "mp-weixin"
	},
	name: "",
	delivery_id: "",
	async initConfig(context) {
		//保存用户的环境信息
		this.context = context;
		//获取配送的相关配置
		let config = getDeliveryConfig(this.name);
		if (this.delivery_id) {
			this.config = Object.assign(config, config[this.delivery_id]);
		} else {
			this.config = Object.assign(config);
		}
		//获取维修appid和secret
		this.config.weixin = this.getWxConfig()
		// console.log(this.config);
	},
	getWxConfig() {
		const getConfigs = createConfig({
			pluginId: 'uni-id', // 插件id, 注意pluginId需和uni-config-center下的目录名一致
		});
		return getConfigs.config(`${this.context.PLATFORM}.oauth.weixin`);
	},
	/**
	 * 增加新订单
	 * @param {Object} order
	 */
	async add(order, context) {
		return false;
	},
	/**
	 * 修改订单
	 * 订单编号（OrderId）为必填
	 * 字符串类型参数：空字符串为忽略不修改
	 * 整型参数：-1为忽略不修改
	 * 当订单状态为“已取餐”，以及以后的状态时，禁止修改订单
	 * @param {Object} order
	 */
	async update(order) {
		return false;
	},
	/**
	 * 取消订单，注意：骑手取餐后禁止关闭
	 * @param {Object} order
	 * @param {Object} order.id 商家订单号
	 * @param {Object} order.cancelReason 取消原因
	 */
	async cancel(order) {
		return false;
	},
	/**
	 * 订单退款
	 * 此接口主要用于商家自有预付费支付系统，在退款时和本系统的交互
	 * 如果商家觉得无需交互，可以在自己系统退款后，发送取消订单请求
	 * @param {Object} order
	 */
	async refund(order) {
		return false;
	},
	/**
	 * 4、锁定和解锁订单
	 * 修改商家是否出餐,会收到一个出餐通知
	 * @param {Object} order
	 */
	async updateShopFlag(order) {
		return false;
	},
	/**
	 * 锁定和解锁订单
	 * @param {Object} order
	 */
	async lock(order) {
		return false;
	},
	/**
	 * 统一发送接口
	 * @param {Object} data
	 * @param {Object} url
	 */
	async send(data, url, isTry) {
		//获取access_token
		const accessToken = await wxAuth.getAccessToken({}, this.context)
		data.delivery_sign = this.sign(data);
		console.log(data);
		let baseUrl = this.config.product ? this.productUrl : this.testUrl;
		const res = await uniCloud.httpclient.request(baseUrl + url + "?access_token=" + accessToken, {
			method: 'POST',
			contentType: "json",
			data: data,
			dataType: "json"
		});
		return this._afterSend(res.data);
	},
	_afterSend(data) {
		console.log(JSON.stringify(data));
		if (data.resultcode == 0) {
			return data;
		}
		console.log(data.resultmsg);
		return false;
	},
	/**
	 * 验证签名
	 * @param {Object} data
	 */
	async validateSign(data) {
		if (data.key != this.config.key) {
			console.log("key 不一致")
			data.message = "key 不一致";
			return false;
		}
		let sign = this.sign(data);
		if (data.sign != sign) {
			console.log("签名错误")
			data.message = "签名错误";
			return false;
		}
		let content = JSON.parse(new Buffer(data.content, 'base64').toString());
		let subscribe = require("./subscribe");
		if (!subscribe) {
			//没找到通知模块
			return false;
		}
		console.log(content);
		console.log("开始执行订阅方法", data.action);
		return subscribe[data.action](content);
	},
	/*
	 *  签名算法：
	 * delivery_sign=SHA1(shopid + shop_order_id + AppSecret)
	 * delivery_sign=SHA1(shopid + AppSecret)
	 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/read_first.html
	 */
	sign(data) {
		return crypto.createHash('sha1').update([this.config.key, data.shop_order_id, this.config.secret].filter(
			e => !!e).join(
			"")).digest(
			'hex').toLowerCase();
	}
}
module.exports = models;