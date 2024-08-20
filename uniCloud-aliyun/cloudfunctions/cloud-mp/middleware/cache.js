//内存缓存，时间过期或者dock自动被清理
const memoryData = {};
module.exports = (options) => {
	// 返回中间件函数
	return async function cache(ctx, next) {
		try {
			uniCloud.redis()
			ctx.hasRedis = true;
		} catch (e) {
			ctx.hasRedis = false;
			console.error("系统未开通redis高速缓存")
		}
		ctx.redisCache = async function(key, data, expires = 3600, dataCallback = false, defaultCallback =
			false) {
			const redis = uniCloud.redis()
			let configs = {
				expires
			}
			if (!data) {
				data = await redis.get(key)
				if (data) {
					//查询到结果
					return JSON.parse(data);
				}
				if (!dataCallback) {
					return false;
				}
				//回调获得需要的数据
				data = await dataCallback(configs);
				//没有数据
				if (!data) {
					if (defaultCallback) {
						return await defaultCallback(configs)
					}
					return false;
				}
			}
			let time = Date.now();
			//确定的某个时间
			if (configs.expires > time) {
				configs.expires = configs.expires - time;
			}
			// await redis.set(key, JSON.stringify(data))
			await redis.setex(key, configs.expires, JSON.stringify(data))
			return data;
		}
		/**
		 * 内存缓存
		 */
		ctx.memorycache = async function(key, data, expires = 3600, dataCallback = false, defaultCallback =
			false) {
			//开通了redis，即可直接使用
			if (ctx.hasRedis) {
				return ctx.redisCache(key, data, expires, dataCallback, defaultCallback);
			}
			let configs = {
				expires
			}
			let cacheKeys = Object.keys(memoryData);
			console.log("内存缓存数量", cacheKeys.length, cacheKeys)
			let time = Date.now();
			if (!data) {
				if (memoryData[key]) {
					if (memoryData[key].expires > time) {
						return JSON.parse(memoryData[key].data);
					}
					//已过期
					delete memoryData[key];
				}
				if (!dataCallback) {
					return false;
				}
				//回调获得需要的数据
				data = await dataCallback(configs);
				//没有数据
				if (!data) {
					if (defaultCallback) {
						return await defaultCallback(configs)
					}
					return false;
				}
			}
			//写入
			if (configs.expires < time) {
				expires = !configs.expires ? 3600000 + time : configs.expires * 1000 + time;
			} else {
				//返回的是时间戳
				expires = configs.expires;
			}
			//数据不能太多，否则会内存溢出
			//清理过期缓存
			cacheKeys.map(e => {
				if (!memoryData[e] || memoryData[e].expires < time) {
					delete memoryData[e];
				}
			})
			//再次得到总数量
			cacheKeys = Object.keys(memoryData);
			if (cacheKeys.length > 50) {
				//删除最早的一半
				cacheKeys.filter((e, index) => index < 25).map(e => {
					delete memoryData[e];
				})
			}
			memoryData[key] = {
				data: JSON.stringify(data),
				expires
			}
			console.log("写入缓存完成", key, expires)
			return data;
		}
		/**
		 * 读取缓存数据/设置缓存数据
		 */
		ctx.dbcache = async function(key, data, expires = 3600, dataCallback = false, defaultCallback =
			false) {
			//开通了redis，即可直接使用
			if (ctx.hasRedis) {
				return ctx.redisCache(key, data, expires, dataCallback, defaultCallback);
			}
			//优先判断内存缓存里面是否已经存在
			let configs = {}
			const db = uniCloud.database();
			const cacheCollection = db.collection("opendb-open-data");
			//默认增加前缀
			let time = Date.now();
			//读取
			const result = await cacheCollection.doc(key).get();
			console.log("从数据库读取完成", key, result.data.length)
			if (!data) {
				if (result.data.length > 0 && result.data[0].expires > time) {
					//同步数据库中的时间戳
					configs.expires = result.data[0].expires;
					return JSON.parse(result.data[0].value);
				}
				//没有可用的数据,或者数据过期
				//删除过期数据
				if (result.data.length > 0) {
					await cacheCollection.doc(key).remove();
				}
				if (!dataCallback) {
					return false;
				}
				//回调获得需要的数据
				data = await dataCallback(configs);
				//没有数据
				if (!data) {
					return false;
				}
			}
			//写入
			expires = !expires ? 3600000 + time : expires * 1000 + time;
			await cacheCollection.doc(key).set({
				value: JSON.stringify(data),
				expires
			});
			return data;
		}

		await next() // 执行后续中间件
	}
}
