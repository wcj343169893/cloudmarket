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
				return ct.objectFormat(key1, data);
			});
		}
		// console.log("init config")
		//获取插件配置
		ctx.getConfigs = createConfig({
			pluginId: 'tiantian-mall', // 插件id, 注意pluginId需和uni-config-center下的目录名一致
			defaultConfig: {}, // 默认配置，非必填
			customMerge: (defaultConfig, userConfig) => {
				// 自定义默认配置和用户配置的合并规则，非必填，不设置的情况侠会对默认配置和用户配置进行深度合并
				// defaudltConfig 默认配置
				// userConfig 用户配置
				return Object.assign(defaultConfig, userConfig)
			}
		});
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
		if (APPID) {
			/**
			 * 根据前端appid，来获取配置
			 * @param {Object} key
			 * @param {Object} platform
			 */
			ctx.getAppConfigs = createConfig({
				pluginId: APPID, // 插件id, 注意pluginId需和uni-config-center下的目录名一致
			});
			/**
			 * 获取当前平台独有配置
			 */
			ctx.getAppConfigs.platformConfigs = function(key, platform) {
				if (!platform) {
					platform = ctx.context.PLATFORM;
				}
				let config = this.config(platform + "." + key);
				// console.log("获取APP独立配置", config)
				if (config == undefined) {
					return ctx.getConfigs.platformConfigs(key, platform);
				}
				return config;
			}

		} else {
			ctx.getAppConfigs = {
				platformConfigs: () => {
					return "";
				}
			}
		}
		//获取uni-id配置(支持多个appid设置)
		ctx.getUniIdConfigs = createConfig({
			pluginId: 'uni-id'
		})

		//获取uni-id配置(支持多个appid设置)
		ctx.getUniIdConfigs.currentAppConfig = function(dcloudAppid) {
			//uni-id完整配置
			let config = this.config();
			if (config[0]) {
				config = Object.values(config);
			} else {
				return config;
			}
			if (!dcloudAppid) {
				dcloudAppid = APPID;
			}
			if (!dcloudAppid) {
				throw new Error(
					'uni-id初始化时未传入DCloud AppId，如果使用云函数url化访问需要使用uniID.createInstance方法创建uni-id实例，并在context内传入APPID参数'
				)
			}
			return config.find(item => item.dcloudAppid === dcloudAppid) || config.find(item => item
				.isDefaultConfig)
		}
		/**
		 * 获取uniid配置里面，指定平台下的指定类型信息
		 * @param {Object} config
		 * @param {Object} platform
		 * @param {Object} type
		 */
		ctx.getUniIdConfigs.appPlatformConfig = function(type, platform, dcloudAppid) {
			let currentConfig = this.currentAppConfig(dcloudAppid);
			if (!platform) {
				platform = ctx.context.PLATFORM;
			}
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

		if (ctx.event.queryStringParameters && ctx.event.queryStringParameters.apiToken) {
			let token = ctx.getConfigs.config("apiToken");
			ctx.apiLogin = ctx.event.queryStringParameters.apiToken == token;
			if (!token || !ctx.apiLogin) {
				ctx.throw('TOKEN_INVALID', "认证失败")
			}
			ctx.data = ctx.event.queryStringParameters;
			delete ctx.data.apiToken;
		}

		await next() // 执行后续中间件
	}
}
