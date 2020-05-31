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
/**
 * 查询订单列表
 * @param {Object} data
 */
const getOrderList = function(data) {
	data["type"]="list";
	return network({
		url: "adminOrders",
		data: data,
		auth: true,
		isShowLoading: false
	})
}
/**
 * 订单管理
 * @param {Object} data
 */
const orderAdmin = function(data) {
	return network({
		url: "adminOrders",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
/**
 * 分页获取指定类型的商品
 * @param {Object} data
 */
const getGoodsList = function(data) {
	data["type"]="list";
	return network({
		url: "adminGoods",
		data: data,
		auth: true,
		isShowLoading: false
	})
}
/**
 * 商品信息管理
 * @param {Object} data
 */
const goodsAdmin = function(data) {
	return network({
		url: "adminGoods",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
export {
	getShopInfo,
	getOrderList,
	orderAdmin,
	getGoodsList,
	goodsAdmin
}
