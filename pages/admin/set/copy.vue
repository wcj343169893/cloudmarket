<template>
	<view class="container bg-white">
		<view class="padding-top padding-lr">
			<text>1.请选择需要复制的数据</text>
		</view>
		<mix-list-checkbox title="分类" v-model="database.category"></mix-list-checkbox>
		<mix-list-checkbox title="商品" v-model="database.goods"></mix-list-checkbox>
		<mix-list-checkbox title="广告" v-model="database.ads"></mix-list-checkbox>
		<mix-list-checkbox title="说明文档" v-model="database.documents"></mix-list-checkbox>
		<view class="padding-top padding-lr">
			<text>2.请选择需要同步的数据</text>
		</view>
		<mix-list-checkbox title="商品" v-model="synchronization.goods"></mix-list-checkbox>
		<view class="padding-top padding-lr">
			<text>3.请选择管理员</text>
		</view>
		<view class="padding">
			<view class="cu-avatar-group">
				<view class="cu-avatar round lg" v-for="(item,index) in users" :key="index" :style="[{ backgroundImage:'url(' + item.avatar + ')' }]"></view>
				<view class="cu-avatar round lg" @click="chooseUser"><text>+</text></view>
			</view>
		</view>
		<view class="padding flex flex-direction">
			<button class="cu-btn bg-green margin-tb-sm" @click="copy">确定开通</button>
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
				database: {
					category: true,
					goods: true,
					ads: true,
					documents: true,
				},
				synchronization: {
					goods: true
				},
				users: []
			};
		},
		methods: {
			chooseUser() {
				uni.setStorage({
					key: "selectedIds",
					data: this.users.map(u => u._id),
					success: () => {
						this.navTo('/pages/admin/user/list?type=choosemany');
					}
				});
			},
			refreshList(data, type) {
				console.log("data", data)
				this[type] = data;
			},
			copy() {
				this.$submitData(() => {
					adminNetwork("imports", "copy", {
						originShopId: this.adminShopId,
						database: this.database,
						synchronization: this.synchronization,
						users: this.users.map(u => u._id)
					}, true).then(res => {
						this.$api.success("复制成功")
						this.navTimeBack();
					}, e => {
						this.$api.msg("复制失败")
					})
				})
			}
		}
	}
</script>

<style lang="scss">

</style>
