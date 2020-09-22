<template>
	<view class="container">
		<empty v-if="loaded === true && docs.length === 0"></empty>
		<view class="titleNview-placing"></view>
		<view v-for="(item, index) in docs" :key="index" class="docs b-b" @click="detail(item)">
			<text class="content">{{ item.numb }}.{{ item.title }}</text>
			<view class="buttons">
				<button class="btn danger" @click.stop="del(item._id)">删除</button>
				<button class="btn" @click.stop="preview(item._id)">预览</button>
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
	import searchMixin from '../mixin/search.js'
	export default {
		mixins: [searchMixin],
		data() {
			return {
				type: 'normal',
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
			this.loadData();
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		// #ifndef MP
		//点击导航栏 buttons 时触发
		onNavigationBarButtonTap(e) {
			const index = e.index;
			if (index === 0) {
				this.isEdit = !this.isEdit;
			}
		},
		// #endif
		methods: {
			async loadData() {
				this.page++;
				docsAdmin('list', {
					page: this.page,
					key:this.searchWord,
					limit: this.limit
				}).then(
					res => {
						res.forEach((ele, ind) => {
							ele.numb = (this.page - 1) * this.limit + ind + 1;
						});
						this.docs = res;
						this.loadingType = 'noMore';
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
			refreshList() {
				this.page = 0;
				this.docs = [];
				this.loadData();
			}
		}
	};
</script>

<style lang="scss">
	.container {
		padding-bottom: 140rpx;
	}

	.docs {
		padding: 20rpx;
		position: relative;
		font-size: $font-base;

		.btn {
			margin: 0 30upx;
			font-size: $font-sm;
			color: #fff;
			background-color: $btn-color-light;
			border-radius: 10upx;
			height: 60rpx;
			line-height: 60rpx;

			&.danger {
				background-color: $btn-color-warning;
			}
		}
	}

	.content {
		flex: 1;
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
