const {
	Controller
} = require('uni-cloud-router')
module.exports = class MpController extends Controller {
	async init() {}

	/**
	 * 定时器，
	 */
	async timer() {}
	// async check() {
	// 	//1、公众号验证，只有get参数
	// 	//2、普通消息，除了get参数，还有post加密参数
	// 	console.log(this.ctx.query)
	// 	console.log(this.ctx.data)
	// 	//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX
	// 	//wbjwazJuGEfN9oEOHAWcVUFs3E7N6fgVGVDek96gfhc
	// 	console.log("this.ctx.data.echostr", this.ctx.data.echostr)
	// 	this.ctx.headers["content-type"] = "text/html;charset=utf-8";
	// 	return this.ctx.data.echostr;
	// 	//{"echostr":"7280837061730762682","nonce":"1690009142","signature":"cdc38aa3916478ce22ce3d46a0b406dac58f7068","timestamp":"1662353336"}
	// }
	async message() {
		this.ctx.headers["content-type"] = "text/plain";
		//this.ctx.headers["content-type"] = "text/html";
		let {
			MsgType,
			Event,
			Encrypt,
			EventKey
		} = this.ctx.data
		//{"echostr":"7280837061730762682","nonce":"1690009142","signature":"cdc38aa3916478ce22ce3d46a0b406dac58f7068","timestamp":"1662353336"}
		// {"ToUserName":"gh_d224039b88de","FromUserName":"ov7Ue52jOWPY1PCBu2e3yOXSJrTM","CreateTime":"1662365351","MsgType":"event","Event":"subscribe","EventKey":""}
		//{"nonce":"1497549628","openid":"ov7Ue52jOWPY1PCBu2e3yOXSJrTM","signature":"1d6f35b32dc950a3bda69267125eb593077c9a09","timestamp":"1662364193"}
		// {"ToUserName":"gh_d224039b88de","FromUserName":"ov7Ue52jOWPY1PCBu2e3yOXSJrTM","CreateTime":"1662364192","MsgType":"text","Content":"来了来了来了来了来了来了，来了就来了就好的","MsgId":"23799330441136176"}
		// console.log(this.ctx.query)
		const {
			echostr
		} = this.ctx.query
		// console.log(this.ctx.data)
		let result = false;
		let isEncrypt = false; //是否加密
		try {
			//验证签名
			let sign = this.service.weixin.mp.basic.validateSign(this.ctx); //生成签名
			if (!sign) return "签名错误"; // 检测签名
			if (echostr) return echostr; // 验证服务器
			let data = this.ctx.data;
			//解密数据
			if (Encrypt) {
				data = Object.assign(data, this.service.weixin.mp.basic.getEncryptData(Encrypt))
				delete data.Encrypt;
			}
			// console.log(data)
			if (!Event) {
				Event = "info"
			}
			//转换Event为驼峰命名方式
			Event = this.ctx.snakeToCamel(Event)

			console.log(MsgType, Event)
			//动态调用mp扩展下的方法
			result = await this.service.weixin.mp[MsgType][Event](data, EventKey)
		} catch (e) {
			//TODO handle the exception
			console.log("调用报错了")
			console.log(e)
		}
		if (!result) {
			//用户不会收到消息
			return "success";
		}
		//处理返回内容，文字、图文，视频，。。。{type:image,xxxx}
		if (this.ctx.isPlainObject(result)) {
			let {
				type
			} = result;
			let content = await this.service.weixin.mp.message[type](result.data);
			return this.ctx.buildWxXML({
				"ToUserName": this.ctx.data.FromUserName,
				"FromUserName": this.ctx.data.ToUserName,
				"CreateTime": parseInt(Date.now() / 1000),
				...content
			});
		}
		//默认返回文本
		return this.ctx.buildWxXML({
			"ToUserName": this.ctx.data.FromUserName,
			"FromUserName": this.ctx.data.ToUserName,
			"CreateTime": parseInt(Date.now() / 1000),
			MsgType: "text",
			Content: result,
		});
	}

}