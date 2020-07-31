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
					<view class="checked" v-if="item.checked">
						<text class="yticon icon-right"></text>
					</view>
				</view>
			</view>
		</block>
		<view class="sec-header"><text>当前地址</text></view>
		<view class="list b-b" v-if="currentAddress.addressName.length > 0" @click="checkAddress(currentAddress)">
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
			<map
				id="map1"
				ref="map1"
				:latitude="latitude"
				:longitude="longitude"
				:markers="centerMaker"
				@regionchange="regionchange"
				:show-location="show_location"
				style="width: 100%;height: 300px;"
			></map>
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
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { address } from '@/common/request.js';
import { navToLoginPage } from '@/common/functions.js';
export default {
	data() {
		return {
			latitude: 0,
			longitude: 0,
			show_location: true,
			mapContext: null,
			searchObj: null,
			centerMaker: [],
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
		this.getLocation(false);
		if (this.location.latitude > 0) {
			this.latitude = this.location.latitude;
			this.longitude = this.location.longitude;
		}
		//console.log(this.location);
	},
	onReady() {
		console.log('onReady');
		if (this.location.latitude > 0) {
			// #ifdef APP-PLUS
			this.mapContext = uni.createMapContext('map1', this);
			//地图搜索
			this.searchObj = new plus.maps.Search(this.mapContext.$getAppMap());
			this.searchObj.onRouteSearchComplete = (state, result)=>{
				console.log("onRouteSearchComplete",state, result);
				this.searchResult(result);
			}
			this.searchObj.onPoiSearchComplete = (state, result) => {
				console.log("onPoiSearchComplete",state, result);
				//this.nearAddressList = result.poiList;
				this.searchResult(result);
			};
			this.centerMaker.push({
				latitude: this.latitude,
				longitude: this.longitude
			});
			//#endif
		}
	},
	methods: {
		...mapMutations(['setUserLocation']),
		async loadData() {
			address({
				type: 'list'
			}).then(res => {
				res.forEach(ele => {
					ele.checked = ele._id == this.location.id;
				});
				this.addressList = res;
			});
		},
		async getLocation(isMsg) {
			//获取当前定位位置
			uni.getLocation({
				type: 'gcj02',
				altitude: true,
				geocode: true,
				success: res => {
					console.log('获取定位完成', res);
					this.latitude = res.latitude;
					this.longitude = res.longitude;
					//小程序不返回地址信息,需要调用另外的接口来查询位置
					//#ifdef MP
					this.currentAddress = {
						addressName: "",
						latitude: res.latitude,
						longitude: res.longitude,
						address: ""
					};
					//#endif
					//#ifndef MP
					let address="";
					if(res.address.street){
						address+=res.address.street;
					}
					if(res.address.streetNum){
						address+=res.address.streetNum;
					}
					this.currentAddress = {
						addressName: res.address.poiName,
						latitude: res.latitude,
						longitude: res.longitude,
						address: address
					};
					//#endif
					if (isMsg) {
						this.$api.msg('重新定位成功');
					}
				},
				fail: res => {
					console.log('获取定位失败', res.errMsg);
					if (isMsg) {
						this.$api.msg('重新定位失败');
					}
				}
			});
		},
		async poiSearchNearBy(pt) {
			let res = this.searchObj.poiSearchNearBy('住宅', pt, 1000);
			console.log("poiSearchNearBy",res);
		},
		//地图视野发生变化
		regionchange() {
			console.log('regionchange');
			//#ifdef APP-PLUS
			this.centerMaker = [];
			this.mapContext.getCenterLocation({
				success: lnglat => {
					console.log('获取getCenterLocation success',lnglat);
					var pt = new plus.maps.Point(lnglat.longitude, lnglat.latitude);
					this.centerMaker.push({
						latitude: lnglat.latitude,
						longitude: lnglat.longitude
					});
					this.poiSearchNearBy(pt);
				},
				fail: () => {
					console.log('获取getCenterLocation失败');
				},
				complete: () => {
					console.log('获取getCenterLocation complete');
				}
			});
			//#endif
		},
		searchResult(result){
			this.nearAddressList = [];
			result.poiList.map(e => {
				this.nearAddressList.push({
					addressName: e.name,
					address: e.address,
					latitude: e.point.latitude,
					longitude: e.point.longitude
				});
			});
		},
		checkAddress(item) {
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
		}
	},
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (!this.hasLogin) {
			navToLoginPage();
			return;
		}
		if (index === 0) {
			uni.navigateTo({
				url: '/pages/address/addressManage?type=new'
			});
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
</style>
