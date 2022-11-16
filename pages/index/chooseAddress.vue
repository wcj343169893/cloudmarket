<template>
	<view class="container">
		<block v-if="addressList.length > 0">
			<view class="sec-header"><text>我的收货地址</text></view>
			<view class="">
				<view class="list b-b" v-for="(item, index) in addressList" :key="index" @click="checkAddress(item)">
					<view class="wrapper">
						<view class="address-box">
							<text v-if="item.default" class="tag">默认</text>
							<text class="address">{{ item.address }} {{ item.addressName }} {{ item.area }}</text>
						</view>
						<view class="u-box">
							<text class="name">{{ item.name }}</text>
							<text class="mobile">{{ item.mobile }}</text>
						</view>
					</view>
					<view class="checked" v-if="item.checked"><text class="yticon icon-right"></text></view>
				</view>
			</view>
			<!-- #ifdef MP -->
			<button class="add-btn" @click="navToAddAddress">新增地址</button>
			<!-- #endif -->
		</block>
		<block v-else>
			<view class="sec-header"><text>我的收货地址</text></view>
			<view class="center empty">
				<view class="" @click="navToAddAddress">
					<text>暂无收货地址，点击添加</text>
				</view>
			</view>
		</block>
		<view class="sec-header"><text>当前地址</text></view>
		<view class="list b-b" v-if="currentAddress.addressName && currentAddress.addressName.length > 0"
			@click="checkAddress(currentAddress)">
			<view class="wrapper">
				<view class="address-box">
					<text class="address">{{ currentAddress.addressName }}</text>
				</view>
				<view class="u-box">
					<text>{{ currentAddress.address }}</text>
				</view>
			</view>
			<view class="dingwei" @click.stop="getLocation(true)">
				<text class="yticon icon-dingwei"></text>
				<text>重新定位</text>
			</view>
		</view>
		<view class="list b-b" v-else>
			<view class="wrapper"><text>定位失败</text></view>
			<view class="dingwei" @click.stop="getLocation(true)">
				<text class="yticon icon-dingwei"></text>
				<text>重新定位</text>
			</view>
		</view>
		<view class="">
			<!-- <map id="map1" ref="map1" :latitude="latitude" :longitude="longitude" :markers="centerMaker" @regionchange="regionchange"
			 :show-location="show_location" style="width: 100%;height: 300px;"></map> -->
			<map id="map" class="map" min-scale="10" :scale="17" :show-location="true" :latitude="latitude"
				:longitude="longitude" @regionchange="onRegionchange">
				<cover-image class="map-center-icon" src="/static/location-center.png"></cover-image>
			</map>
		</view>
		<view class="sec-header"><text>附近地址</text></view>
		<view class="">
			<view class="list b-b" v-for="(item, index) in nearAddressList" :key="index" @click="checkAddress(item)">
				<view class="wrapper">
					<view class="address-box">
						<text class="address">{{ item.addressName }}</text>
					</view>
					<view class="u-box">
						<text>{{ item.address }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="sec-header"><text>附近店铺</text></view>
		<view class="">
			<view class="list b-b" v-for="(item, index) in nearShopList" :key="index" @click="navToShopHome(item)">
				<view class="wrapper">
					<view class="address-box">
						<text class="address">{{ item.name }}</text>

						<text class="distance">{{item.distanceText}}</text>
					</view>
					<view class="u-box">
						<text>{{ item.address }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		cloudMall,
		address
	} from '@/common/request.js';
	import {
		navToLoginPage
	} from '@/common/functions.js';
	import config from '@/config'
	import QQMapWX from '@/common/qqmap-wx-jssdk.min';
	const qqmapsdk = new QQMapWX({
		key: config.qqmapWxKey
	});
	let _mapCtx = null;
	export default {
		data() {
			return {
				latitude: 39.909,
				longitude: 116.39742,
				timer: false,
				show_location: true,
				mapContext: null,
				searchObj: null,
				centerMaker: [],
				nearShopList: [],
				addressList: [],
				nearAddressList: [],
				currentAddress: {
					address: ''
				}
			};
		},
		watch: {
			hasLogin() {
				console.log('watch 登录状态改变,刷新当前页面');
				setTimeout(() => {
					this.loadData();
				}, 100);
			}
		},
		computed: {
			...mapState(['hasLogin', 'location'])
		},
		onLoad(option) {
			if (this.hasLogin) {
				this.loadData();
			}
			setTimeout(() => {
				this.getLocation(false);
			}, 300);
			if (this.location && this.location.latitude > 0) {
				this.latitude = this.location.latitude;
				this.longitude = this.location.longitude;
				this.getShopList()
			}
			//console.log(this.location);
		},
		created() {
			_mapCtx = uni.createMapContext('map');
		},
		methods: {
			...mapMutations(['setUserLocation', 'changeShopId']),
			async loadData() {
				address({}, 'list').then(res => {
					res.forEach(ele => {
						ele.checked = ele._id == this.location.id;
					});
					this.addressList = res;
				});
			},
			getShopList() {
				cloudMall("shop", "getNearList", {
					latitude: this.latitude,
					longitude: this.longitude
				}).then(res => {
					console.log(res)
					this.nearShopList = res;
				})
			},
			navToShopHome(item) {
				item.shopFixedId = item.id;
				this.changeShopId(item);
				uni.showToast({
					title: "切换成功"
				})
				uni.switchTab({
					url: `/pages/index/fruit`
				})
			},
			async getLocation(isMsg) {
				//获取当前定位位置
				// #ifdef MP-WEIXIN
				wx.getFuzzyLocation({
					type: 'wgs84',
					success: (res) => {
						console.log('获取定位完成', res);
						this.latitude = res.latitude;
						this.longitude = res.longitude;
						if (isMsg) {
							this.$api.msg('重新定位成功');
						}
					},
					fail: res => {
						console.log('获取定位失败', res.errMsg);
						if (isMsg) {
							this.$api.msg('重新定位失败');
						}
					},
					complete: () => {
						this.reverseGeocoder();
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				uni.getLocation({
					success: (res) => {
						console.log('获取定位完成', res);
						this.latitude = res.latitude;
						this.longitude = res.longitude;
						if (isMsg) {
							this.$api.msg('重新定位成功');
						}
					},
					fail: res => {
						console.log('获取定位失败', res.errMsg);
						if (isMsg) {
							this.$api.msg('重新定位失败');
						}
					},
					complete: () => {
						this.reverseGeocoder();
					}
				})
				// #endif
			},
			//地图区域改变
			onRegionchange(e) {
				clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					//h5 end  安卓 regionchange
					if (e.type === 'end' || e.type === 'regionchange') {
						//中间位置
						_mapCtx.getCenterLocation({
							success: res => {
								this.latitude = res.latitude
								this.longitude = res.longitude
								this.reverseGeocoder();
							},
							fail: err => {
								console.log(err);
							}
						})
					}
				}, 500)
			},
			reverseGeocoder() {
				qqmapsdk.reverseGeocoder({
					location: {
						latitude: this.latitude,
						longitude: this.longitude
					},
					get_poi: 1,
					poi_options: "page_size=30;page_index=1",
					success: res => {
						console.log("reverseGeocoder", res);
						/* this.currentAddress = {
							addressName: res.result.address,
							latitude: res.result.location.lat,
							longitude: res.result.location.lng,
							address:""
						}; */
						this.nearAddressList = [];
						res.result.pois.map((e, index) => {
							if (index < 3) {
								this.nearAddressList.push({
									addressName: e.title,
									address: e.address,
									latitude: e.location.lat,
									longitude: e.location.lng
								});
							}
						})
						if (this.nearAddressList.length > 0) {
							this.currentAddress = this.nearAddressList[0];
						}
					},
					fail: err => {
						console.log(err)
					}
				});
			},
			checkAddress(item) {
				console.log("checkAddress item", item)
				let info = {
					id: item._id || false,
					name: item.addressName,
					latitude: item.latitude,
					longitude: item.longitude
				};
				this.setUserLocation(info);
				this.addressList.forEach(ele => {
					if (ele._id == item._id) {
						this.$set(ele, 'checked', true);
					} else {
						this.$set(ele, 'checked', false);
					}
				});
				this.$api.msg('设置地址成功', 1500, true, 'success');
				//this.$api.prePage().changeLocationInfo(info);
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					});
				}, 1500);
			},
			//添加或修改成功之后回调
			refreshList(data, type) {
				this.loadData();
			},
			navToAddAddress() {
				console.log(this.hasLogin)
				if (!this.hasLogin) {
					navToLoginPage();
					return;
				}
				uni.navigateTo({
					url: '/pages/address/addressManage?type=new'
				});
			}
		},
		//点击导航栏 buttons 时触发
		onNavigationBarButtonTap(e) {
			const index = e.index;
			if (index === 0) {
				this.navToAddAddress()
			}
		}
	};
