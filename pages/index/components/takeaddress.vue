<template>
	<view class="">
		<view class="seckill-section2" v-for="(item,index) in dataList" :key="index">
			<view class="sec2 b-b">
				<view class="image-content">
					<image :src="item.src" mode="aspectFill" lazy-load="true" class="img"></image>
				</view>
				<view class="content">
					<view class="title clamp">
						<text>{{ item.name }}</text>
					</view>
					<view class="desc">
						<text>距您 {{item.juli | formatDistance}}</text>
					</view>
				</view>
				<view class="more" v-if="item.isChecked">
					<text>已选自提点</text>
				</view>
				<view class="more" v-else>
					<button type="primary" @click="change(item)">选这个</button>
				</view>
			</view>
			<view class="sec3">
				<text class="taobaofont icon-locationfill"></text>
				<text>{{ item.address }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {};
		},
		props: {
			dataList: {
				type: Array,
				default: []
			}
		},
		methods: {
			change(item) {
				this.$emit("change",item)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.seckill-section2 {
		margin: 20rpx 20rpx 0;
		background: #FFFFFF;
		border-radius: 20rpx;

		.title {
			font-size: $font-lg;
		}

		.sec2 {
			padding: 20rpx;
			margin-bottom: 20rpx;
			display: flex;
			font-size: $font-sm + 2upx;
			overflow: hidden;
			align-items: center;
			position: relative;
		}

		.sec3 {
			font-size: $font-sm;
			display: flex;
			align-items: center;
			padding: 0 20rpx 20rpx;
			color: $font-color-light;
		}

		.content {
			padding: 0upx 20rpx 8rpx;
			overflow: hidden;
			flex: 1;
		}

		.m-lr {
			margin: 0 8rpx;
		}

		.warning {
			color: $font-color-warning;
		}

		$width: 90rpx;

		.image-content {
			width: $width;
			height: $width;
			border-radius: 20rpx;
			overflow: hidden;
		}

		.more {
			color: $font-color-light;
		}

		.img {
			width: $width;
			height: $width;
		}

		.desc {
			color: $font-color-light;
			font-size: $font-sm;
		}
	}
</style>
