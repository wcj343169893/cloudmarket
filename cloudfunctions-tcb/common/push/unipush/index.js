//《多厂商推送透传消息带通知》
'use strict';
const {
	getPushConfig
} = require('configs');
const {
	dbcache
} = require("base-common");
const model = {
	name: "unipush",
	config: {},
	token: "",
	cacheExpires: 3600 * 5,
	getUrl(url) {
		return "https://restapi.getui.com/v2/" + this.config.appId + url
	},
	/**
	 * 此接口频次限制100次/天，每分钟不能超过5次(推送限制和接口根据条件筛选用户推送共享限制)
	 * @param {Object} data
	 */
	async toApp(data) {
		await this.prepareData(data);
		const requestData = {
			audience: "all",
			...data
		}
		return await this.post('/push/all', requestData)
	},
	/**
	 * 单推，透传消息，厂商通道为普通通知
	 * @param {Object} data
	 */
	async toSingle(data) {
		await this.prepareData(data);
		const clientid = data.clientid
		delete data.clientid
		const requestData = {
			audience: {
				"cid": [clientid]
			},
			...data
		}
		return await this.post('/push/single/cid', requestData)
	},
	/**
	 * 批量推
	 * @param {Object} data
	 */
	async toList(data) {
		await this.prepareData(data);
		const clientid = data.clientid
		delete data.clientid
		let requestData = {
			...data
		}
		//此接口用来创建消息体，并返回taskid，为批量推的前置步骤
		let {
			taskid
		} = await this.post('/push/list/message', requestData);
		if (!taskid) {
			console.log("创建消息体失败")
			return false;
		}
		console.log("创建消息体成功")
		requestData = {
			audience: {
				"cid": clientid
			},
			taskid
		}
		//对列表中所有cid进行消息推送。调用此接口前需调用创建消息接口设置消息内容。
		return await this.post('/push/list/cid', requestData)
	},
	/**
	 * 获取鉴权token
	 * http://docs.getui.com/getui/server/rest_v2/token/
	 */
	async getToken(isRefresh) {
		const timestamp = Date.now();
		if (isRefresh) {
			this.token = "";
		}
		//单次请求，如果已经拿到直接返回
		if (this.token != "") {
			return this.token;
		}
		const key = [this.name, this.config.appId, "token"].join("_");
		//优先读取缓存
		let cdata = false;
		if (!isRefresh) {
			cdata = await dbcache(key);
			console.log("读取cache", key, cdata)
		}
		if (cdata) {
			return this.token = cdata;
		}
		const {
			appkey,
			mastersecret,
		} = this.config;
		let sign = require('crypto').createHash('sha256')
			.update(appkey + timestamp + mastersecret)
			.digest('hex'); //hex是十六进制
		let res = await uniCloud.httpclient.request(this.getUrl('/auth'), {
			method: 'POST',
			contentType: 'json',
			dataType: 'json',
			data: {
				sign,
				timestamp,
				appkey
			},
		});
		let {
			msg,
			data
		} = res.data;
		if (msg == 'success') {
			//24小时内有效
			console.log(JSON.stringify(data))
			//缓存5小时
			this.token = data.token;
			await dbcache(key, this.token, this.cacheExpires);
			return this.token;
		} else {
			console.log('错误请检查，err:' + JSON.stringify(data));
			return false
		}
	},
	/**
	 * 发送推送
	 * @param {Object} module
	 * @param {Object} requestData
	 */
	async post(module, requestData, times) {
		console.log("requestData", JSON.stringify(requestData));
		let res = await uniCloud.httpclient.request(this.getUrl(module), {
			method: 'POST',
			headers: {
				"content-type": "application/json",
				"token": this.token,
				"cache-control": "no-cache"
			},
			contentType: 'json',
			dataType: "json",
			data: requestData,
		});
		let {
			code,
			msg,
			data
		} = res.data;
		console.log(JSON.stringify(res.data))
		//token失效，需要强制刷新
		if (code == 10001) {
			if (!times) {
				times = 0;
			}
			times++;
			//最多尝试3次，不能死循环
			if (times > 3) {
				return false;
			}
			await this.getToken(true);
			return this.post(module, requestData, times);
		} else if (code == 0) {
			return data;
		}
		console.log("推送失败：", msg);
		return false;
	},
	/**
	 * 构造需要推送数据
	 * @param {Object} data
	 */
	async prepareData(data) {
		data.request_id = "uni" + Date.now() + "push";
		this.config = getPushConfig();
		await this.getToken();
		const {
			packageName,
		} = this.config;
		console.log("token", this.token);
		let {
			title,
			content,
			payload
		} = data;
		let intent =
			`intent:#Intent;action=android.intent.action.oppopush;launchFlags=0x14000000;package=${packageName};component=${packageName}/io.dcloud.PandoraEntry;S.UP-OL-SU=true;S.title=${title};S.content=${content};S.payload=${payload};end`;
		data.push_message = {
			//"transmission": payload
			"notification": {
				title,
				body: content,
				channel_level: 3,
				click_type: "intent",
				intent: intent
			}
		}
		data.push_channel = {
			"android": {
				"ups": {
					"notification": {
						title,
						body: content,
						channel_level: 3,
						click_type: "intent",
						intent: intent
					}
				}
			},
			"ios": {
				"type": "notify",
				payload,
				"aps": {
					"alert": {
						"title": "请填写ios标题",
						"body": "请填写ios内容"
					},
					"content-available": 0,
					"sound": "pushsound.caf"
				},
				"auto_badge": "+1",
			}
		}
	}
}
module.exports = model;
