'use strict';
const db = uniCloud.database();
const cmd = db.command;
const delivery = require("delivery");
exports.main = async (event, context) => {
	//event为客户端上传的参数
	// console.log('event : ', context)
	// return delivery.getShop({
	// 	data: {},
	// 	module: "weixinjishipeisong"
	// }, context);

	//mockNotify
	// return delivery.mockNotify({
	// 	data: {
	// 		wx_store_id: "4000000000013832002",
	// 		store_order_id: "2024071111174820041807",
	// 		order_status: 30000,
	// 	},
	// 	module: "weixintongcheng"
	// }, context);


	// const {
	// 	data: orderData
	// } = await db.collection('cloud_orders').doc("668f85713d029c65e9daf27b").get();
	// return delivery.add({
	// 	data: orderData[0],
	// 	module: "weixintongcheng"
	// }, context);
	return delivery.getShop({
		data: {
			id: 10001
		},
		module: "weixintongcheng"
	}, context);
	const {
		data
	} = await db.collection('cloud_shops').get();
	//返回数据给客户端
	const shop = data[1];

	return await delivery.addShop({
		data: shop,
		module: "weixintongcheng"
	}, context);
	//广西壮族自治区南宁市邕宁区百济镇
	//重庆市渝中区中山四路85号副1-4号
	//广东省深圳市南山区沙河街道明珠街社区银行宿舍3栋沙河街5-2
	// const address = '广西壮族自治区南宁市邕宁区百济镇';
	// const parsedAddress = parseAddress.parse(address);
	// console.log(parsedAddress);
	return data
};

const parseAddress = {
	data: {
		province: '', //省
		city: '', //市
		area: '', //区
		street: '', //街道
		house: '', //门牌号
	},
	address: '',
	isZhiXiaShi: false,
	zhiXiaShi: ['北京市', '天津市', '上海市', '重庆市'],
	ziZhiQu: ['内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区'],
	teBieXingZhengQu: ['香港特别行政区', '澳门特别行政区'],
	sheng: ['河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省',
		'广东省', '海南省', '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省'
	],
	parse(address) {
		this.address = address;
		return this.getProvince(address).getCity().getArea().getStreet().getHouse().data;
	},
	getProvince(address) {
		const provinceArr = this.sheng.concat(this.zhiXiaShi, this.ziZhiQu, this.teBieXingZhengQu);
		const province = provinceArr.find(item => address.indexOf(item) === 0);
		if (province) {
			this.data.province = province;
			this.address = address.replace(province, '');
			//直辖市
			if (this.zhiXiaShi.indexOf(province) > -1) {
				this.isZhiXiaShi = true;
			}
		}
		return this;
	},
	getCity() {
		if (this.isZhiXiaShi) {
			this.data.city = this.data.province;
			return this;
		}
		//南宁市邕宁区百济镇
		//按市分割
		const addressArr = this.address.split('市');
		if (addressArr.length > 1) {

			this.data.city = addressArr.shift() + '市';
			this.address = addressArr.join('市');
		} else {
			this.data.city = this.data.province;
		}
		return this;
	},
	getArea() {
		const addressArr = this.address.split('区');
		if (addressArr.length > 1) {
			this.data.area = addressArr.shift() + '区';
			this.address = addressArr.join('区');
		}
		return this;
	},
	getStreet() {
		const addressArr = this.address.split('街道');
		if (addressArr.length > 1) {
			this.data.street = addressArr.shift() + '街道';
			this.address = addressArr.join('街道');
		}
		return this;
	},
	getHouse() {
		this.data.house = this.address;
		return this;
	}
}