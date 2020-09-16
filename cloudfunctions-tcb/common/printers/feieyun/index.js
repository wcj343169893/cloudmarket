'use strict';
const crypto = require('crypto');
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
		let orderInfo = "<CB>001号单</CB><BR>"; //标题字体如需居中放大,就需要用标签套上
		orderInfo += "名称　　　　　 单价  数量 金额<BR>";
		orderInfo += "--------------------------------<BR>";
		orderInfo += "番　　　　　　 1.0    1   1.0<BR>";
		orderInfo += "番茄　　　　　 10.0   10  10.0<BR>";
		orderInfo += "番茄炒　　　　 10.0   100 100.0<BR>";
		orderInfo += "番茄炒粉　　　 100.0  100 100.0<BR>";
		orderInfo += "番茄炒粉粉　　 1000.0 1   100.0<BR>";
		orderInfo += "番茄炒粉粉粉粉 100.0  100 100.0<BR>";
		orderInfo += "番茄炒粉粉粉粉 15.0   1   15.0<BR>";
		orderInfo += "备注：快点送到xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx<BR>";
		orderInfo += "--------------------------------<BR>";
		orderInfo += "合计：xx.0元<BR>";
		orderInfo += "送货地点：xxxxxxxxxxxxxxxxx<BR>";
		orderInfo += "联系电话：138000000000<BR>";
		orderInfo += "订餐时间：2011-01-06 19:30:10<BR><BR>";
		orderInfo += "----------请扫描二维码----------";
		orderInfo += "<QR>http://www.dzist.com</QR>"; //把二维码字符串用标签套上即可自动生成二维码
		return orderInfo;
	}
}
module.exports = models;
