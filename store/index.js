import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {
	getUserInfo,
	getCartList,
	cloudUser
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
		cartCount: 0, //购物车总数
		getCartTime: 0, //获取购物车时间戳，5秒内只请求一次
		updatePushTime: 0, //更新push信息时间
		push: false,
		cartMap: {}, //购物车商品键值对
		location: {
			id: false, //收货地址id
			latitude: 0, //纬度
			longitude: 0, //经度
			name: "" //地址名称
		},
		inviteCode: "",
		userInfo: baseUserInfo,
		jgLoginInit: false
	},
	mutations: {
		//更新state数据
		setStateAttr(state, param) {
			for (let key in param) {
				state[key] = param[key];
			}
		},
		login(state, provider) {
			console.log("store login")
			//state.userInfo = provider;
			uni.setStorageSync('uniIdToken', provider.token);
			uni.setStorageSync('uni_id_token', provider.token);
			//本地保持有效期
			uni.setStorageSync('uni_id_token_expires', provider.tokenExpired);
			//设置登录状态
			state.hasLogin = true;
			if (provider.userInfo) {
				state.userInfo = provider.userInfo;
				uni.$emit('refreshCart'); //全局更新购物车
			} else {
				//更新用户信息
				this.dispatch('getUserInfo');
			}
			this.dispatch('updatePushClient');
			this.dispatch('getCartCount');
		},
		checkStoreLogin(state, provider) {
			console.log("store checkLogin")
			//设置登录状态
			state.hasLogin = true;
			//更新用户信息
			this.dispatch('getUserInfo');
			this.dispatch('updatePushClient');
			this.dispatch('getCartCount');
		},
		checkLogout(state) {
			console.log("checkLogout")
			state.hasLogin = false;
			state.userInfo = baseUserInfo;

			uni.removeStorage({
				key: "uni_id_token"
			});
			uni.removeStorage({
				key: "uniIdToken"
			});
			uni.removeStorage({
				key: "uni_id_token_expires"
			});
		},
		logout(state) {
			console.log("logout")
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
			this.commit('checkLogout');
			this.dispatch('getCartCount');
		},
		loginPage() {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		},
		//修改最近店铺id
		changeShopId(state, id) {
			state.shopId = id;
			console.log("store changeShopId");
			this.dispatch('getCartCount');
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
		},
		/**
		 * 设置邀请码
		 * @param {Object} state
		 * @param {Object} code
		 */
		setInvite(state, code) {
			state.inviteCode = code
		},
		updateCartNumber(state, number) {
			state.cartCount = number;
			if (state.cartCount < 1) {
				state.cartMap = {};
			}
		},
		incrCartNumber(state, step) {
			state.cartCount += step;
		},
		updateCartMap(state, cart) {
			let key = cart.goods_id + "_" + (+cart.sku_id);
			if (state.cartMap[key]) {
				state.cartMap[key] += cart.amount;
			} else {
				state.cartMap[key] = cart.amount;
			}
			let count = 0;
			for (let k in state.cartMap) {
				count += state.cartMap[k];
			}
			state.cartCount = count;
			console.log("cartCount", count)
		},
		/**
		 * 更新推送信息
		 * @param {Object} state
		 * @param {Object} push
		 */
		updatePush(state, push){
			state.push = push;
			this.dispatch('updatePushClient');
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

				uni.$emit('refreshCart'); //全局更新购物车
			}, err => {
				console.log("获取信息失败", err)
			});
		},
		//更新购物车数量
		async getCartCount({
			state,
			commit
		}) {
			let count = 0;
			let cartMap = {};
			let time = new Date().getTime();
			if (state.hasLogin && state.shopId > 0) {
				if ((time - state.getCartTime) < 5000) {
					console.log("store getCartList 时间间隔小于5秒")
					return;
				}
				console.log("store getCartList")
				try {
					/* const res = await getCartList({
						shopid: state.shopId,
						opt: "total"
					}) */
					const res = await getCartList({
						shopid: state.shopId,
						opt: "list"
					});
					if (res) {
						res.map(e => {
							count += e.amount;
							cartMap[e.goods_id + "_" + (+e.sku_id)] = e.amount;
						});
					}
					//count = +res;
				} catch (err) {}
			}
			commit('setStateAttr', [{
					key: 'cartCount',
					val: count
				},
				{
					key: 'cartMap',
					val: cartMap
				},
				{
					key: 'getCartTime',
					val: time
				}
			])
		},
		async updatePushClient({
			state,
			commit
		}) {
			if (state.hasLogin && state.push) {
				cloudUser("info", "push", {
					...state.push
				}).then(res=>{
					console.log("store 更新用户推送信息成功",res)
				},err=>{
					console.log("store 更新用户推送信息失败")
				})
			}
		}
	}
})

export default store
