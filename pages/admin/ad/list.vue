<template>
	<view class="container">
		<empty v-if="loaded === true && ads.length === 0"></empty>
		<view v-for="(item, index) in ads" :key="index" class="imgs" @click="detail(item)">
			<view v-if="isEdit" class="yticon icon-xuanzhong2 checkbox" :class="{ checked: item.checked }" @click.stop="check(item)"></view>
			<image :src="item.src" mode="aspectFit"></image>
		</view>
		<uni-load-more :status="loadingType" v-if="loadingType == 'loading'"></uni-load-more>
		<view class="specsTitlesBtn">
			<button class="add-btn cancel" v-if="isEdit" @click="del">删除</button>
			<button class="add-btn" @click="add">新增</button>
		</view>
	</view>
</template>

<script>
import { adsAdmin } from '@/common/admin_request.js';
export default {
	data() {
		return {
			ads: [],
			loadingType: 'loading',
			loaded: false,
			isEdit: false
		};
	},
	onLoad() {
		this.loadData();
	},
	// #ifndef MP
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) {
			this.isEdit = true;
		}
	},
	// #endif
	methods: {
		async loadData() {
			adsAdmin('list', {}).then(
				res => {
					this.loaded = true;
					res.forEach(ele => {
						ele.checked = false;
					});
					this.ads = res;
					this.loadingType = 'noMore';
				},
				err => {
					//暂无数据
					this.loadingType = 'noMore';
					this.loaded = true;
				}
			);
		},
		check(item) {
			item.checked = !item.checked;
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
		del() {
			//删除选中的内容
			let ids = [];

			this.ads.map(e => {
				if (e.checked) {
					ids.push(e._id);
				}
			});
			if (ids.length < 1) {
				this.$api.msg('请选择需要删除的项目');
				return;
			}
			uni.showModal({
				content: '是否确定删除?',
				success: e => {
					if (e.confirm) {
						adsAdmin('delete', {
							ids: ids
						}).then(
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
			this.loadData();
		}
	}
};
</script>

<style lang="scss">
.container {
	padding-bottom: 140rpx;
}
.imgs {
	padding: 20rpx 20rpx 0;
	position: relative;
	image {
		width: 710rpx;
		height: 355rpx;
	}
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
</style>
