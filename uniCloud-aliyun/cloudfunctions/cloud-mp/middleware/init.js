const createConfig = require('uni-config-center');
const uniID = require('uni-id')
module.exports = (options) => {
	// 返回中间件函数
	return async function auth(ctx, next) {
		let {
			APPID
		} = ctx.context;
		//获取uni-id配置(支持多个appid设置)，由于clientdb依赖uni-id，所以用户登录token配置必须放到静态配置
		ctx.getUniIdConfigs = createConfig({
			pluginId: 'uni-id',
			cache: false
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
		//根据appID查询配置
		ctx.getAppConfigsByAppId = async function(APPID) {
			if (!APPID || APPID == "all") {
				//仅仅返回用户配置
				return ctx.getUniIdConfigs.config()
			}
			return ctx.memorycache("basic-config-" + APPID, false, 3600, async (configs) => {
				console.log("开始查询系统配置", APPID)
				const db = uniCloud.database();
				const cmd = db.command;
				const {
					data
				} = await db.collection("tian-identity").where(
					cmd.or({
						dcloud_appid: cmd.exists(false),
						type: "sysconfig"
					}, {
						dcloud_appid: APPID,
						type: "sysconfig"
					}, {
						dcloud_appid: [],
						type: "sysconfig"
					}, {
						dcloud_appid: "",
						type: "sysconfig"
					})).field({
					key: 1,
					dcloud_appid: 1,
					data: 1,
					dataType: 1,
				}).orderBy("key", "asc").limit(500).get();
				let outObj = {}
				if (data.length == 0) {
					console.log("未查询到系统配置")
					if (APPID) {
						outObj = ctx.getUniIdConfigs.currentAppConfig(APPID)
					}
					return outObj;
				}
				let allData = formatData(data)
				//公共配置
				let commonConfig = allData.filter(e => !e.dcloud_appid || e.dcloud_appid
					.length ==
					0);
				//应用特有配置
				let myConfig = allData.filter(e => e.dcloud_appid && e.dcloud_appid
					.indexOf(
						APPID) != -1);
				//合并uni-id内参数
				if (APPID) {
					outObj = ctx.getUniIdConfigs.currentAppConfig(APPID)
				}
				commonConfig.map(item => {
					let obj = item.key.split(".").reverse().reduce((total,
						item) => {
						return {
							[item]: total
						};
					}, item.data);
					// console.log(obj)
					deepMerge(outObj, obj)
					return obj;
				})
				//合并特有配置
				myConfig.map(item => {
					let obj = item.key.split(".").reverse().reduce((total,
						item) => {
						return {
							[item]: total
						};
					}, item.data);
					// console.log(obj)
					deepMerge(outObj, obj)
					return obj;
				})
				// console.log("configs", outObj)
				//测试环境，缓存为10秒
				if (!!outObj.debug && configs) {
					configs.expires = 10;
				}
				console.log("系统配置查询完成", configs)
				return outObj;
			})
		}
		//后台系统配置
		let sysconfig = await ctx.getAppConfigsByAppId(APPID);
		//由于系统使用了clientdb，依赖uni-id插件，必须从静态文件读取配置，passwordSecret和tokenSecret必须与配置文件一致
		ctx.uniID = uniID.createInstance({ // 自行创建uni-id实例，传入context，后续均使用此uniID调用相关接口
			context: ctx.context,
			config: {
				...sysconfig
			} // 完整uni-id配置信息，使用config.json进行配置时无需传此参数
		})
		//重新初始化
		ctx.getConfigs = createConfig({
			pluginId: 'tiantian-mall', // 插件id, 注意pluginId需和uni-config-center下的目录名一致
			cache: false,
			defaultConfig: {
				...sysconfig
			}, // 默认配置，非必填
			customMerge: (defaultConfig, userConfig) => {
				// 自定义默认配置和用户配置的合并规则，非必填，不设置的情况侠会对默认配置和用户配置进行深度合并
				// defaudltConfig 默认配置
				// userConfig 用户配置
				return Object.assign(userConfig, defaultConfig)
			}
		});
		await next() // 执行后续中间件
	}
}

function deepMerge(obj1, obj2) {
	let key;
	for (key in obj2) {
		// 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
		// 如果obj2[key]没有值或者值不是对象，此时直接替换obj1[key]
		obj1[key] =
			obj1[key] &&
			obj1[key].toString() === "[object Object]" && (obj2[key] && obj2[key].toString() ===
				"[object Object]") ?
			deepMerge(obj1[key], obj2[key]) : (obj1[key] = obj2[key]);
	}
	return obj1;
}

/**
 * 格式化配置
 * @param {*} data 
 */
function formatData(data) {
	return data.map(e => {
		//转换数据
		if (e.dataType == "object" || e.dataType == "array") {
			try {
				e.data = JSON.parse(e.data);
			} catch (e) {
				e.data = e.dataType == "object" ? {} : []
			}
		} else if (e.dataType == "int") {
			e.data = parseInt(e.data)
		} else if (e.dataType == "float" || e.dataType == "double") {
			e.data = parseFloat(e.data)
		} else if (e.dataType == "bool") {
			e.data = e.data == "true" ? true : false;
		}
		return e;
	});
}