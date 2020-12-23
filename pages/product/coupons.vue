<template>
	<view class="container padding" :class="[globalAdminClass]">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="order-item bg-white radius padding-sm margin-bottom-sm" v-for="(item, index) in dataList" :key="index">
			<view class="item flex align-center" v-if="item.manjine">
				<text class="price text-lg">{{item.manjine.amount}}</text>
				<view class="text-sm flex-sub">
					<view class="text-lg">
						<text>满{{item.manjine.condition}}元可用</text>
						<text v-if="item.goods" class="margin-left-sm text-yellow text-sm">部分商品可用</text>
						<text v-else-if="item.category" class="margin-left-sm text-yellow text-sm">限定分类可用</text>
						<text v-else class="margin-left-sm text-yellow text-sm">全店通用</text>
					</view>
					<view class="time text-xs padding-top-xs">
						<text>{{ item.beginTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
						<text class="padding-xs">~</text>
						<text>{{ item.endTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
					</view>
				</view>
				<view class="padding-right-xs text-sm" @click="takeit(item)">
					<text v-if="item.canGetAmount > 0" class="text-green">领取</text>
					<text v-else class="text-grey">已领取</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		cloudMall
	} from '@/common/request.js';
	export default {
		data() {
			return {
				dataList: []
			};
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			loadData() {
				cloudMall("coupon", "list", {
					shopid: this.shopId
				}).then(res => {
					this.dataList = res;
					this.loaded = true;
				}, err => {
					this.loaded = true;
				});
			},
			takeit(item) {
				cloudMall("coupon", "takeit", {
					shopid: this.shopId,
					_id: item._id
				}).then(res => {
					item.canGetAmount--;
					this.$api.success("领取成功")
				}, err => {
					this.$api.msg(err.message || "领取失败")
				});
			}
		}
	}
</script>

<style lang="scss">
	.price.text-lg {
		font-size: 56rpx;
		width: 110rpx;
	}

	.order-item {
		position: relative;
	}
</style>
