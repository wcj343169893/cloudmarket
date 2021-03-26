'use strict';
const {
	getConfig
} = require("configs");
const {
	dbcache
} = require("base-common");
const models = {
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
		const key = config.key; //客户授权key
		const customer = config.customer; //查询公司编号
		const param = {
			'com': company, //快递公司编码
			'num': number, //快递单号
		};

		//请求参数
		let post_data = {};
		post_data["customer"] = customer;
		post_data["param"] = JSON.stringify(param);
		const md5 = require('md5-node');
		//加密
		const sign = md5(post_data["param"] + key + post_data["customer"]);
		post_data["sign"] = sign.toUpperCase();
		const url = 'http://poll.kuaidi100.com/poll/query.do'; //实时查询请求地址
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
		let res = await uniCloud.httpclient.request('http://www.kuaidi100.com/autonumber/auto', {
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
