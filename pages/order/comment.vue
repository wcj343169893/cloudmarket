<template>
	<view class="container">
		<view v-for="(item,index) in goodsList" :key="index" class="item">
			<view class="goodsInfo">
				<image :src="item.src" mode="aspectFill" class="image"></image>
				<view class="info">
					<text class="">{{item.title}}</text>
					<text class="sub">{{item.name}}</text>
				</view>
			</view>
			<view class="stars">
				<text>描述相符：</text>
				<text v-for="(star,starIndex) in stars" :key="starIndex" class="yticon icon-shoucang_xuanzhongzhuangtai" :class="{active:item.comment.star>starIndex}"
				 @click="changeStar(index,starIndex)"></text>
				<text class="result">{{item.comment.starResult}}</text>
			</view>
			<textarea v-model="item.comment.content" placeholder="分享一下吧" class="textarea" />
			<view class="tags">
				<text v-for="(tag,tagIndex) in tags" :key="tagIndex" class="tag0" :class="{active:item.comment.tags&&item.comment.tags.indexOf(tag) != -1}" @click="addTag(tag,index)">{{tag}}</text>
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
				stars:["非常差","不好","一般","很好","非常好"],
				star:5,
				maxSelectTag:5,
				tags:[]
			};
		},
		computed:{
			starResult(){
				return ""
			}
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
				order.goods.map((goods,index)=>{
					if(!goods.comment){
						goods.comment={
							tags:[],
							index:index,
							content:"",
							star:this.star,
							starResult:this.stars[this.star-1]
						};
					}
					if(!goods.refundAmount){
						goods.refundAmount=0;
					}
					if(!goods.isComment && goods.refundAmount<goods.amount){
						this.goodsList.push(goods);
					}
				});
				this.getTags();
			},
			getTags(){
				cloudMall("order","commentTags",{
					shopid:this.shopId
				}).then(res=>{
					this.tags = res;
				})
			},
			changeStar(index,star){
				this.goodsList[index].comment.star = star+1;
				this.goodsList[index].comment.starResult = this.stars[star];
			},
			addTag(tag,index){
				if(this.goodsList[index].comment.tags.indexOf(tag) == -1){
					if(this.goodsList[index].comment.tags.length >= this.maxSelectTag){
						return;
					}
					this.goodsList[index].comment.tags.push(tag);
				}else{
					//移除
					this.goodsList[index].comment.tags = this.goodsList[index].comment.tags.filter(t=>t!=tag)
				}
			},
			save(){
				let comment=[];
				this.goodsList.map(goods=>{
					if(goods.comment.content!=""){
						comment.push(goods.comment);
					}
				});
				if(comment.length == 0){
					this.$api.msg("评论内容不能为空")
					return;
				}
				cloudMall("order","comment",{
					id:this.id,
					comment
				}).then(res=>{
					this.$api.success("发表评论成功");
					this.navTimeBack(() => {
						//上一个页面刷新
						this.$api.prePage().refreshList();
					})
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
			flex: 1;
			margin-top: 8rpx;
			display: flex;
			flex-direction: column;
		}
		.sub{
			color: $font-color-disabled;
		}
	}
	.stars{
		margin-top: 14rpx;
		.yticon{
			margin-right: 30rpx;
			color: $font-color-disabled;
			&.active{
				color: $font-color-emphasis;
			}
		}
		.result{
			color: $font-color-light;
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
		display: flex;
		flex-wrap: wrap;
		.tag0{
			margin-right: 10rpx;
			border: 2rpx solid #fff;
			padding: 2rpx 8rpx;
			border-radius: 4rpx;    
			margin-bottom: 8rpx;
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
