'use strict';
const uuidv4 = require('uuid/v4');
const md5 = require('md5');
const {
	getDateFormat,
	checkDeliveryHour,
	dbcache
} = require("base-common");
/**
 * 易联云
 * @link http://doc2.10ss.net/336832  打印指令
 */
const models = {
	baseUrl: "https://open-api.10ss.net",
	config: {},
	name: "yilianyun",
	access_token: "",
	cacheExpires: 3600 * 5,
	/**
	 * 刷新token
	 * 本开发攻略介绍自有服务模式下获取Access Token的授权验证 ，终端授权，每个Client Id 的 Access Token获取或刷新频次限制共: 20次/日，该模式下Access Token 无失效时间，做好存储避免多次获取导致频次超过限制！！！
	 * @param {Object} isRefresh 是否强制刷新
	 */
	async getAccessToken(isRefresh) {
		if (isRefresh) {
			this.access_token = "";
		}
		//单次请求，如果已经拿到直接返回
		if (this.access_token != "") {
			return this.access_token;
		}
		const key = [this.name, this.config.clientId, "access_token"].join("_");
		//优先读取缓存
		let cdata = false;
		if (!isRefresh) {
			cdata = await dbcache(key);
			console.log("读取cache",key,cdata)
		}
		if (!cdata) {
			//请求接口
			const result = await this.send({
				grant_type: "client_credentials",
				scope: "all"
			}, "/oauth/oauth");
			console.log(this.name + " /oauth/oauth");
			console.log(result);
			if (!result) {
				return false;
			}
			this.access_token = result.access_token;
			//缓存5小时
			await dbcache(key, this.access_token, this.cacheExpires);
			return this.access_token;
		}
		return this.access_token = cdata;
	},
	/**
	 * 获取终端状态接口
	 * @param {Object} data
	 */
	async getPrintStatus(data) {
		this.config = data;
		return await this.send({
			machine_code: data.machine, //"4004648355",
		}, "/printer/getprintstatus");
	},
	/**
	 * 添加终端,终端授权 (永久授权),需要与店铺绑定
	 * @param {Object} data
	 * @link http://doc2.10ss.net/371770#___55
	 */
	async addPrinter(data) {
		this.config = data;
		return await this.send({
			machine_code: data.machine, //"4004648355",
			msign: data.msign //"189541803678",
		}, "/printer/addprinter");
	},
	/**
	 * 极速授权 仅支持开放服务,扫二维码
	 * @param {Object} data
	 * @link http://doc2.10ss.net/343932
	 */
	async scanCodeModel(data) {
		this.config = data;
		return await this.send({
			machine_code: data.machine,
			qr_key: data.qr_key,
			scope: "all"
		}, "/oauth/scancodemodel");
	},
	/**
	 * 删除终端
	 * @param {Object} data
	 */
	async deletePrinter(data) {
		this.config = data;
		return await this.send({
			machine_code: data.machine,
		}, "/printer/deleteprinter");
	},
	/**
	 * 打印文本
	 * @param {Object} order 订单信息
	 */
	async print(order, config) {
		this.config = config;
		///print/index  打印文本
		return await this.send({
			content: this.getContentWithTemplate(order),
			machine_code: this.config.machine,
			origin_id: new Date().getTime()
		}, "/print/index");
	},
	/**
	 * 根据订单，生成打印文本
	 * @param {Object} order
	 */
	getContentWithTemplate(order) {
		let content = [];
		checkDeliveryHour(order);
		let createdDay = getDateFormat("yyyy-MM-dd", order.created);
		let createdTime = getDateFormat("hh:mm:ss", order.created);
		content.push("<MN>1</MN>");
		content.push(`<center>** ${order.shop.name} **</center>\n`);
		let sendName = "预计送达";
		if (order.deliveryType == "selfRaising") {
			//自提订单
			content.push(`<center>用户自提</center>`);
			sendName = "预约提货";
		}
		content.push(`订单编号:${order.id}\n日 \t 期:${createdDay}\n时 \t 间:${createdTime}`);
		if (order.address) {
			content.push(
				`\n姓 \t 名:${order.address.name}\n手 \t 机:${order.address.mobile}\n配送地址:${order.address.address}（${order.address.addressName}）${order.juli}km`
			);
		}
		if (order.deliveryHour) {
			content.push(`\n${sendName}:${order.deliveryHour.name} ${order.deliveryHour.time}`);
		}
		content.push(`\n<FB>订单备注:</FB>${order.remark}\n`);
		content.push(`<center>*************商品*************</center>`);
		content.push(`<table><tr><td>商品</td><td>数量</td><td>单价</td><td>金额</td></tr></table>`);
		for (let goods of order.goods) {
			content.push(`${goods.title} ${goods.subName}`);
			if (goods.upc) {
				content.push(`\nUPC ${goods.upc}`);
			}
			let total = (goods.price * goods.amount).toFixed(2);
			content.push(`<right>${goods.amount} ${goods.price} ${total}</right>`);
		}
		content.push(`<center>******************************</center>`);
		let total = order.totalMoney + order.totalDiscount;
		//抵扣
		let deduction = order.deduction ? order.deduction : "0.00";
		content.push(`<LR>合计:￥${total},优惠:￥${order.totalDiscount}</LR>`);
		content.push(`<LR>运费:￥${order.freight},抵扣:￥${deduction}</LR>`);
		total = order.totalMoney + order.freight;
		content.push(`<right>实际支付:￥${total}</right>`);
		content.push(`<center>***********完***********</center>`);
		return content.join("");
	},
	/**
	 * 统一发送接口
	 * @param {Object} data
	 * @param {Object} url
	 */
	async send(data, url, isTry) {
		//每一个请求都需要access_token，所以config放到这里
		let access_token = false;
		if (url != "/oauth/oauth") {
			access_token = await this.getAccessToken();
		}
		Object.assign(data, {
			client_id: this.config.clientId,
			id: uuidv4(),
			access_token,
			timestamp: parseInt(new Date().getTime() / 1000)
		})
		data.sign = md5(String(data.client_id) + data.timestamp + this.config.clientSecret);
		const res = await uniCloud.httpclient.request(this.baseUrl + url, {
			method: 'POST',
			data: data,
			dataType: "json"
		});
		if (res.data.error == "0") {
			if (res.data.body) {
				return res.data.body;
			}
			//没有body返回值，默认true，表示请求成功
			return true;
		} else {
			//message = res.data.error_description;
			console.log(res.data.error_description);
			if (res.data.error == "18") {
				//token过期了
				console.log("token 过期了，重新刷新");
				if (!isTry) {
					await this.getAccessToken(true);
					return await this.send(data, url, true);
				}
			}
			return false;
		}
	}
}
module.exports = models;
