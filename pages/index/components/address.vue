<template>
	<view class="flex" @click="navToAddress">
		<view class="titleNview-address" v-if="isSelfRaisingPoint">
			<text class="taobaofont icon-shoplight m-r"></text>
			<text>{{raisingPoint.name}}</text>
			<text>|</text>
		</view>
		<view class="titleNview-address" v-else-if="address != ''">
			<text>送至:{{ address }}</text>
			<text>|</text>
		</view>
		<view class="shop-name" v-if="shop && shop.id">
			<text class="name">{{shop.name}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {};
		},
		props: {
			isSelfRaisingPoint: {
				type: Boolean,
				default: false
			},
			address: {
				type: String,
				default: ""
			},
			shop: {
				type: Object,
				default: () => {
					return {}
				}
			},
			raisingPoint: {
				type: Object,
				default: {}
			}
		},
		methods: {
			navToAddress() {
				this.$emit("navToAddress")
			}
		}
	}
</script>

<style lang="scss" scoped>
	.flex {
		align-items: center;
	}

	.titleNview-address {
		font-size: $font-sm;
		color: #ffffff;
		position: relative;
		padding-left: 36upx;
		padding-bottom: 12upx;
		display: flex;
		align-items: center;
	}

	.shop-name {
		color: #ffffff;
		font-size: $font-sm;
		position: relative;
		display: flex;
		align-items: center;
		padding-bottom: 12upx;
		padding-left: 16upx;

		.name {
			padding-left: 6upx;
		}
	}
</style>
