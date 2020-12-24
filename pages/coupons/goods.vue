<template>
	<view>
		<empty v-if="loaded === true && goods.length === 0"></empty>
		<normalPage :dataList="goods" @openSku="openSku" @saveCartAmount="saveCartAmount"></normalPage>
		<uni-load-more v-if="!loaded" :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import normalPage from '../index/components/normal.vue';
	import {
		cloudMall
	} from '@/common/request.js'
	export default {
		components: {
			normalPage,
		},
		data() {
			return {
				"amount": 1,
				"beginTime": 0,
				"created": 0,
				"endTime": 0,
				"goods": [],
				"id": "",
				"limit": 0,
				"manjine": {},
				"state": 0,
				"type": 1
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			loadData() {
				let data = this.getItemData(true);
				//查询商品信息
				if (data.goods && data.goods.length > 0) {
					this.goods = [];
					cloudMall("product", "getByIds", {
						shopid: data.shopid,
						ids: data.goods.map(g => g._id)
					}).then(res => {
						console.log(res)
						this.goods = res;
					}).finally(f => {
						this.loadingType = "noMore";
						this.loaded = true;
					});
				}
			}
		}
	}
</script>

<style lang="scss">

</style>
