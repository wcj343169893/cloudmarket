<template>
	<view class="container">
		<view class="icons">
			<view class="options">
				<view class="opt-item">
					<text class="yticon icon-dianhua-copy" @click="tel()"></text>
					<text>热线电话</text>
				</view>
				<!-- #ifdef MP -->
				<view class="opt-item">
					<button type="default" class="chat" open-type="contact">
						<text class="yticon icon-icon--"></text>
					</button>
					<text>在线客服</text>
				</view>
				<!-- #endif -->
			</view>
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
					type: "app_qa",
					shopid: this.shopId,
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
		text-align: center;
		margin: 0 30rpx 30rpx;
		color: $font-color-light;
	}

	.options {
		display: flex;
		align-items: center;
		justify-content: center;

		.opt-item {
			margin: 0 40rpx 10rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			color: $font-color-base;
		}

		.yticon {
			font-size: 80rpx;
			color: $base-color;
		}

		.chat {
			background: none;
			border: none;

			&:after {
				border: none;
			}
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

		&:after {
			left: 20rpx;
		}
	}
</style>
