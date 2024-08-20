const createConfig = require('uni-config-center');
const fs = require("fs");
module.exports = (options) => {
	// 返回中间件函数
	return async function config(ctx, next) {
		let {
			APPID
		} = ctx.context;
		console.log("APPID", APPID)
		/**
		 * 从对象取值
		 * @param {Object} key1
		 * @param {Object} data
		 */
		ctx.objectFormat = function(key1, data) {
			if (!key1) {
				return "";
			}
			if (data[key1] !== undefined) {
				//存在变量对于的value
				return data[key1];
			}
			let keyArr = key1.split(".");
			if (keyArr.length > 1) {
				let tmp = data[keyArr[0]];
				keyArr.shift();
				for (let key2 of keyArr) {
					tmp = tmp[key2];
					if (tmp === undefined) {
						return key1;
					}
				}
				// console.log("tmp", tmp)
				if (tmp !== undefined) {
					return tmp;
				}
			}
			return key1;
		}
		/**
		 * 字符串格式化
		 * @param {Object} format
		 * @param {Object} data
		 */
		ctx.stringFormat = function(format, data) {
			if (!format) {
				return "";
			}
			//匹配大括号+英文字符
			return format.replace(/\{([a-zA-Z0-9$_\.]+)\}/g, key => {
				//去掉大括号，得到变量
				let key1 = key.replace(/[\{\}]/g, "");
				// console.log("key1", key1)
				return ctx.objectFormat(key1, data);
			});
		}
		// console.log("init config")
		/**
		 * 获取当前平台独有配置
		 */
		ctx.getConfigs.platformConfigs = function(key, platform) {
			if (!platform) {
				platform = ctx.context.PLATFORM;
			}
			return this.config(platform + "." + key)
		}

		/**
		 * 获取当前时区的时间
		 */
		ctx.getTimeZoneDate = function() {
			//时区
			let zone = this.getConfigs.config("timezone");
			//0时区时间戳
			let dt = new Date();
			dt.setHours(dt.getHours() + zone);
			return dt;
		}
		/**
		 * 根据平台随机获取一个值
		 * @param {Object} key
		 * @param {Object} platform
		 */
		ctx.getConfigs.getPlatformRandomValue = function(key, platform) {
			if (!platform) {
				platform = ctx.context.PLATFORM;
			}
			return this.getRandomValue(platform + "." + key)
		}
		/**
		 * 获取配置中的随机一个值
		 * @param {Object} key
		 */
		ctx.getConfigs.getRandomValue = function(key) {
			let values = this.config(key);
			if (!values) {
				return "";
			}
			if (typeof values == "object" && values.length > 0) {
				return values[parseInt(Math.random() * values.length)]
			}
			return ""
		}
		/**
		 * 获取支付配置
		 */
		ctx.getConfigs.paymentConfigs = function(key, platform) {
			if (!platform) {
				platform = ctx.context.PLATFORM;
			}
			//只需要文件完整地址
			let paths = ["alipayRootCertPath", "appCertPath", "alipayPublicCertPath"];
			//需要读取文件内容
			let fileContent = ["pfx"];
			let configs = {
				...this.config(platform + ".payment." + key)
			};
			if (!configs) {
				console.log("未读取到支付配置")
				return {}
			}
			for (let key in configs) {
				if (paths.indexOf(key) != -1 && configs[key]) {
					// 获取文件绝对路径
					configs[key] = this.resolve(configs[key]) // 获取文件的路径
				} else if (fileContent.indexOf(key) != -1 && configs[key]) {
					// 获取文件内容
					let fullPath = this.resolve(configs[key]) // 获取文件的内容
					try {
						console.log("p12文件读取", fullPath);
						configs[key] = fs.readFileSync(fullPath);
					} catch (e) {
						delete configs[key];
						console.log("p12文件读取失败", fullPath);
						console.log("error", e.message)
					}
				}
			}
			return configs;
		}
		/**
		 * 统一构造支付通知回调地址
		 * @param {Object} type
		 * @param {Object} module
		 */
		ctx.getConfigs.paymentNotifyUrl = function(type, module) {
			let domain = this.config("domain");
			if (!domain) {
				//拼接默认域名
				console.log("开始拼接默认域名")
				let {
					spaceId,
					provider
				} = ctx.context.SPACEINFO;
				if (provider == "tencent") {
					domain = `https://${spaceId}.service.tcloudbase.com`
				} else if (provider == "aliyun") {
					//https://3fbab731-e993-47e6-882f-a74e444709a3.bspapp.com
					domain = `https://${spaceId}.bspapp.com`
				}
			}
			return domain + this.config("notify-floder") +
				"/payment/notify/" + ctx.context.APPID + "/" + ctx.context.PLATFORM + "/" +
				type + "/" +
				module;
		}
		ctx.getConfigs.staticDomain = function() {
			let domain = this.config("static-domain");
			if (!domain) {
				//拼接默认域名
				console.log("开始拼接默认静态域名")
				let {
					spaceId,
					provider
				} = ctx.context.SPACEINFO;
				if (provider == "tencent") {
					//@todo 1302181076这个数字是腾讯云那边的用户id，目前不能直接获取
					//https://tcb-tqpzupiktzkqmrnffef9a-a84549-1302181076.tcloudbaseapp.com/
					// domain = `https://${spaceId}-1302181076.tcloudbaseapp.com`
				} else if (provider == "aliyun") {
					//https://static-3fbab731-e993-47e6-882f-a74e444709a3.bspapp.com/
					domain = `https://static-${spaceId}.bspapp.com`
				}
			}
			return domain;
		}
		/**
		 * 格式化字符串
		 * @param {String} key a.b.c
		 * @param {Object} data 
		 * @param {Boolean} platform 是否平台差异
		 */
		ctx.getConfigs.templateConfigs = function(key, data, platform) {
			let format = "";
			//是否存在平台差异
			if (platform) {
				format = this.platformConfigs(key);
			}
			if (!format) {
				format = this.config(key);
			}
			if (!format) {
				return "";
			}
			//匹配大括号+英文字符，例如{a.b.c}
			return ctx.stringFormat(format, data);
		}
		/**
		 * 根据前端appid，来获取配置
		 * @param {Object} key
		 * @param {Object} platform
		 */
		ctx.getAppConfigs = ctx.getConfigs;

		/**
		 * 获取uniid配置里面，指定平台下的指定类型信息
		 * @param {Object} config
		 * @param {Object} platform
		 * @param {Object} type
		 */
		ctx.getUniIdConfigs.appPlatformConfig = function(type, platform, dcloudAppid) {
			//getConfigs.platformConfigs
			if (!platform) {
				platform = ctx.context.PLATFORM;
			}
			// let currentConfig = this.currentAppConfig(dcloudAppid);
			return ctx.getUniIdConfigs.config([platform, type].join("."));
			//系统总配置
			let currentConfig = ctx.sysconfig;
			if (!currentConfig) {
				return ""
			}
			//把平台下的信息合并到主列表
			let platFormConfig = Object.assign({}, {
				...currentConfig,
				...currentConfig[platform]
			})
			if (type) {
				return platFormConfig[type];
			}
			return platFormConfig;
		}
		//判断是否是对象
		ctx.isPlainObject = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Object]'
		}
		ctx.getItemType = function(val) {
			return Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
		}
		// 简易版Object转XML，只可在微信支付时使用，不支持嵌套
		ctx.buildWxXML = function(obj, rootName = 'xml') {
			const content = Object.keys(obj).map(item => {
				//处理数组，key强制设置为item
				if (ctx.getItemType(obj[item]) == "array") {
					let arr = obj[item].map(e => {
						return ctx.buildWxXML(e, 'item')
					})
					return `<${item}>${arr.join('')}</${item}>`
				} else if (ctx.isPlainObject(obj[item])) {
					// return `<${item}><![CDATA[${JSON.stringify(obj[item])}]]></${item}>`
					//这里会造成2级同样的标签
					// return `<${item}>${ctx.buildWxXML(obj[item],item)}</${item}>`
					return ctx.buildWxXML(obj[item], item)
				} else {
					return `<${item}><![CDATA[${obj[item]}]]></${item}>`
				}
			})
			return `<${rootName}>${content.join('')}</${rootName}>`
		}
		// 简易版XML转Object，只可在微信支付时使用，不支持嵌套
		//无法解析内容中存在换行的item
		ctx.parseWxXML = function(xml) {
			const xmlReg = /<(?:xml|root).*?>([\s|\S]*)<\/(?:xml|root)>/
			const str = xmlReg.exec(xml)[1]
			const obj = {}
			const nodeReg = /<(.*?)>(?:<!\[CDATA\[){0,1}(.*?)(?:\]\]>){0,1}<\/.*?>/g
			let matches = null
			// eslint-disable-next-line no-cond-assign
			while ((matches = nodeReg.exec(str))) {
				obj[matches[1]] = matches[2]
			}
			return obj
		}
		/**
		 * 蛇形转驼峰
		 * @param {Object} str
		 */
		ctx.snakeToCamel = function(str) {
			return str.toLowerCase().replace(/_([a-z])/g, function(match, letter) {
				return letter.toUpperCase();
			});
		}
		if (ctx.event.queryStringParameters && ctx.event.queryStringParameters.apiToken) {
			let token = ctx.getConfigs.config("apiToken");
			ctx.apiLogin = ctx.event.queryStringParameters.apiToken == token;
			if (!token || !ctx.apiLogin) {
				ctx.throw('TOKEN_INVALID', "认证失败")
			}
			// ctx.data = ctx.event.queryStringParameters;
			delete ctx.data.apiToken;
		}
		//如果是微信公众号消息，则需要转换内容
		if (ctx.event.headers["content-type"] == "text/xml" && ctx.event
			.body) {
			// let body = new Buffer(ctx.event.body, 'base64')
			if (ctx.event.isBase64Encoded) {
				let body = Buffer.from(ctx.event.body, 'base64').toString('utf-8')
				ctx.data = ctx.parseWxXML(body);
			} else {
				ctx.data = ctx.parseWxXML(ctx.event.body);
			}
		}

		await next() // 执行后续中间件
	}
}