<template>
	<view class="container">
		<view v-for="(item, index) in categoriesData" :key="index" class="main b-b">
			<view class="title">
				<view class="subname">
					<text class="num">{{ index + 1 }}</text>
					<input type="text" value="" v-model="item.name" placeholder="请输入主分类名称" />
				</view>
				<button type="default" v-if="!item.isShow" class="add-btn small" @click="changeIsShow(index,false,1)">显示</button>
				<button type="default" v-else class="add-btn small disable" @click="changeIsShow(index,false,0)">隐藏</button>

				<button type="default" v-if="!item.isRecommend" class="add-btn small" @click="changeRecommend(index,1)">推荐</button>
				<button type="default" v-else class="add-btn small disable" @click="changeRecommend(index,0)">不推</button>
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
					<button type="default" v-if="child.isShow===0" class="add-btn small" @click="changeIsShow(index,childIndex,1)">显示</button>
					<button type="default" v-else class="add-btn small disable" @click="changeIsShow(index,childIndex,0)">隐藏</button>
					<text class="yticon icon-jia2" v-if="item.children.length == childIndex + 1" @click.stop="addChild(index)"></text>
					<text class="yticon icon-shanchu4" v-else @click.stop="delChild(childIndex, index)"></text>
				</view>
			</view>
		</view>

		<view class="specsTitlesBtn" v-if="isLoaded">
			<button class="add-btn cancel" @click="addParent">增加主分类</button>
			<button class="add-btn" @click="save">保存</button>
		</view>
	</view>
</template>

<script>
	import {
		uploadFiles
	} from '@/common/functions.js';
	import {
		categoryAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				categoriesData: [],
				cateImgs: {},
				changeIconIndex:0,
				submit: false,
				isLoaded: false
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
						res.forEach((ele, index) => {
							if (ele.src && ele.src != '') {
								this.$set(this.cateImgs, index, ele.src);
							} else {
								this.$set(this.cateImgs, index, '/static/errorImage.jpg');
							}
							if (ele.isShow !== 0) {
								ele.isShow = 1;
							}
							if (ele.children) {
								ele.children.forEach(child => {
									if (child.isShow !== 0) {
										child.isShow = 1;
									}
								})
							}
						});
						console.log(res)
						this.categoriesData = res;
						this.isLoaded = true;
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
			changeRecommend(index, isRecommend) {
				this.$set(this.categoriesData[index], 'isRecommend', +isRecommend);
			},
			changeIsShow(index, childIndex, isRecommend) {
				if (childIndex === false) {
					this.$set(this.categoriesData[index], 'isShow', +isRecommend);
				} else {
					this.$set(this.categoriesData[index].children[childIndex], 'isShow', +isRecommend);
				}
			},
			/**
			 * 修改头像
			 * @param {Object} index
			 */
			changeIcon(index) {
				/* uploadFiles(
					'category_icon',
					1,
					srcs => {
						this.$set(this.cateImgs, index, srcs[0]);
					},
					srcs => {
						this.$set(this.categoriesData[index], 'src', srcs[0]);
					}
				); */
				this.changeIconIndex = index;
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera', 'album'], //从相册选择
					success: (res) =>{
						if (res.tempFilePaths.length > 0) {
							uni.setStorage({
								key: 'avatar',
								data: res.tempFilePaths[0]
							});
							uni.navigateTo({
								url: '/pages/userinfo/avatar'
							});
						}
					}
				});
			},
			/**
			 * 刷新头像
			 * @param {Object} file
			 */
			refreshFile(file) {
				this.$set(this.cateImgs, this.changeIconIndex, file);
				this.$set(this.categoriesData[this.changeIconIndex], 'src', file);
			},
			save() {
				if (this.submit) {
					return;
				}
				this.submit = true;
				//提取修改、新增，删除，由服务器处理
				categoryAdmin('save', {
					data: this.categoriesData
				}, true).then(
					res => {
						this.$api.success('保存成功');
						this.navTimeBack();
					},
					err => {
						this.$api.msg(err.messsage || '保存失败');
						this.submit = false;
					}
				);
			}
		}
	};
</script>

<style lang="scss">
	.container {
		font-size: $font-base;
		padding: 20rpx 30rpx 110rpx;
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
		padding: 20upx 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;

		input {
			font-size: $font-base;
		}
	}

	.specsTitlesBtn {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20upx;
		display: flex;
		justify-content: space-between;
		background: #fff;
		z-index: 10;
	}

	.add-btn {
		flex: 1;
		margin-right: 10upx;
		font-size: $font-base;
		color: #fff;
		background-color: $btn-color-light;
		border-radius: 10upx;

		&.cancel {
			background-color: $btn-color-spec;
		}

		&.small {
			flex: none;
			line-height: 40rpx;
			height: 40rpx;
			font-size: $font-sm;
		}

		&.disable {
			background-color: $font-color-disabled;
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

	.yticon {
		font-size: $font-llg;
	}

	.main {
		position: relative;
		margin-bottom: 26rpx;
	}
</style>
