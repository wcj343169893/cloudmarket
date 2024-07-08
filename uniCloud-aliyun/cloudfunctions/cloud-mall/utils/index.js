'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	getConfig
} = require("configs");
const models = {
	/**
	 * 地址解析（地址转坐标）
	 * @param {Object} address 详细地址
	 * @param {Object} region 地区（选填）
	 * @link https://lbs.qq.com/service/webService/webServiceGuide/webServiceGeocoder
	 */
	async getAddressGeo(data) {
		const {
			address,
			region
		} = data;
		let {
			key,
			mode
		} = getConfig().qqmap;
		const res = await uniCloud.httpclient.request("https://apis.map.qq.com/ws/geocoder/v1/", {
			method: 'GET',
			data: {
				address,
				region,
				key
			},
			dataType: 'json'
		});
		console.log(res)
		if (res.status == 200 && res.data.status == 0) {
			return res.data.result;
		}
		return false;
	},
	/**
	 * 逆地址解析（坐标位置描述）
	 * @param {Object} fromLatlng
	 * @param {Object} poi_options
	 * @link https://lbs.qq.com/service/webService/webServiceGuide/webServiceGcoder
	 */
	async getLocationAddress(data) {
		let {
			fromLatlng,
			poi_options
		} = data;
		let {
			key,
			mode
		} = getConfig().qqmap;
		poi_options = poi_options || "address_format=short;policy=5";
		const res = await uniCloud.httpclient.request("https://apis.map.qq.com/ws/geocoder/v1/", {
			method: 'GET',
			data: {
				location: fromLatlng,
				get_poi: 1,
				poi_options: poi_options,
				key
			},
			dataType: 'json'
		});
		console.log(res)
		if (res.status == 200 && res.data.status == 0) {
			return res.data.result;
		}
		return false;
	},
	/**
	 * 根据经纬度，计算距离，如果需要在结算的时候，保证距离万无一失，就需要调用此接口，如果信任前端传过来的距离参数，就没必要调用
	 * @param {Object} fromLatlng 起点坐标
	 * @param {Object} toLatlng 终点坐标
	 * @link https://lbs.qq.com/service/webService/webServiceGuide/webServiceMatrix
	 */
	async getMapDistance(data) {
		let {
			fromLatlng,
			toLatlng
		} = data;
		let {
			key,
			mode
		} = getConfig().qqmap;
		console.log(fromLatlng, toLatlng)
		let fromLength = fromLatlng.split(";").length;
		let toLength = toLatlng.split(";").length;
		const res = await uniCloud.httpclient.request("https://apis.map.qq.com/ws/distance/v1/matrix", {
			method: 'GET',
			data: {
				key,
				mode,
				from: fromLatlng,
				to: toLatlng
			},
			dataType: 'json'
		});
		if (res.status == 200 && res.data.status == 0) {
			//一对一，只返回一个结果
			if (fromLength == toLength && toLength == 1) {
				return res.data.result.rows[0].elements[0];
			}
			//多对一
			if (toLength == 1) {
				let data = [];
				res.data.result.rows.map(ro => {
					data.push(ro.elements[0]);
				});
				return data;
			}
			return res.data.result.rows;
		}
		//查询失败
		return false;
	}
}
module.exports = models;