</script>

<style lang="scss">
	.container {
		font-size: $font-base;
	}

	.sec-header {
		background: #f5f5f5;
		padding: 20upx 30upx;
		color: #9a9a9a;
	}

	.list {
		display: flex;
		align-items: center;
		padding: 20upx 30upx;
		background: #fff;
		position: relative;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.address-box {
		display: flex;
		align-items: center;

		.address {
			font-size: 30upx;
			color: $font-color-dark;
			flex: 1;
		}

		.distance {
			font-size: 24upx;
			color: $font-color-light;
		}
	}

	.u-box {
		font-size: 28upx;
		color: $font-color-light;
		margin-top: 16upx;

		.name {
			margin-right: 30upx;
		}
	}

	.icon-bianji {
		display: flex;
		align-items: center;
		height: 80upx;
		font-size: 40upx;
		color: $font-color-light;
		padding-left: 30upx;
	}

	.checked {
		color: #6bc56b;
	}

	.dingwei {
		color: #6bc56b;
		display: flex;
		align-items: center;
	}

	.btn-dingwei {
		width: 48upx;
		height: 48upx;
		margin-right: 8upx;
	}

	.empty {
		padding: 40rpx 0;
	}

	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 90%;
		height: 80upx;
		margin: 20upx auto;
		font-size: $font-lg;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
	}

	.map {
		width: 750rpx;
		height: 600rpx;
		flex: 1;
	}

	.map-center-icon {
		position: absolute;
		left: 339rpx;
		top: 264rpx;
		width: 72rpx;
		height: 72rpx;
	}

	.map-coverview {
		position: absolute;
		top: 0;
		left: 0;
		text-align: center;
		font-size: $font-sm;
		background: #FFFFFF;
		padding: 10rpx 20rpx;
		width: 100%;
		/* opacity: .7; */
	}
</style>
