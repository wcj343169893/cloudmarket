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
//获取水果首页数据
const getHomeFruitData = function(data) {
	return network({
		url: "homeFruit",
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
		data: data,
		isShowLoading: false
	})
}
//根据分类id，分页查询店铺
const getShopHome = function(data) {
	return network({
		url: "shopHome",
		data: data,
		isShowLoading: true
	})
}
const getGoodsByCid = function(data) {
	return network({
		url: "getGoodsByCid",
		data: data
	})
}
/**
 * 查询商品详情
 * @param {Object} data
 */
const getGoodsInfo = function(data) {
	return network({
		url: "goodsInfo",
		data: data
	})
}
//单独获取购物车数据
const getCartList = function(data) {
	data["opt"]=data.opt || "list";
	return network({
		url: "carts",
		data: data,
		isShowLoading: true
	})
}
//修改购物车数量，0为删除
const editCart = function(data) {
	data["opt"]="edit";
	return network({
		url: "carts",
		data: data,
		isShowLoading: false
	})
}
//清空购物车数量，0为删除
const cleanCart = function(data) {
	data["opt"]="clean";
	return network({
		url: "carts",
		data: data,
		isShowLoading: true
	})
}
//批量选择购物车
const selectCart = function(data) {
	data["opt"]="selected";
	return network({
		url: "carts",
		data: data,
		isShowLoading: true
	})
}
//预结算、结算提交订单
const settlement = function(data) {
	return network({
		url: "settlement",
		data: data,
		isShowLoading: true
	})
}
//收货地址管理,新增，删除，修改，列表
const address = function(data) {
	return network({
		url: "address",
		data: data,
		isShowLoading: true
	})
}
//支付查询
const payInfo = function(data) {
	return network({
		url: "payInfo",
		data: data,
		isShowLoading: true
	})
}
//订单
const orders = function(data) {
	let isShowLoading = data["type"] != "list";
	return network({
		url: "orders",
		data: data,
		isShowLoading: isShowLoading,
		isShowMask: true
	})
}
export {
	getHomeFruitData,
	getCategoryByPid,
	getShopsByCid,
	getHomeData,
	getShopHome,
	getGoodsInfo,
	getGoodsByCid,
	getCartList,
	editCart,
	selectCart,
	cleanCart,
	settlement,
	address,
	payInfo,
	orders
}
