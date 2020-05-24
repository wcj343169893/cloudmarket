<template>
	<view class="container">
		<view class="sec-header"><text>我的收货地址</text></view>
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
			<view class="checked" v-if="item.checked"><image src="/static/icon/ok01.png" mode="" class="checked_image"></image></view>
		</view>
		<view class="sec-header"><text>当前地址</text></view>
		<view class="list b-b" v-if="currentAddress.address.length > 0" @click="checkAddress(currentAddress)">
			<view class="wrapper">
				<view class="address-box">
					<text class="address">{{ currentAddress.addressName }}</text>
				</view>
				<view class="u-box">
					<text>{{ currentAddress.address }}</text>
				</view>
			</view>
		</view>
		<view class="list b-b" v-else><text>定位失败</text></view>
		<view class="sec-header"><text>附近地址</text></view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { address } from '@/common/request.js';
export default {
	data() {
		return {
			addressList: [],
			currentAddress: {
				address: ''
			}
		};
	},
	computed: {
		...mapState(['hasLogin', 'location'])
	},
	onLoad(option) {
		this.loadData();
		console.log(this.location);
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
			//获取当前定位位置
			uni.getLocation({
				type: 'gcj02',
				altitude: true,
				geocode: true,
				success: res => {
					console.log('获取定位完成', res);
					this.currentAddress = {
						addressName: res.address.poiName,
						latitude: res.latitude,
						longitude: res.longitude,
						address: res.address.street + '' + res.address.streetNum
					};
					/* this.location.latitude = res.latitude;
					this.location.longitude = res.longitude;
					this.address = this.location.name = res.address.poiName;
					this.loadData(); */
				},
				fail: res => {
					console.log('获取定位失败', res.errMsg);
				}
			});
		},
		checkAddress(item) {
			let info = {
				id: item._id || 0,
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
			this.$api.msg('设置地址成功',1500,true,"success");
			this.$api.prePage().changeLocationInfo(info);
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
		if (index === 0) {
			uni.navigateTo({
				url:"/pages/address/addressManage?type=new"
			})
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
.checked_image {
	width: 64upx;
	height: 64upx;
}
</style>
