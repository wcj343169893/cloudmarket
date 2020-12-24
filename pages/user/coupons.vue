<template>
	<view class="container padding">
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
				<view class="padding-right-xs text-sm" @click="navToItem('/pages/coupons/goods',item)">
					<button class="cu-btn">去使用</button>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		getUserInfo
	} from '@/common/request.js'
	export default {
		data() {
			return {
				dataList: [],
				limit: 20
			};
		},
		onLoad() {
			this.loadData();
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				this.page++;
				getUserInfo({
					state: 0,
					page: this.page,
					limit: this.limit
				}, "coupons", false).then(res => {
					this.dataList = this.dataList.concat(res)
					if (res.length < this.limit) {
						this.loadingType = 'noMore'
					}
				}, err => {
					this.loadingType = 'noMore'
				}).finally(f => {
					this.loaded = true;
				})
			}
		}
	}
</script>

<style lang="scss">
	.price.text-lg {
		font-size: 48rpx;
		width: 100rpx;
	}

	.order-item {
		position: relative;
	}
</style>
