<template>
	<view class="container">
		<view v-for="(item, index) in categoriesData" :key="index">
			<view class="title">
				<view class="subname">
					<text class="num">{{ index + 1 }}</text>
					<input type="text" value="" v-model="item.name" placeholder="请输入主分类名称" />
				</view>

				<image class="cate-image" :src="cateImgs[index]" mode="aspectFill" @click="changeIcon(index)"></image>
				<view class="">
					<text v-if="!item.children || item.children.length == 0" class="yticon icon-jia2" @click.stop="addChild(index)"></text>
					<text class="yticon icon-shanchu4 m-l" @click.stop="delParent(index)"></text>
				</view>
			</view>
			<view class="children">
				<view v-for="(child, childIndex) in item.children" :key="childIndex" class="child-line">
					<view class="subname">
						<text class="num">{{ index + 1 }}.{{ childIndex + 1 }}</text>
						<input type="text" value="" v-model="child.name" placeholder="请输入子分类名称" />
					</view>
					<text class="yticon icon-jia2" v-if="item.children.length == childIndex + 1" @click.stop="addChild(index)"></text>
					<text class="yticon icon-shanchu4" v-else @click.stop="delChild(childIndex, index)"></text>
				</view>
			</view>
		</view>

		<view class="specsTitlesBtn">
			<button class="add-btn cancel" @click="addParent">增加主分类</button>
			<button class="add-btn" @click="save">保存</button>
		</view>
	</view>
</template>

<script>
import { uploadFiles } from '@/common/functions.js';
import { categoryAdmin } from '@/common/admin_request.js';
export default {
	data() {
		return {
			categoriesData: [],
			cateImgs:{}
		};
	},
	onLoad() {
		this.loadData();
	},
	methods: {
		async loadData() {
			categoryAdmin('list', {}).then(
				res => {
					//console.log(res);
					//处理图片
					res.map((ele,index)=>{
						if(ele.src && ele.src !=""){
							this.$set(this.cateImgs,index,ele.src);
						}else{
							this.$set(this.cateImgs,index,"/static/errorImage.jpg");
						}
					})
					this.categoriesData = res;
				},
				err => {
					//没有分类
				}
			);
		},
		//添加主分类
		addParent() {
			this.categoriesData.push({
				id: false,
				name: '',
				pid: 0,
				goodsCount: 0,
				children: []
			});
		},
		//添加子集
		addChild(index) {
			console.log(index);
			if (!this.categoriesData[index].children) {
				this.$set(this.categoriesData[index], 'children', []);
			}
			let part = this.categoriesData[index];
			//如果主分类是新的，必须输入分类名称
			if (part.name.trim() == '') {
				this.$api.msg('请先完善主分类');
				return;
			}
			this.categoriesData[index].children.push({
				id: false,
				name: '',
				pid: part.id,
				goodsCount: 0
			});
		},
		//删除主分类
		delParent(index) {
			this.categoriesData.splice(index, 1);
		}, //删除子集
		delChild(childIndex, index) {
			this.categoriesData[index].children.splice(childIndex, 1);
		},
		changeIcon(index) {
			uploadFiles(
				'category_icon',
				1,
				srcs => {
					this.$set(this.cateImgs,index,srcs[0]);
				},
				srcs => {
					this.$set(this.categoriesData[index],"src",srcs[0]);
				}
			);
		},
		save() {
			//提取修改、新增，删除，由服务器处理
			categoryAdmin('save', {
				data: this.categoriesData
			}).then(
				res => {
					this.$api.msg('保存成功');
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);
				},
				err => {
					this.$api.msg(err.messsage || '保存失败');
				}
			);
		}
	}
};
</script>

<style lang="scss">
.container {
	font-size: $font-base;
	padding: 20rpx 30rpx;
}
.title {
	font-size: $font-lg;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.subname {
	flex: 1;
	display: flex;
	align-items: center;
	.num {
		margin-right: 8rpx;
		color: $base-color;
	}
}
.cate-image {
	width: 50rpx;
	height: 50rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}
.children {
	margin-left: 30rpx;
	padding-bottom: 30rpx;
}
.child-line {
	padding-top: 20upx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	input {
		font-size: $font-base;
	}
}

.specsTitlesBtn {
	margin-top: 30upx;
	padding-bottom: 30upx;
	display: flex;
	justify-content: space-between;
}
.add-btn {
	flex: 1;
	margin: 0 30upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $btn-color-light;
	border-radius: 10upx;
	&.cancel {
		background-color: $btn-color-spec;
	}
}
.m-l {
	margin-left: 40rpx;
}
.icon-shanchu4 {
	color: $font-color-warning;
}
.icon-jia2 {
	color: $font-color-emphasis;
}
</style>
