<template>
	<view class="container">
		<view v-for="(item,index) in goodsList" :key="index" class="item">
			<view class="goodsInfo">
				<image :src="item.src" mode="aspectFill" class="image"></image>
				<view class="info">
					<text>{{item.title}}</text>
					<text>{{item.name}}</text>
				</view>
			</view>
			<textarea v-model="item.comment" placeholder="分享一下吧" class="textarea" />
			<view class="tags">
				<block v-for="(tag,tagIndex) in tags" :key="tagIndex">
					<text class="tag0" :class="{active:item.commentTags&&item.commentTags.indexOf(tag) != -1}" @click="addTag(tag,index)">{{tag}}</text>
				</block>
			</view>
		</view>
		<!-- #ifdef MP -->
			<view class="buttons">
				<button class="btn_add" @click="save()">发布</button>
			</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		cloudMall
	} from '@/common/request.js';
	export default {
		data() {
			return {
				key: "commentOrder",
				id: "",
				goodsList: [],
				tags:["包装完整","价格便宜"]
			};
		},
		onLoad() {
			this.loadData()
		},
		// #ifndef MP
		//点击导航栏 buttons 时触发
		onNavigationBarButtonTap(e) {
			if (e.index === 0) {
				this.save();
			}
		},
		// #endif
		methods: {
			async loadData() {
				let order = uni.getStorageSync(this.key);
				this.id = order._id;
				order.goods.forEach(goods=>{
					if(!goods.commentTags){
						goods.commentTags=[];
					}
					if(!goods.comment){
						goods.comment="";
					}
				})
				this.goodsList = order.goods.filter(goods => !goods.isComment);
			},addTag(tag,index){
				if(this.goodsList[index].commentTags.indexOf(tag) == -1){
					this.goodsList[index].commentTags.push(tag);
				}else{
					//移除
					this.goodsList[index].commentTags = this.goodsList[index].commentTags.filter(t=>t!=tag)
				}
			},save(){
				let comment=[];
				this.goodsList.map(goods=>{
					if(goods.comment!=""){
						comment.push({
							comment:goods.comment,
							commentTags:goods.commentTags
						})
					}
				});
				if(comment.length == 0){
					this.$api.msg("评论内容不能为空")
					return;
				}
				cloudMall("orders","comment",{
					id:this.id,
					comment
				}).then(res=>{
					this.$api.success("发表评论成功");
					this.navTimeBack();
					//刷新上一个页面
					this.$api.prePage().refreshList();
				},err=>{
					this.$api.msg("发表评论失败")
				})
			}
		}
	}
</script>

<style lang="scss">
	page,
	.container {
		background: #f5f5f5;
		font-size: $font-sm;
		color: $font-color-dark;
	}
	.item{
		background-color: #FFFFFF;
		margin: 20rpx;
		padding: 20rpx;
		border-radius: 10rpx;
	}
		
	.goodsInfo {
		display: flex;
		.image {
			width: 80rpx;
			height: 80rpx;
			margin-right: 12rpx;
			border-radius: 8rpx;
		}
		.info{
			margin-top: 8rpx;
			display: flex;
			flex-direction: column;
		}
	}
	.textarea{
		margin-top: 14rpx;
		font-size: $font-sm;
		color: $font-color-dark;
		background: #f5f5f5;
		width: 100%;
		padding: 16rpx;
		border-radius: 10rpx;
		height: 220rpx;
	}
	.tags{
		margin-top: 20rpx;
		.tag0{
			margin-right: 10rpx;
			border: 2rpx solid #fff;
			padding: 2rpx 8rpx;
			border-radius: 4rpx;
			&.active{
				border-color: $base-color;
				color: $base-color;
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
		}
	}
</style>
