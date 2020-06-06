<template>
	<view class="container">
		<view class="cart-list">
			<block v-for="(item, index) in cartList" :key="index">
				<view class="goodsList" v-if="item.amount > 0">
					<view class="weui-flex">
						<view class="weui-flex start">
							<view class="weui-flex-check">
								<view class="image-wrapper">
									<image
										:src="item.src"
										:class="[item.loaded]"
										mode="aspectFill"
										lazy-load
										@load="onImageLoad('cartList', index)"
										@error="onImageError('cartList', index)"
									></image>
								</view>
							</view>
							<view class="desc weui-flex__item">
								<view class="">
									<text class="title">{{ item.title }}</text>
								</view>
								<view class="">
									<text>{{ item.subName }}</text>
									<text class="" v-if="item.cutPrice > 0">
										<text class="unit">比加入时便宜</text>
										<text class="price emphasis">{{ item.cutPrice }}</text>
									</text>
								</view>
								<view class="buttons" v-if="item.originPrice > 0">
									<view class="">
										<text class="unit">原价</text>
										<text class="price del">{{ item.originPrice }}</text>
									</view>
								</view>
								<view>
									<text class="price">{{ item.price }}</text>
									<text>X {{ item.amount }}</text>
								</view>
							</view>
						</view>
						<view class="total">
							<view class="price warning">
								<text>{{ item.price * item.amount }}</text>
							</view>
						</view>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			cartList: []
		};
	},
	onLoad() {
		this.loadData();
	},
	methods: {
		async loadData() {
			uni.getStorage({
				key: 'create_order_goods',
				success: res => {
					this.cartList = res.data;
				}
			});
		},
		//监听image加载完成
		onImageLoad(key, index) {
			this.$set(this[key][index], 'loaded', 'loaded');
		},
		//监听image加载失败
		onImageError(key, index) {
			this[key][index].image = '/static/errorImage.jpg';
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: $background-color;
}
.weui-flex {
	display: flex;
	align-items: center;
	&.start {
		align-items: flex-start;
	}
}
.weui-flex__item {
	flex: 1;
}
.cart-list {
	flex: 1;
	overflow: hidden;
	padding: 20upx 18upx 0;
	height: 100%;
	.space {
		padding-top: var(--window-bottom);
	}
	.s-item {
		display: flex;
		align-items: center;
		height: 70upx;
		font-size: 28upx;
		color: $font-color-dark;
	}
	.goodsList {
		position: relative;
		background: #ffffff;
		padding: 20upx;
		border-radius: 12upx;
		margin-bottom: 8upx;
		.start {
			flex: 1;
		}
		.sub-catename {
			padding-bottom: 10upx;
		}
	}
	.image-wrapper {
		width: 120upx;
		height: 120upx;
		border-radius: 4%;
		overflow: hidden;
		margin-right: 22upx;
		flex-shrink: 0;
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	.weui-flex-check {
		display: flex;
		align-items: center;
	}
	.checkbox {
		z-index: 8;
		font-size: 44upx;
		line-height: 1;
		padding: 4upx;
		border-radius: 50px;
		margin-right: 10upx;
	}
	.desc {
		flex: 1;
		font-size: $font-sm;
		color: $font-color-light;
		.title {
			font-size: $font-base;
			color: $font-color-dark;
			line-height: 1.1;
			font-weight: 400;
		}
		.desc2 {
			padding: 4upx 0 0;
		}

		.buttons {
			margin-top: 6upx;
			display: flex;
			justify-content: space-between;
			.empty {
				flex: 1;
			}
		}
	}
}
.m-l {
	margin-left: 10upx;
}
</style>
