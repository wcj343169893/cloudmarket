<template>
	<view class="container">
		<empty v-if="loaded === true && refundList.length === 0"></empty>
		<view v-for="(item, index) in refundList" :key="index" class="order-item" @click="navToOrderDetail(item)">
			<view class="">
				<text>{{item.id}}</text>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		refunds
	} from '@/common/request.js';
	export default {
		data() {
			return {
				refundList: []
			};
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			async loadData() {
				this.page++;
				refunds("getRefundApplys", {
					page: this.page,
					limit: this.limit
				}, false).then(res => {
					if (this.page == 1) {
						this.refundList = res;
					} else {
						this.refundList = Object.assign(this.refundList, res)
					}
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					}
				})
			}
		}
	}
</script>

<style lang="scss">

</style>
