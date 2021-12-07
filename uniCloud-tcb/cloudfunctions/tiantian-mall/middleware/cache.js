const createConfig = require('uni-config-center');
//内存缓存，时间过期或者dock自动被清理
const memoryData = {};
module.exports = (options) => {
	// 返回中间件函数
	return async function cache(ctx, next) {
		/**
		 * 内存缓存
		 */
		ctx.memorycache = async function(key, data, expires = 3600, dataCallback = false, defaultCallback =
			false) {
			//默认增加前缀
			key = "memory_cache_" + key;
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
				data = await dataCallback();
				//没有数据
				if (!data) {
					if (defaultCallback) {
						return await defaultCallback()
					}
					return false;
				}
			}
			//写入
			expires = !expires ? 3600000 + time : expires * 1000 + time;
			//数据不能太多，否则会内存溢出
			memoryData[key] = {
				data: JSON.stringify(data),
				expires
			}
			return data;
		}
		/**
		 * 读取缓存数据/设置缓存数据
		 */
		ctx.dbcache = async function(key, data, expires = 3600, dataCallback = false) {
			const db = uniCloud.database();
			const cacheCollection = db.collection("tian-identity");
			//默认增加前缀
			key = "cache_" + key;
			let time = Date.now();
			//读取
			const result = await cacheCollection.where({
				key: key
			}).field({
				data: 1,
				expires: 1
			}).limit(1).get();
			if (!data) {
				if (result.data.length > 0 && result.data[0].expires > time) {
					return JSON.parse(result.data[0].data);
				}
				//没有可用的数据,或者数据过期
				//删除过期数据
				if (result.data.length > 0) {
					await cacheCollection.doc(result.data[0]._id).remove();
				}
				if (!dataCallback) {
					return false;
				}
				//回调获得需要的数据
				data = await dataCallback();
				//没有数据
				if (!data) {
					return false;
				}
			}
			//写入
			expires = !expires ? 3600000 + time : expires * 1000 + time;
			if (result.data.length > 0) {
				//修改
				await cacheCollection.where({
					key: key
				}).update({
					data: JSON.stringify(data),
					expires
				});
			}
			//新增
			await cacheCollection.add({
				key,
				data: JSON.stringify(data),
				expires
			});
			return data;
		}

		await next() // 执行后续中间件
	}
}
