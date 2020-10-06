<template>
	<view class="container">
		<view class="icons">
			<text class="yticon icon-bangzhu" @click="tel()"></text>
			<text>热线电话</text>
			<text>{{serviceTime}}</text>
		</view>
		<view class="qas">
			<view class="header">
				<text>常见问题</text>
			</view>
			<view class="content">
				<view v-for="(item,index) in dataList" :key="index" class="item b-b" @click="navTo('/pages/docs/docs?id='+item._id)">
					<text>{{item.title}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		cloudMall
	} from '@/common/request.js'
	export default {
		data() {
			return {
				key: "serviceShopInfo",
				serviceTime: "",
				phone: "",
				dataList: []
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				const shop = uni.getStorageSync(this.key);
				console.log(shop)
				this.phone = shop.phone;
				this.serviceTime = shop.serviceTime;
				cloudMall("document", "types", {
					type: "app_qa"
				}).then(res => {
					this.dataList = res;
				})
			},
			tel() {
				if (this.phone != "") {
					uni.makePhoneCall({
						phoneNumber: this.phone
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	.container {
		font-size: $font-sm;
	}

	.icons {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;

		.yticon {
			font-size: 80rpx;
			color: $base-color;
		}
	}

	.header {
		background: $background-color;
		padding: 20rpx;
		font-size: $font-base;
	}

	.item {
		position: relative;
		padding: 20rpx 30rpx;
		&:after{
			left: 20rpx;
		}
	}
</style>
