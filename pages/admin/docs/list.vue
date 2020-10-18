<template>
	<view class="container">
		<view v-for="(docs,index1) in dataList" :key="index1" v-if="docs.data.length > 0">
			<view class="header">
				<text>{{docs.name}}</text>
			</view>
			<view class="content">
				<view v-for="(item, index) in docs.data" :key="index" class="docs b-b" @click="detail(item)">
					<text class="title">{{ index+1 }}.{{ item.title }}</text>
					<view class="pagelink" v-if="item.pageLink">
						<text>{{item.pageLink}}</text>
					</view>
					<view class="buttons">
						<button class="btn danger" @click.stop="del(item._id)">删除</button>
						<button class="btn" @click.stop="preview(item._id)">预览</button>
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
		docsAdmin
	} from '@/common/admin_request.js';
	import {
		navToDocPage
	} from '@/common/functions.js';
	import searchMixin from '../mixin/search.js';
	import docType from '../mixin/docType.js';
	export default {
		mixins: [searchMixin, docType],
		data() {
			return {
				type: 'normal',
				dataList: {},
				docs: [],
				loadingType: 'loading',
				page: 0,
				limit: 10,
				loaded: false,
				isEdit: false
			};
		},
		onLoad(options) {
			if (options.type && options.type == 'chooseone') {
				this.type = options.type;
				uni.setNavigationBarTitle({
					title: '选择文档'
				});
			}
			this.initData();
			this.loadData();
		},
		methods: {
			initData() {
				for (let key in this.types) {
					this.$set(this.dataList, key, {
						name: this.types[key],
						data: []
					})
				}
			},
			async loadData() {
				this.page++;
				docsAdmin('list', {
					page: this.page,
					key: this.searchWord,
					limit: this.limit
				}).then(
					res => {
						res.forEach((ele, ind) => {
							this.dataList[ele.type].data.push(ele);
						});
						//this.docs = res;
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
			check(item) {
				item.checked = !item.checked;
			},
			detail(item) {
				if (this.type == "chooseone") {
					//选中数据，并传递个上一个界面
					this.$api.prePage().refreshList(item, "docs");
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 500);
					return;
				}
				uni.navigateTo({
					url: `/pages/admin/docs/add?type=edit&id=${item._id}`
				});
			},
			del(id) {
				//删除选中的内容
				let ids = [id];
				uni.showModal({
					content: '是否确定删除?',
					success: e => {
						if (e.confirm) {
							docsAdmin('delete', {
								ids: ids
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
					url: `/pages/admin/docs/add`
				});
			},
			preview(id) {
				navToDocPage(id)
			},
			copy(item) {
				docsAdmin('copy', {
					_id: item._id,
				},true).then(res => {
					this.$api.success("复制成功")
					let ele = { ...item,
						_id: res.id
					}
					this.dataList[item.type].data.push(ele);
				});
			},
			refreshList() {
				this.page = 0;
				this.docs = [];
				for (let key in this.dataList) {
					this.dataList[key].data = []
				}
				this.loadData();
			}
		}
	};
</script>

<style lang="scss">
	page,
	.container {
		background: $background-color;
	}

	.container {
		padding-bottom: 140rpx;
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


	.icon-xuanzhong2 {
		font-size: 40rpx;
		margin-right: 20rpx;
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

	.titleNview-placing {
		height: var(--status-bar-height);
		padding-top: 88rpx;
		box-sizing: content-box;
	}
</style>
