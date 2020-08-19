import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {
	getUserInfo
} from '@/common/request.js';
const baseUserInfo = {
	nickname: "游客",
	avatar: "/static/missing-face.png",
	balance: 0,
	score: 0,
	birthday: '',
	coupons: 0
};
const store = new Vuex.Store({
	state: {
		hasLogin: false,
		token: '',
		stationId: 0, //分站id
		shopId: 123457, //分站店铺id，根据收货地址动态设置
		adminShopId: 0, //管理店铺id
		categoryId: 0, //选中主分类
		location: {
			id: false, //收货地址id
			latitude: 0, //纬度
			longitude: 0, //经度
			name: "" //地址名称
		},
		userInfo: baseUserInfo,
	},
	mutations: {
		//更新state数据
		setStateAttr(state, param) {
			if (param instanceof Array) {
				for (let item of param) {
					state[item.key] = item.val;
				}
			} else {
				state[param.key] = param.val;
			}
		},
		login(state, provider) {
			state.hasLogin = true;
			//state.userInfo = provider;
			uni.setStorageSync('uniIdToken', provider.token);
			uni.setStorageSync('uni_id_token', provider.token);
			//本地保持有效期
			uni.setStorageSync('uni_id_token_expires', provider.tokenExpired);
			//更新用户信息
			this.dispatch('getUserInfo');
			//缓存用户登陆状态
			/* uni.setStorage({
				key: 'userInfo',
				data: provider
			}) */
			//console.log(state.userInfo);
		},
		logout(state) {
			state.hasLogin = false;
			state.userInfo = baseUserInfo;
			//重置收货地址
			state.location = {
				id: false, //收货地址id
				latitude: 0, //纬度
				longitude: 0, //经度
				name: "" //地址名称
			};
			uni.removeStorage({
				key: 'userLocationInfo'
			});
		},
		loginPage() {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		},
		//修改最近店铺id
		changeShopId(state, id) {
			state.shopId = id;
		},
		//更新默认选中分类选项卡分类id
		changeMainCateId(state, id) {
			state.categoryId = id;
		},
		setUserLocation(state, data) {
			//获取用户位置信息，首页需要，如果是设置的收货地址，下次直接默认
			//顺序1：收货地址，2：当前定位，3：ip定位
			state.location = data;
			uni.setStorage({
				key: 'userLocationInfo',
				data: state.location
			})
		},
		//设置管理店铺id
		setAdminShop(state, id) {
			state.adminShopId = id;
			uni.setStorage({
				key: 'adminShopId',
				data: id
			})
		}
	},
	actions: {
		//更新用户信息
		async getUserInfo({
			state,
			commit
		}) {
			console.log("store getUserInfo")
			getUserInfo({}).then(res => {
				let info = Object.assign({
					uid: res._id
				}, {
					...baseUserInfo,
					...res
				});
				state.userInfo = info;
			}, err => {
				console.log("获取信息失败")
			});
		},
	}
})

export default store
