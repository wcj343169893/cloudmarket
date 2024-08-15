const {
	getConfig
} = require("configs");
const {
	dbcache
} = require("base-common");
const mapUtil = {
	getLocationAddress: async (shop) => {
		let {
			longitude,
			latitude
		} = shop;
		let {
			key
		} = getConfig("qqmap");
		return dbcache("qqmap_" + latitude + "_" + longitude, false, 3600, async () => {
			const res = await uniCloud.httpclient.request(
			"https://apis.map.qq.com/ws/geocoder/v1/", {
				method: 'GET',
				data: {
					location: [latitude, longitude].join(","),
					get_poi: 0,
					key
				},
				dataType: 'json'
			});
			if (res.status == 200 && res.data.status == 0) {
				let {
					ad_info,
					address_reference,
					address_component
				} = res.data.result;
				if (ad_info) {
					let house = address_component.street_number
					if (!house) {
						house = address_reference.landmark_l2.title
					}
					return {
						province: address_component.province,
						city: address_component.city,
						area: address_component.district,
						street: address_component.street,
						house
					}
				}
			}
			return {
				status: 0,
				message: res.data.message,
				province: '',
				city: '',
				area: '',
				street: '',
				house: ''
			};
		});
	}
}
module.exports = mapUtil;