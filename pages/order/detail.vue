<template>
	<view class="container">
		<view class="header">
			<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
			<view class="header_title">
				<text>已取消</text>
				<text class="yticon icon-you"></text>
				
			</view>
		</view>
		<view class="section message_notice m-t">
			<text>开启消息通知，及时获取订单配送信息</text>
			<button type="default" class="action-btn recom">去开启</button>
		</view>
		<view class="section m-t">
			<view class="sub-title"><text>订单未支付，已自动取消</text></view>
			<view class="buttons">
				<button type="default" class="action-btn">删除订单</button>
				<button type="default" class="action-btn">再次购买</button>
			</view>
		</view>
		<view class="m-t"></view>
	</view>
</template>

<script>
import { orders } from '@/common/request.js';
export default {
	data() {
		return {
			id: 0,
			info:{}
		};
	},
	onLoad(options) {
		this.id = options.id;
		this.loadData();
	},
	methods: {
		async loadData() {
			orders({
				id:this.id,
				type:"detail"
			}).then(res=>{
				this.info = res;
			})
		},
		navBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f5f5f5;
	font-size: $font-base;
	color: $font-color-dark;
}
.container {
	padding: 20upx;
	padding-top: calc(160upx + var(--status-bar-height));
}
.m-t {
	margin-top: 20upx;
}
.header {
	position: fixed;
	background: #f5f5f5;
	width: 100%;
	top: 0;
	left: 0;
	z-index: 99;
	padding-left: 20upx;
	padding-top: calc(40upx + var(--status-bar-height));
}
.header_title {
	font-size: $font-llg;
	display: flex;
	align-items: center;
	padding-top: 30upx;
	margin-bottom: 16upx;
	.icon-you {
		color: #9e9e9e;
		margin-top: 8upx;
	}
}
.section {
	background: #ffffff;
	padding: 30upx;
	border-radius: 20upx;
}
.message_notice {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.action-btn {
	height: 60upx;
	margin: 0;
	padding: 0 30upx;
	margin-left: 24upx;
	text-align: center;
	line-height: 60upx;
	font-size: $font-sm + 2upx;
	color: $font-color-dark;
	background: #fff;
	border-radius: 100px;
	&:after {
		border-radius: 100px;
	}
	&.recom {
		background: $base-color;
		color: #fff;
	}
}
.sub-title {
	font-weight: 500;
	margin-bottom: 40upx;
}
.buttons {
	display: flex;
	justify-content: flex-end;
}
</style>
