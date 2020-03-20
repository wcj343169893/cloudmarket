<template>
	<view class="container">
		<!-- 店铺基本信息区域 -->
		<view class="shopinfo"></view>
		<view class="content">
			<scroll-view scroll-y="true" class="content-category">
				<view v-for="(item, index) in categoryList" :key="index">
					<text>{{ item.name }}</text>
				</view>
			</scroll-view>
			<scroll-view scroll-y="true" class="content-goods"><view v-for="(item, index) in goodsList" :key="index"></view></scroll-view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	data() {
		return {
			categoryList: [],
			goodsList: []
		};
	},
	async onLoad(options) {
		console.log(options);
		if (!options.id) {
			uni.showToast({
				icon: 'none',
				title: '店铺不存在'
			});
			setTimeout(function() {
				uni.navigateBack({
					delta: 1
				});
			}, 3000);
			return;
		}
		this.shopid = options.id;
		this.loadData();
	},
	computed: {
		...mapState(['userInfo', 'stationId'])
	},
	methods: {
		async loadData() {
			//加载店铺信息
			//加载店铺分类
			this.getCategoryByShopid();
		},
		getCategoryByShopid() {
			uniCloud
				.callFunction({
					name: 'getCategoryByShopid',
					data: {
						id: this.shopid,
						stationId: this.stationId,
						uid: this.userInfo.id
					}
				})
				.then(res => {
					console.log(res.result);
					if(res.result.affectedDocs>0){
						this.categoryList=res.result.data;
					}
				});
		}
	}
};
</script>

<style lang="scss">
.content {
	display: flex;
	.content-category {
		width: 160upx;
	}
	.content-goods {
		flex: 1;
	}
}
</style>
