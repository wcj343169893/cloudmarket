<template>
	<view class="container">
		<view class="seckill-section2">
			<view v-for="(item,index) in dataList" :key="index" @click="navToGoodsPage(item)" class="sec2">
				<view class="image-content">
					<image :src="item.src" mode="aspectFill" lazy-load="true" @load="imageOnLoad(item)" class="img"></image>
				</view>
				<view class="content">
					<view class="title clamp">
						<text>{{ item.title }}</text>
					</view>
					<view class="sub-title" v-if="item.subTitle && item.subTitle != ''">
						<text>{{ item.subTitle }}</text>
					</view>
					<view class="tags">
						<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
					</view>
					<view class="price-area">
						<view class="pa">
							<view class="miaoshaTime" v-if="item.yuding.isBegin">
								<text>结束时间：</text><text>{{item.yuding.endTime | dateFormat('MM-dd hh:mm')}}</text>
							</view>
							<view class="miaoshaTime basc" v-if="!item.yuding.isBegin">
								<text>开始时间：</text><text>{{item.yuding.beginTime | dateFormat('MM-dd hh:mm')}}</text>
							</view>
							<text class="price">{{ item.price }}</text>
							<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
						</view>
						<text class="sku_btn">查看</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		navToGoodsItemPage,
	} from '@/common/functions.js';
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
			navToGoodsPage(item) {
				navToGoodsItemPage(item);
			},
			saveCartAmount(item, sku_id) {
				console.log("saveCartAmount")
				this.$emit("saveCartAmount", item, sku_id);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.seckill-section2 {
		padding: 20rpx 20rpx 0;

		.title {
			font-size: $font-lg;
		}

		.sec2 {
			margin-bottom: 20rpx;
			display: flex;
			font-size: $font-sm + 2upx;
			background: #fff;
			border-radius: 20rpx;
			overflow: hidden;
		}

		.content {
			padding: 20upx 20rpx 8rpx;
			overflow: hidden;
			flex: 1;
		}

		.m-lr {
			margin: 0 8rpx;
		}

		.warning {
			color: $font-color-warning;
		}

		.miaoshaTime {
			font-size: $font-sm;
			margin: 4rpx 0;
			color: $base-color;
			font-weight: 500;
		}

		$width: 220rpx;

		.image-content {
			width: $width;
			height: $width;
		}

		.img {
			width: $width;
			height: $width;
		}

		.sec3 {
			flex-direction: column;
			$width: 710rpx;
			$height: 350rpx;

			.image-content {
				width: $width;
				height: $height;
			}

			.img {
				width: $width;
				height: $height;
			}
		}
	}

	.price-area {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.pa {
			flex: 1;
		}
	}

	.sub-title {
		font-size: $font-sm;
	}

	.sku_btn {
		color: #ffffff;
		background: $btn-color-light;
		font-size: $font-sm;
		float: right;
		padding: 4rpx 8rpx;
		border-radius: 8rpx;

		&.yticon {
			font-size: 56rpx;
			color: $btn-color-light;
			background: none;
		}
	}

	.price {
		font-size: $font-lg;

		&.del {
			font-size: $font-base;
		}
	}
</style>
