<template>
	<view class="container">
		<view v-for="(item,index) in tags" :key="index" class="item b-b">
			<input type="text" v-model="item.name" placeholder="请输入"/>
			<view class="buttons">
				<button class="btn_add warning" @click="del(index)">删除</button>
			</view>
		</view>
		<view class="buttons">
			<button class="btn_add primary" @click="add()">新增</button>
			<button class="btn_add" @click="save()">保存</button>
		</view>
	</view>
</template>

<script>
	import {
		shopAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				tags: [],
				shopInfo:{}
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				this.shopInfo = uni.getStorageSync('adminShopInfo');
				this.tags = []
				this.shopInfo.goodsCommentTags.map(t => {
					this.tags.push({
						name: t
					})
				});
			},del(index){
				this.tags.splice(index,1)
			},add(){
				this.tags.push({
					name: ""
				})
			},
			save(){
				let data=[];
				this.tags.map(tag=>{
					data.push(tag.name);
				});
				shopAdmin("save", {
					goodsCommentTags: data
				},true).then(res => {
					this.$api.success("修改成功");
					this.shopInfo["goodsCommentTags"] = data;
					uni.setStorage({
						key: 'adminShopInfo',
						data: this.shopInfo
					})
					this.navTimeBack(() => {
						//上一个页面刷新
					})
				}, err => {
					this.isSubmit = false;
					this.$api.msg("修改失败");
				})
			}
		}
	}
</script>

<style lang="scss">
	.item{
		padding: 20rpx $page-row-spacing;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		.buttons{
			padding: 0;
			.btn_add{
				height: 50rpx;
				line-height: 50rpx;
				font-size: $font-base;
			}
		}
	}
	.buttons {
		padding: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.btn_add {
			width: 100%;
			font-size: 32upx;
			color: #fff;
			background-color: $base-color;
			border-radius: 10upx;
			margin: 0 10rpx;
			&.warning{
				background-color: $uni-color-warning;
			}
			&.primary{
				background-color: $uni-color-primary;
			}
		}
	}
</style>
