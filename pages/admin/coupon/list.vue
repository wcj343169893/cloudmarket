<template>
	<view class="container padding" :class="[globalAdminClass]">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="order-item bg-white radius padding-sm margin-bottom-sm" v-for="(item, index) in dataList" :key="index">
			<view class="item flex align-center" v-if="item.manjine">
				<text class="price text-lg">{{item.manjine.amount}}</text>
				<view class="text-sm flex-sub">
					<view class="text-lg">
						<text>满{{item.manjine.condition}}元可用</text>
						<text v-if="item.goods" class="margin-left-sm text-yellow text-sm">商品券</text>
						<text v-else-if="item.category" class="margin-left-sm text-yellow text-sm">分类券</text>
						<text v-else class="margin-left-sm text-yellow text-sm">店铺券</text>
					</view>
					<view class="time text-sm padding-top-xs">
						<text>{{ item.beginTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
						<text class="padding-xs">~</text>
						<text>{{ item.endTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
					</view>
				</view>
				<view class="padding-right-xs">
					<text v-if="item.state == 1" class="text-green">启用</text>
					<text v-else class="text-red">停用</text>
				</view>
				<text class="cell-more yticon icon-you"></text>
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
				dataList: []
			};
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			loadData() {
				adminNetwork("coupon", "list", {}).then(res => {
					this.dataList = res;
					this.loaded = true;
				}, err => {
					this.loaded = true;
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
</style>
