/**
 * @param {Object} data
 * 各个 数据请求 方法
 */
import network from "./network.js";
/**
 * 获取店铺信息
 * @param {Object} data
 */
const getShopInfo = function(data) {
	return network({
		url: "adminShopInfo",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
export {
	getShopInfo
}
