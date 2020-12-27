<template>
	<view class="container padding">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="order-item bg-white radius padding-sm margin-bottom-sm" v-for="(item, index) in dataList" :key="index">
			<view class="item flex align-center" v-if="item.manjine">
				<text class="price text-lg">{{item.manjine.amount}}</text>
				<view class="text-sm flex-sub">
					<view class="text-lg">
						<text>满{{item.manjine.condition}}元可用</text>
						<text v-if="item.type == 1" class="margin-left-sm text-yellow text-sm">部分商品可用</text>
						<text v-else-if="item.type == 2" class="margin-left-sm text-yellow text-sm">限定分类可用</text>
						<text v-else class="margin-left-sm text-yellow text-sm">全店通用</text>
					</view>
					<view class="time text-xs padding-top-xs">
						<text>失效时间:{{ item.endTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
					</view>
				</view>
				<view class="padding-right-xs text-sm" @click="navToDetai(item)">
					<button class="cu-btn sm bg-green">去使用</button>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
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
			...mapMutations(['changeMainCateId']),
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
			},
			navToDetai(item) {
				if (item.type == 1) {
					this.navToItem('/pages/coupons/goods', item)
				} else if (item.type == 2) {
					//主分类id
					this.changeMainCateId(+item.category.id);
					uni.switchTab({
						url: "/pages/index/marketCategory"
					})
				} else if (item.type == 3) {
					//全店
					uni.switchTab({
						url: "/pages/index/fruit"
					})
				}
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
