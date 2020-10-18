<template>
	<view class="container">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view v-for="(docs,index1) in dataList" :key="index1" v-if="docs.data.length > 0">
			<view class="header">
				<text>{{docs.name}}</text>
			</view>
			<view class="content">
				<view v-for="(item, index) in docs.data" :key="index" class="docs b-b" @click="detail(item)">
					<image class="image" :style="docs.style" :src="item.src" mode="aspectFit"></image>
					<view class="buttons">
						<button class="btn danger" @click.stop="del(item._id)">删除</button>
						<button class="btn" @click.stop="preview(item)">预览</button>
						<button class="btn" @click.stop="copy(item)">复制</button>
						<button class="btn">修改</button>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType" v-if="loadingType == 'loading'"></uni-load-more>
		<view class="specsTitlesBtn">
			<button class="add-btn" @click="add">新增</button>
		</view>
	</view>
</template>

<script>
	import {
		adsAdmin
	} from '@/common/admin_request.js';
	import {
		navToAdDetail,
	} from '@/common/functions.js';
	import adPosition from '../mixin/adPosition.js';
	export default {
		mixins: [adPosition],
		data() {
			return {
				dataList: {}
			};
		},
		onLoad() {
			this.initData();
			this.loadData();
		},
		methods: {
			initData() {
				for (let key in this.types) {
					let size = this.typeSies[key];
					let docWidth=670;
					let width=docWidth;
					let height=docWidth/size.width*size.height;
					this.$set(this.dataList, key, {
						style:`width:${width}rpx;height:${height}rpx`,
						name: this.types[key],
						data: []
					})
				}
			},
			async loadData() {
				this.page++;
				adsAdmin('list', {
					page: this.page,
					limit: this.limit
				}, false).then(
					res => {
						/* this.loaded = true;
						res.forEach(ele => {
							ele.checked = false;
						});
						this.ads = this.ads.concat(res); */
						res.forEach((ele, ind) => {
							if (!ele.type) {
								ele.type = "home_swiper";
							}
							this.dataList[ele.type].data.push(ele);
						});
						if (res.length < this.limit) {
							this.loadingType = 'noMore';
						}
					},
					err => {
						//暂无数据
						this.loadingType = 'noMore';
					}
				).finally(() => {
					console.log('finally');
					this.loaded = true;
				});
			},
			detail(item) {
				uni.setStorage({
					key: 'adData',
					data: item,
					success: () => {
						uni.navigateTo({
							url: `/pages/admin/ad/add?type=edit`
						});
					}
				});
			},
			copy(item){
				adsAdmin('copy', {
					_id: item._id,
				},true).then(res => {
					this.$api.success("复制成功")
					let ele = { ...item,
						_id: res.id
					}
					this.dataList[item.type].data.push(ele);
				});
			},
			preview(item) {
				navToAdDetail(item)
			},
			del(id) {
				uni.showModal({
					content: '是否确定删除?',
					success: e => {
						if (e.confirm) {
							adsAdmin('delete', {
								ids: [id]
							}, true).then(
								res => {
									this.$api.msg('删除成功', 2000, true, 'success');
									this.refreshList();
								},
								err => {
									this.$api.msg(err.message || '提交失败');
								}
							);
						}
					}
				});
			},
			add() {
				uni.navigateTo({
					url: `/pages/admin/ad/add`
				});
			},
			refreshList() {
				this.initData();
				this.page = 0;
				this.loadData();
			}
		}
	};
</script>

<style lang="scss">
	.container {
		padding-top: 20rpx;
		padding-bottom: 140rpx;
		background: $background-color;
	}

	.image {
		width: 670rpx;
		height: 340rpx;
	}

	.icon-xuanzhong2 {
		position: absolute;
		left: 20rpx;
		top: 20rpx;
		z-index: 99;
		font-size: 40rpx;
	}

	.specsTitlesBtn {
		position: fixed;
		bottom: 0;
		width: 100%;
		left: 0;
		display: flex;
		padding: 10upx 30upx 30upx;
		background-color: #ffffff;
		z-index: 10;
	}

	.header {
		margin: 10rpx 10rpx 0;
		font-size: $font-base;
	}

	.content {
		background: #FFFFFF;
		margin: 20rpx;
		border-radius: 10rpx;
	}

	.docs {
		padding: 20rpx;
		position: relative;
		font-size: $font-sm;

		.btn {
			margin: 0 10upx;
			font-size: $font-sm;
			color: #fff;
			background-color: $btn-color-light;
			border-radius: 10upx;
			height: 50rpx;
			line-height: 50rpx;

			&.danger {
				background-color: $btn-color-warning;
			}
		}

		.title {
			flex: 1;
		}
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

	.add-btn {
		flex: 1;
		margin: 0 30upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $btn-color-light;
		border-radius: 10upx;

		&.cancel {
			background-color: $btn-color-warning;
		}
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 16rpx;
	}
</style>
