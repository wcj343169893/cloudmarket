'use strict';
const {
	getConfig
} = require("configs");
const {
	dbcache
} = require("base-common");
const models = {
	/**
	 * 接口域名
	 */
	url: "http://poll.kuaidi100.com/",
	/**
	 * 打印面单
	 * @param {Object} d ata
	 * @link https://api.kuaidi100.com/document/5f0ff6adbc8da837cbd8aef8.html
	 */
	async print(data) {
		let {
			company,
			address,
			count,
			shop
		} = data
		//https://poll.kuaidi100.com/printapi/printtask.do
		let config = getConfig("express");
		let post_data = {};
		//物品总数量。 另外该属性与子单有关，如果需要子单（指同一个订单打印出多张电子面单，即同一个订单返回多个面单号），
		//needChild = 1、count 需要大于1，如count = 2 则一个主单 一个子单，count = 3则一个主单 二个子单；返回的子单号码见返回结果的childNum字段
		count = count ? count : 1;
		const param = {
			type: 10,
			partnerId: config.partnerId,
			partnerKey: config.partnerKey,
			kuaidicom: company,
			recMan: { //收件人信息
				name: address.name,
				mobile: address.mobile,
				printAddr: [address.province, address.city, address.district, address.address, address
					.addressName, address.area
				].join("")
			},
			sendMan: { //寄件人信息
				name: shop.name,
				mobile: shop.phone,
				printAddr: shop.address + shop.addressName,
			},
			count: count,
			tempid: config.tempid, //通过管理后台的打印模版配置信息获取
			siid: config.siid //快递100打印机或者云盒设备码
		};
		post_data["method"] = "eOrder";
		post_data["key"] = config.key;
		post_data["t"] = Date.now();
		post_data["param"] = JSON.stringify(param);
		post_data["sign"] = this.getSigns(param, post_data.t, config.secret);

		const url = this.url + 'printapi/printtask.do';
		let params = "";
		for (let k in post_data) {
			params += k + "=" + this.URLEncode(post_data[k]) + "&"; //默认UTF-8编码格式
		}
		post_data = params.substr(0, params.length - 1);
		console.log('请求参数<br/>' + post_data);
		let requestRes = await uniCloud.httpclient.request(url, {
			method: 'GET',
			data: post_data,
			dataType: 'json'
		})
		return requestRes.data;
	},
	/**
	 * 查询快递详细信息
	 * @param {Object} data
	 */
	async detail(data) {
		let config = getConfig("express");
		let {
			company,
			number,
		} = data
		let cacheKey = "cloud_express_search_" + number;
		let old = await dbcache(cacheKey);
		if (old) {
			return old;
		}
		//快递100 http://api.kuaidi100.com/login/
		//参数设置
		const customer = config.customer; //查询公司编号
		const param = {
			'com': company, //快递公司编码
			'num': number, //快递单号
		};

		//请求参数
		let post_data = {};
		post_data["customer"] = customer;
		post_data["param"] = JSON.stringify(param);
		post_data["sign"] = this.getSigns(param, "", customer);

		const url = this.url + 'poll/query.do'; //实时查询请求地址
		let params = "";
		for (let k in post_data) {
			params += k + "=" + this.URLEncode(post_data[k]) + "&"; //默认UTF-8编码格式
		}
		post_data = params.substr(0, params.length - 1);
		console.log('请求参数<br/>' + post_data);
		let requestRes = await uniCloud.httpclient.request(url, {
			method: 'GET',
			data: post_data,
			dataType: 'json'
		})
		//缓存6小时
		await dbcache(cacheKey, requestRes.data, config.expires);
		return requestRes.data;
	},
	/**
	 * 根据单号，自动识别公司
	 * @param {Object} data
	 */
	async company(data) {
		let config = getConfig("express");
		let res = await uniCloud.httpclient.request(this.url + 'autonumber/auto', {
			"dataType": "json",
			"data": {
				"num": data.number,
				"key": config.key, //填写此key即可 快递100 http://api.kuaidi100.com/login/
			},
		})
		console.log("res.data", res.data)
		if (res.data.returnCode) {
			data.message = res.data.message;
			return false;
		}
		return res.data.data.company
	},
	getSigns(param, t, secret) {
		let config = getConfig("express");
		//快递100 http://api.kuaidi100.com/login/
		//参数设置
		const key = config.key; //客户授权key
		//请求参数
		const md5 = require('md5-node');
		//加密
		const sign = md5(JSON.stringify(param) + t + key + secret);
		return sign.toUpperCase();
	},
	/**
	 * 转码字符
	 * @param {Object} clearString
	 */
	URLEncode(clearString) {
		let output = '';
		let x = 0;
		clearString = clearString.toString();
		let regex = /(^[a-zA-Z0-9-_.]*)/;
		while (x < clearString.length) {
			let match = regex.exec(clearString.substr(x));
			if (match != null && match.length > 1 && match[1] != '') {
				output += match[1];
				x += match[1].length;
			} else {
				if (clearString.substr(x, 1) == ' ') {
					//原文在此用 clearString[x] == ' ' 做判断, 但ie不支持把字符串当作数组来访问, 
					//修改后两种浏览器都可兼容 
					output += '+';
				} else {
					let charCode = clearString.charCodeAt(x);
					let hexVal = charCode.toString(16);
					output += '%' + (hexVal.length < 2 ? '0' : '') + hexVal.toUpperCase();
				}
				x++;
			}
		}
		return output;
	}
};
module.exports = models;
