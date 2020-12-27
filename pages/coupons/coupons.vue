<template>
	<view class="container padding" :class="[globalAdminClass]">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="order-item bg-white radius padding-sm margin-bottom-sm" v-for="(item, index) in dataList" :key="index">
			<view class="item flex align-center" v-if="item.manjine">
				<text class="price text-lg">{{item.manjine.amount}}</text>
				<view class="text-sm flex-sub" @click="navToDetai(item)">
					<view class="text-lg">
						<text>满{{item.manjine.condition}}元可用</text>
						<text v-if="item.type == 1" class="margin-left-sm text-yellow text-sm">部分商品可用</text>
						<text v-else-if="item.type == 2" class="margin-left-sm text-yellow text-sm">限定分类可用</text>
						<text v-else class="margin-left-sm text-yellow text-sm">全店通用</text>
					</view>
					<view class="time text-xs padding-top-xs">
						<text>{{ item.beginTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
						<text class="padding-xs">~</text>
						<text>{{ item.endTime | dateFormat('yyyy-MM-dd hh:mm') }}</text>
					</view>
				</view>
				<view class="padding-right-xs text-sm">
					<button v-if="item.canGetAmount > 0" class="cu-btn sm bg-green" @click.stop="takeit(item)">领取</button>
					<text v-else class="text-grey">已领取</text>
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
			...mapMutations(['changeMainCateId']),
			loadData() {
				cloudMall("coupon", "list", {
					shopid: this.shopId
				}, false).then(res => {
					this.dataList = res;
					this.loaded = true;
					this.loadingType = "noMore"
				}, err => {
					this.loaded = true;
					this.loadingType = "noMore"
				});
			},
			takeit(item) {
				if (!this.isLogin) {
					this.navToLoginNotice();
					return false;
				}
				cloudMall("coupon", "takeit", {
					shopid: this.shopId,
					_id: item._id
				},true).then(res => {
					item.canGetAmount--;
					this.$api.success("领取成功")
				}, err => {
					this.$api.msg(err.message || "领取失败")
				});
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
		font-size: 56rpx;
		width: 110rpx;
	}

	.order-item {
		position: relative;
	}
</style>
