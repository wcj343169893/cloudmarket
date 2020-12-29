<template>
	<view class="">
		<view class="flex align-center padding justify-between bg-white margin-bottom-sm tabs">
			<view v-for="(item,index) in tabs" :key="index" :class="{selected:item.selected}" @click="tab(index)">
				<text>{{item.name}}</text>
			</view>
		</view>
		<view class="container padding container-fixed" :class="[globalAdminClass]">
			<unicloud-db ref="udb" collection="cloud_coupons" orderby="modified desc,created desc, _id desc" :options="options"
			 :where="where" :page-size="options.pageSize" :page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error}"
			 @load="onqueryload">
				<view class="order-item bg-white radius padding-sm margin-bottom-sm" v-for="(item, index) in data" :key="index"
				 @click="navToItem('/pages/admin/coupon/edit?id='+item._id)">
					<view class="text-lg">
						<text>{{item.title}}</text>
					</view>
					<view class="item flex align-center">
						<text class="price text-lg" v-if="item.manjine">{{item.manjine.amount}}</text>
						<text class="price text-lg" v-else-if="item.manshuliang">{{item.manshuliang.amount}}</text>
						<view class="text-sm flex-sub">
							<view class="text-lg">
								<text v-if="item.manjine">满{{item.manjine.condition}}元可用</text>
								<text v-else-if="item.manshuliang">满{{item.manshuliang.condition}}件可用</text>
								<text v-if="item.type == 1" class="margin-left-sm text-yellow text-sm">商品券</text>
								<text v-else-if="item.type == 2" class="margin-left-sm text-yellow text-sm">分类券</text>
								<text v-else-if="item.type == 3" class="margin-left-sm text-yellow text-sm">店铺券</text>
							</view>
							<view class="time text-sm padding-top-xs">
								<text>{{ item.beginTime  }}</text>
								<text class="padding-xs">~</text>
								<text>{{ item.endTime  }}</text>
								<view class="text-xs">
									<text>{{item.memo}}</text>
								</view>
							</view>
							<view class="time text-sm padding-top-xs">
								<text>库存：{{item.stock?item.stock:0}}</text>
								<text class="padding-left-sm">已领取：{{item.statistics && item.statistics.count?item.statistics.count:0}}</text>
								<text class="padding-left-sm">已使用：{{item.statistics && item.statistics.used?item.statistics.used:0}}</text>
							</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>

					<view class="padding-right-xs state text-xs" :class="{warning:item.state != 1}">
						<text v-if="item.state == 1">已启用</text>
						<text v-else-if="item.state == 2">已停用</text>
						<text v-else>草稿箱</text>
					</view>
				</view>
				<empty v-if="!loading && data.length === 0"></empty>
				<uni-load-more :status="loadingType" v-if="loading"></uni-load-more>
			</unicloud-db>

			<button class="fixed-add-btn" @click="navToItem('/pages/admin/coupon/add')">新增优惠券</button>
		</view>
	</view>
</template>

<script>
	import {
		adminNetwork
	} from '@/common/admin_request.js';
	import {
		dateFormat
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				where: "",
				options: {
					pageSize: 10,
					pageCurrent: 1
				},
				dataList: [],
				tabs: [{
					name: "全部",
					where: undefined,
					selected: true,
				}, {
					name: "已启用",
					selected: false,
					where: "state == 1 &&  endTime > " + Date.now()
				}, {
					name: "草稿箱",
					selected: false,
					where: "state == 0 &&  endTime > " + Date.now()
				}, {
					name: "已停用",
					selected: false,
					where: "state == 2 &&  endTime > " + Date.now()
				}, {
					name: "已过期",
					selected: false,
					where: "endTime < " + Date.now()
				}]
			};
		},
		onLoad() {
			this.tab(0);
		},
		onPullDownRefresh() { //下拉刷新
			this.$refs.udb.loadData({
				clear: true //可选参数，是否清空数据
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		//滑到底部加载更多
		onReachBottom() {
			this.$refs.udb.loadData()
		},
		methods: {
			loadData() {
				/* adminNetwork("coupon", "list", {}).then(res => {
					this.dataList = res;
				}, err => {}).finally(f => {
					this.loaded = true;
				}); */
			},
			onqueryload(data, ended, pagination) {
				data.forEach(item => {
					if (item.beginTime) {
						item.beginTime = dateFormat(item.beginTime, 'yyyy-MM-dd hh:mm:ss');
					}
					if (item.endTime) {
						item.endTime = dateFormat(item.endTime, 'yyyy-MM-dd hh:mm:ss');
					}
				})
			},
			refreshList() {
				this.$refs.udb.loadData({
					clear: true //可选参数，是否清空数据
				}, () => {})
			},
			tab(index) {
				let where = ["shopid == " + this.adminShopId];
				this.tabs.forEach((t, i) => {
					t.selected = i == index;
					if (t.selected && this.tabs[index].where) {
						where.push(this.tabs[index].where)
					}
				})
				this.where = where.join(" && ");
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding-top: 120rpx;
	}

	.price.text-lg {
		font-size: 56rpx;
		width: 110rpx;
	}

	.order-item {
		position: relative;

		.state {
			position: absolute;
			top: 0;
			right: 0;
			background: $font-color-emphasis;
			color: #FFFFFF;
			padding: 2rpx 6rpx;

			&.warning {
				background: $font-color-warning;
			}
		}
	}

	.tabs {
		position: fixed;
		z-index: 99;
		width: 100%;
		left: 0;

		.selected {
			color: red;
		}
	}
</style>
