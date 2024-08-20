const {
	Service
} = require('uni-cloud-router')
const WeixinBasicService = require('../basic.js')
const {
	sha1,
	getNonceStr,
	toJson
} = require('./util');
const md5 = require('md5-node');
const crypto = require('crypto');
/**
 * 微信模板消息父类
 */
module.exports = class BasicService extends WeixinBasicService {
	constructor(ctx) {
		super(ctx)
		this.wxConfig = this.ctx.getConfigs.config(this.ctx.context.PLATFORM + ".oauth.weixin");
		console.log(this.wxConfig)
		if (this.wxConfig.key) {
			let encodingAESKey = this.wxConfig.key; // 安全模式时必要
			this.wxConfig.IV = encodingAESKey.slice(0, 16);
			this.wxConfig.aesKey = Buffer.from(encodingAESKey + '=', 'base64');
		}
	}
	validateSign({
		query,
		data
	}) {
		const {
			nonce,
			timestamp,
			signature,
			msg_signature
		} = query;
		this.isEncrypt = false; // 是否加密文
		if (!msg_signature) {
			let sign = sha1([this.wxConfig.token, timestamp, nonce].sort().join("")); //生成签名
			return sign == signature;
		}
		this.isEncrypt = true;
		let sign = sha1([this.wxConfig.token, timestamp, nonce, data.Encrypt].sort().join("")); //生成签名
		return sign == msg_signature;
	}
	getEncryptData(Encrypt) {
		return toJson(this.decrypt(Encrypt))
	}
	/**
	 * 获取最终结果
	 * @param {String} data 数据
	 */
	getResultData(data, isEncrypt = undefined) {
		if (this.isEncrypt) {
			let nonce = getNonceStr();
			let token = this.wxConfig.token;
			let timestamp = new Date().getTime();
			let encrypt = this.encrypt(data, aesKey, iv, appid);

			return "<xml>\n" +
				"<Encrypt><![CDATA[" + encrypt + "]]></Encrypt>\n" +
				"<MsgSignature><![CDATA[" + sha1([token, timestamp, nonce, encrypt].sort().join("")) +
				"]]></MsgSignature>\n" +
				"<TimeStamp>" + timestamp + "</TimeStamp>\n" +
				"<Nonce><![CDATA[" + nonce + "]]></Nonce>\n" +
				"<xml>";
		} else {
			return data;
		}
	}
	/**
	 * 加密数据
	 * @param {String} xmlMsg 格式化后的 xml 字符串
	 * @returns 加密后的字符串 填入到 Encrypt 节点中
	 * 参照官方文档 需要返回一个buf: 随机16字节 + xmlMsg.length(4字节）+xmlMsg+appid。
	 * buf的字节长度需要填充到 32的整数，填充长度为 32-buf.length%32, 每一个字节为 32-buf.length%32
	 */
	encrypt(xmlMsg) {
		let msg = new Buffer(xmlMsg);
		let msgLength = new Buffer(4);
		msgLength.writeUInt32BE(msg.length, 0);
		let random16 = crypto.pseudoRandomBytes(16);

		let corpId = new Buffer(this.wxConfig.appid);
		let raw_msg = Buffer.concat([random16, msgLength, msg, corpId]);
		let cipher = crypto.createCipheriv('aes-256-cbc', this.wxConfig.aesKey, this.wxConfig.IV);
		cipher.setAutoPadding(false); //重要，autopadding填充的内容无法正常解密
		raw_msg = this.PKCS7Encode(raw_msg);

		let cipheredMsg = Buffer.concat([cipher.update( /*encoded*/ raw_msg), cipher.final()]);

		return cipheredMsg.toString('base64');
	}
	/**
	 * 解密数据
	 * @param {String} text 需要解密的字段（Encrypt节点中的内容）
	 * @returns 返回消息内容（xml字符串）
	 */
	decrypt(text) {
		let decipher = crypto.Decipheriv('aes-256-cbc', this.wxConfig.aesKey, this.wxConfig.IV)
		// crypto.Decipheriv == crypto.createDecipheriv 两个方法是一样的
		decipher.setAutoPadding(false); //重要

		let decipheredBuff = Buffer.concat([decipher.update(text, 'base64'), decipher.final()])
		decipheredBuff = this.PKCS7Decode(decipheredBuff)

		let len_netOrder_corpid = decipheredBuff.slice(16)
		//切割掉16个随机字符，剩余为 (4字节的 msg_len) + msg_content(长度为 msg_len ) + msg_appId 
		let msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0)
		let msg_content = len_netOrder_corpid.slice(4, msg_len + 4).toString('utf-8')
		//  let msg_appId =len_netOrder_corpid.slice(msg_len+4).toString('utf-8')

		return msg_content
	}

	PKCS7Decode(buff) {
		/*
		 *去除尾部自动填充的内容
		 */
		let padContent = buff[buff.length - 1]
		if (padContent < 1 || padContent > 32) {
			padContent = 0
		}
		let padLen = padContent; //根据填充规则，填充长度 = 填充内容，这一步赋值可以省略
		return buff.slice(0, buff.length - padLen)
	}
	PKCS7Encode(buff) {
		let blockSize = 32;
		let needPadLen = 32 - buff.length % 32
		if (needPadLen == 0) {
			needPadLen = blockSize
		}
		let pad = new Buffer(needPadLen)
		pad.fill(needPadLen)
		let newBuff = Buffer.concat([buff, pad])
		return newBuff
	}
	async info(content) {
		console.log("mp默认方法")
	}
	/**
	 * 与系统用户绑定，如果未注册，则新增一个用户
	 * @param {Object} openid
	 */
	async bindAccount(openid) {
		console.log("开始绑定用户", openid)
		if (!this.wxConfig.appid || !this.wxConfig.appsecret) {
			console.log("没有配置公众号信息")
			return;
		}
		//先判断是否已经存在
		let localUser = await this.service.user.user.getUserInfoByWxOpenid(openid, this.wxConfig.appid, this.ctx
			.context.APPID)
		console.log("查询本站用户完成")
		if (!localUser) {
			//{"subscribe":1,"openid":"ov7Ue52jOWPY1PCBu2e3yOXSJrTM","nickname":"","sex":0,"language":"zh_CN","city":"","province":"","country":"","headimgurl":"","subscribe_time":1662371289,"unionid":"ofYLk5zLhhhBatURITd79GF2vI_8","remark":"","groupid":0,"tagid_list":[],"subscribe_scene":"ADD_SCENE_PROFILE_CARD","qr_scene":0,"qr_scene_str":""}
			let info = await this.getUserInfoByOpenid(openid)
			console.log("获取微信用户完成", info)
			if (!info) {
				//拉取微信用户信息失败，可能是配置出现了问题
				console.log("拉取微信用户信息失败，可能是配置出现了问题")
				return;
			}
			//查询用户是否存在
			if (info.unionid) {
				localUser = await this.service.user.user.getUserInfoByUnionid(info.unionid, this.ctx.context
					.APPID);
			}
			if (!localUser) {
				//注册本站用户
				localUser = {
					username: md5(this.wxConfig.appid + openid) + "",
					password: openid,
					dcloud_appid: [this.ctx.context.APPID],
					nickname: "公众号用户",
					is_subscribe_mp: true,
					wx_openid: {
						[this.wxConfig.appid]: openid,
						"mp-weixin": openid
					},
					wx_unionid: info.unionid
				}
				console.log("注册本站开始", localUser)
				//可能没有unionid
				const {
					uid
				} = await this.ctx.uniID.register(localUser)
				console.log("注册本站完成", uid)
				localUser._id = uid;
			}
		}
		//如果没有公众号信息，则更新进去
		if (localUser && localUser._id && !localUser.is_subscribe_mp) {
			//更新用户为关注公众号
			await this.service.user.user.update(localUser._id, {
				is_subscribe_mp: true,
				wx_openid: {
					[this.wxConfig.appid]: openid
				}
			})
		}

		return localUser;
	}
	async getUserInfoByOpenid(openid) {
		return this.ctx.dbcache("mp-openid:" + openid, null, 3600, async () => {
			let token = await this.getAccessToken({
				appid: this.wxConfig.appid,
				appsecret: this.wxConfig.appsecret,
			});
			if (!token) {
				return false;
			}
			let {
				data: resultData
			} = await this.curl(
				`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=zh_CN`, {
					method: "GET",
					contentType: "json",
					dataType: "json",
				});
			console.log(resultData)
			return resultData;
		})
	}
	/**
	 * 根据主键id，查询信息，需要子类定义this.collection
	 * @param {Object} id
	 */
	async getInfoById(id) {
		if (!this.collection) {
			return false;
		}
		let {
			data
		} = this.collection.doc(id).get();
		if (data.length > 0) {
			return data[0]
		}
		return false;
	}
}