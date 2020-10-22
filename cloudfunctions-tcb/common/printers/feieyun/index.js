'use strict';
const crypto = require('crypto');
const {
	getDateFormat,
	checkDeliveryHour,
} = require("base-common");
/**
 * 飞蛾云
 * @link http://www.feieyun.com/
 */
const models = {
	baseUrl: "https://api.feieyun.cn/Api/Open/",
	config: {},
	name: "feieyun",
	/**
	 * 查询打印机状态
	 * @param {Object} data
	 */
	async getPrintStatus(data) {
		this.config = data;
		return await this.send({
			sn: data.machine, //打印机编号,
		}, "Open_queryPrinterStatus");
	},
	/**
	 * 添加一台打印機
	 * @param {Object} data
	 */
	async addPrinter(data) {
		this.config = data;
		return await this.send({
			printerContent: [data.machine, data.msign].join("#"), //打印机编号,
		}, "Open_printerAddlist");
	},
	/**
	 * 删除终端
	 * @param {Object} data
	 */
	async deletePrinter(data) {},
	/**
	 * 打印文本
	 * @param {Object} order 订单信息
	 */
	async print(order, config) {
		this.config = config;
		return await this.send({
			content: this.getContentWithTemplate(order),
			times: "1", //打印联数,默认为1
			sn: this.config.machine,
		}, "Open_printMsg");
	},
	/**
	 * 统一发送接口
	 * @param {Object} data
	 * @param {Object} url
	 */
	async send(data, url, isTry) {
		//每一个请求都需要access_token，所以config放到这里
		Object.assign(data, {
			user: this.config.clientId,
			apiname: url,
			stime: parseInt(new Date().getTime() / 1000)
		});

		data.sig = crypto.createHash('sha1').update(data.user + this.config.clientSecret + data.stime).digest('hex'); //获取签名
		const res = await uniCloud.httpclient.request(this.baseUrl, {
			method: 'POST',
			data: data,
			dataType: "json"
		});
		console.log(JSON.stringify(res.data))
		if (res.data.ret == 0) {
			if (res.data.data) {
				return res.data.data;
			}
			//没有body返回值，默认true，表示请求成功
			return true;
		} else {
			//message = res.data.error_description;
			console.log(res.data.msg);
			return false;
		}
	},
	getContentWithTemplate(order) {
		let content = [];
		checkDeliveryHour(order);
		let createdDay = getDateFormat("yyyy-MM-dd", order.created);
		let createdTime = getDateFormat("hh:mm:ss", order.created);
		content.push(`<CB>${order.shop.name}</CB><BR>`);
		let sendName = "预计送达";
		if (order.deliveryType == "selfRaising") {
			//自提订单
			content.push(`<C>用户自提</C>`);
			sendName = "预约提货";
		}
		content.push(`订单编号:${order.id}<BR>日\t 期:${createdDay}<BR>时\t 间:${createdTime}`);
		if (order.address) {
			content.push(
				`<BR>姓\t 名:${order.address.name}<BR>手\t 机:${order.address.mobile}<BR>配送地址:${order.address.address} ${order.address.addressName} ${order.juli}km`
			);
		}
		if (order.deliveryHour) {
			content.push(`<BR>${sendName}:${order.deliveryHour.name} ${order.deliveryHour.time}`);
		}
		content.push(`<BR><BOLD>订单备注:</BOLD>${order.remark}<BR>`);
		content.push(`--------------------------------<BR>`);
		content.push(`商品　　　　　 数量  单价 金额<BR>`);
		for (let goods of order.goods) {
			content.push(`${goods.title} ${goods.subName}`);
			if (goods.upc) {
				content.push(`<BR>UPC ${goods.upc}`);
			}
			let total = (goods.price * goods.amount).toFixed(2);
			content.push(`<RIGHT>${goods.amount}   ${goods.price}   ${total}</RIGHT><BR>`);
		}
		content.push(`--------------------------------<BR>`);
		let total = order.totalMoney + order.totalDiscount;
		//抵扣
		let deduction = order.deduction ? order.deduction : "0.00";
		content.push(`合计:￥${total}<BR>优惠:￥${order.totalDiscount}<BR>`);
		content.push(`运费:￥${order.freight}<BR>抵扣:￥${deduction}<BR>`);
		total = order.totalMoney + order.freight;
		content.push(`<RIGHT>实际支付:￥${total}</RIGHT>`);
		content.push(`<C>***********完***********</C>`);
		content.push(`<BR><BR>`);
		return content.join("");
	}
}
module.exports = models;
