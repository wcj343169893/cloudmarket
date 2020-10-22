<template>
	<view class="sub-container">
		<view class="header">
			<text>今日实时数据</text>
			<!-- <text class="more">10-22 14:20更新</text> -->
		</view>
		<view class="tongji">
			<view v-for="(item,index) in statisticsData" :key="index" class="item">
				<text class="name">{{item.name}}</text>
				<text>{{item.count}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		adminNetwork
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				statisticsData: []
			};
		},
		created() {
			this.loadData();
		},
		methods: {
			async loadData() {
				adminNetwork("statistics", "realtime", {}, true).then(res => {
					this.statisticsData = res;
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.sub-container {
		padding: 20rpx 0;
		background: #FFFFFF;
		font-size: $font-base;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 $page-row-spacing;
		font-size: $font-lg;

		.more {
			font-size: $font-sm;
			color: $font-color-light;
		}
	}

	.tongji {
		display: flex;
		align-items: center;
		padding: 0 20rpx;

		.item {
			flex: 1;
			display: flex;
			flex-direction: column;
			font-weight: 500;
			padding: 20rpx;
			border: 2rpx solid $border-color-light;
			margin: 20rpx 10rpx;
			border-radius: 8rpx;

			.name {
				margin-bottom: 12rpx;
			}

			&.checked {
				border-color: $uni-color-warning;
			}

		}
	}
</style>
