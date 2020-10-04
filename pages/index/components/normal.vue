<template>
	<view class="container">
		<block v-if="dataList.length > 0">
			<view class="newest-section">
				<view v-for="(item, index) in dataList" :key="index" class="floor-item" @click="navToGoodsPage(item)">
					<view class="image-content">
						<image :src="item.src" mode="aspectFill" lazy-load="true" @load="imageOnLoad(item)" class="img"></image>
					</view>
					<view class="content">
						<view class="title clamp">
							<text>{{ item.title }}</text>
						</view>
						<view class="sub-title clamp" v-if="item.subTitle && item.subTitle != ''">
							<text>{{ item.subTitle }}</text>
						</view>
						<view class="weui-flex">
							<view class="weui-flex__item">
								<view class="tags">
									<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
								</view>
								<view class="">
									<text class="price">{{ item.price }}</text>
									<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
								</view>
							</view>
							<view class="buttons">
								<text class="sku_btn" v-if="item.yuding">查看</text>
								<text class="sku_btn" v-else-if="item.hasSku" @click.stop="openSku(item)">选规格</text>
								<text class="sku_btn yticon icon-gouwuche_" v-else @click.stop="saveCartAmount(item, 0)"></text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</block>
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
				this.$emit("saveCartAmount", item, sku_id);
			},
			openSku(item) {
				this.$emit("openSku", item);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.newest-section {
		display: flex;
		flex-wrap: wrap;
		font-size: $font-base;
		padding-top: 20upx;

		.floor-item {
			background: #ffffff;
			width: 344upx;
			margin-left: 20upx;
			padding: 0 0 20upx;
			margin-bottom: 20upx;
			border-radius: 4%;
			overflow: hidden;

			.content {
				padding: 0 16upx;
			}

			$width :344rpx;

			.image-content {
				width: $width;
				height: $width;
			}

			.img {
				width: $width;
				height: $width;
			}

			.title {
				margin: 8rpx 0;
			}
		}
	}

	.weui-flex {
		display: flex;
		align-items: center;
	}

	.weui-flex__item {
		flex: 1;
	}

	.m-t {
		margin-top: 22upx;
	}


	.sub-title {
		font-size: $font-sm;
		color: $font-color-light;
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
