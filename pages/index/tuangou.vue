<template>
	<view class="container">
		<tuangouPage :dataList="tuangouList" @saveCartAmount="saveCartAmount"></tuangouPage>
		<view class="bottom" v-show="isLoaded"><text>以下没数据了</text></view>
	</view>
</template>

<script>
	import tuangouPage from './components/tuan.vue';
	import {
		getTuangou,
		editCart
	} from '@/common/request.js';
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		navToGoodsItemPage,
		updateGoodsTags,
		showLoginDialog
	} from '@/common/functions.js';
	import tabbarMixin from './mixin/tabbar' 
	export default {
		mixins: [tabbarMixin], 
		components: {
			tuangouPage
		},
		onLoad() {
			this.loadData();
			this.setNavTitle();
		},
		computed: {
			...mapState(['hasLogin', 'stationId', 'shopId'])
		},
		data() {
			return {
				tuangouList: [],
				isLoaded: false,
				page: 1,
				limit: 10
			};
		},
		//滑到底部加载更多
		onReachBottom() {
			if (!this.isLoaded) {
				this.page += 1;
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				getTuangou({
					shopid: this.shopId,
					page: this.page,
					limit: this.limit
				}).then(
					res => {
						if (this.page == 1) {
							this.tuangouList = [];
						}
						this.isLoaded = res.length < this.limit;
						res.map(item => {
							updateGoodsTags(item);
							this.tuangouList.push(item);
						});
					},
					err => {
						this.isLoaded = true;
					}
				);
			},
			async setNavTitle(){
				let shopInfo = uni.getStorageSync("serviceShopInfo");
				if(shopInfo.pages && shopInfo.pages.home.titles.tuangou){
					uni.setNavigationBarTitle({
						title: shopInfo.pages.home.titles.tuangou
					});
				}
			},
			//更新购物车数据到服务器
			saveCartAmount(item, sku_id) {
				let number = 1;
				if (!this.hasLogin) {
					showLoginDialog();
					return;
				}
				console.log(item)
				editCart({
					id: this.shopId,
					stationId: this.stationId,
					goods_id: item.id,
					sku_id: +sku_id,
					price: item.price,
					title: item.title,
					appends: 1,
					subTitle: item.subName,
					src: item.src,
					checked: 1,
					amount: number
				}).then(res => {
					console.log(res);
					this.incrCartNumber(1);
					this.$api.msg("加入成功", 2000, true, "success")
				}, err => {
					this.$api.msg(err.message);
				});
			},
			navToGoodsPage(item) {
				navToGoodsItemPage(item);
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $background-color;
	}
	.bottom {
		text-align: center;
		font-size: $font-sm;
		color: $font-color-disabled;
		padding: 20upx;
	}
</style>
