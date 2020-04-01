/**
 * @param {Object} data
 * 各个 数据请求 方法
 */
import network from "./network.js";
//获取首页数据
const getHomeData = function(data) {
	return network({
		url: "home",
		data: data,
		isShowLoading: false
	})
}
//根据上级id，查询二级分类
const getCategoryByPid = function(data) {
	return network({
		url: "getCategoryByPid",
		data: data,
		isShowLoading: false
	})
}
//根据分类id，分页查询店铺
const getShopsByCid = function(data) {
	return network({
		url: "getShops",
		data: data
	})
}
//根据分类id，分页查询店铺
const getShopHome = function(data) {
	return network({
		url: "shopHome",
		data: data
	})
}
const getGoodsByCid = function(data) {
	return network({
		url: "getGoodsByCid",
		data: data
	})
}
export {
	getCategoryByPid,
	getShopsByCid,
	getHomeData,
	getShopHome,
	getGoodsByCid
}
