<template>
	<view class="container">
		<view class="basic-section">
			<image class="bg" :src="banner"></image>
			<view class="user-info-box">
				<view class="portrait-box"><image class="portrait" :src="src"></image></view>
				<view class="info-box">
					<text class="username">{{ name }}</text>
					<view class="desc">
						<view class="">
							<text>{{ address }}</text>
						</view>
						<view class="">
							<text>{{ notice }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="cover-container">
			<!-- 订单信息统计 -->
			<view class="order-section">
				<view class="order-item" @click="navToOrder('0')" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-shouye"></text>
					<text>全部订单</text>
				</view>
				<view class="order-item" @click="navToOrder(1)" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-daifukuan">
						<text class="sub" v-if="order.unpaid > 0">{{ order.unpaid }}</text>
					</text>
					<text>待付款</text>
				</view>
				<view class="order-item" @click="navToOrder(2)" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-yishouhuo">
						<text class="sub" v-if="order.payup > 0">{{ order.payup }}</text>
					</text>
					<text>待发货</text>
				</view>
				<view class="order-item" @click="navToOrder(4)" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-shouhoutuikuan">
						<text class="sub" v-if="order.refund > 0">{{ order.refund }}</text>
					</text>
					<text>退款/售后</text>
				</view>
			</view>
			<!-- 商品信息统计，今日销售最高的4件商品 -->
			<!-- 今日收入统计 -->
		</view>
	</view>
</template>

<script>
import { getShopInfo } from '@/common/admin_request.js';
export default {
	data() {
		return {
			shopid: 0,
			name: '',
			src: '/static/store-face.png',
			banner: '/static/banner.jpg',
			address: '',
			notice: ''
		};
	},
	onLoad(options) {
		this.shopid = options.id;
		if (options.second) {
			//进一步跳转到下一页页面
			uni.navigateTo({
				url: `/pages/admin/${options.second}?shopid=${options.id}&state=${options.state}`
			});
		}
		this.loadData();
	},
	methods: {
		async loadData() {
			//优先读取缓存
			let info = uni.getStorageSync('adminShopInfo');
			if (info) {
				this.buildShopInfo(info);
			}
			getShopInfo({
				id: this.shopid
			}).then(
				res => {
					this.buildShopInfo(res);
				},
				err => {
					//获取店铺信息失败
					console.log('获取店铺信息失败');
				}
			);
		},
		buildShopInfo(data) {
			for (let i in data) {
				this[i] = data[i];
			}
		},
		navToOrder(state){
			let shopid = this.shopid;
			this.navTo(`/pages/admin/orderList?state=${state}&shopid=${shopid}`)
		},
		navTo(url) {
			/* if (!this.hasLogin) {
				url = '/pages/public/login';
			} */
			uni.navigateTo({
				url
			});
		}
	}
};
</script>

<style lang="scss">
%flex-center {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
%section {
	display: flex;
	justify-content: space-around;
	align-content: center;
	background: #fff;
	border-radius: 10upx;
}
.basic-section {
	height: 300upx;
	padding: 160upx 30upx 0;
	position: relative;
	// padding-top: calc(var(--status-bar-height) + 80upx);
	.bg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		filter: blur(1px);
		opacity: 0.7;
	}
}
.user-info-box {
	display: flex;
	position: relative;
	z-index: 1;
	.portrait {
		width: 130upx;
		height: 130upx;
		border: 2upx solid #fff;
		border-radius: 4%;
		margin-right: 20upx;
	}
	.username {
		font-size: $font-lg + 6upx;
		color: $font-color-dark;
	}
	.desc {
		font-size: $font-base;
		color: $font-color-base;
	}
}
.cover-container {
	background: $page-color-base;
	margin-top: 0upx;
	padding: 20upx 30upx;
	position: relative;
	background: #f5f5f5;
	padding-bottom: 20upx;
	.arc {
		position: absolute;
		left: 0;
		top: -34upx;
		width: 100%;
		height: 36upx;
	}
}
.order-section {
	@extend %section;
	padding: 28upx 0;
	// margin-top: 20upx;
	.order-item {
		@extend %flex-center;
		width: 120upx;
		height: 120upx;
		border-radius: 10upx;
		font-size: $font-sm;
		color: $font-color-dark;
		.yticon {
			position: relative;
		}
		.sub {
			position: absolute;
			top: -20upx;
			right: -18upx;
			font-size: $font-ssm;
			color: #fff;
			background: #fa436a;
			border-radius: 50%;
			width: 36upx;
			height: 36upx;
			text-align: center;
			line-height: 36upx;
		}
	}
	.yticon {
		font-size: 48upx;
		margin-bottom: 18upx;
		color: #fa436a;
	}
	.icon-shouhoutuikuan {
		font-size: 44upx;
	}
}
</style>
