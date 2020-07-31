<template>
	<view class="container">
		<image :src="imgsPreview" mode="aspectFill"></image>
		<view class="select-imgs" @click="chooseImg"><text>点击选择一张图片,750*375</text></view>
		<mix-list-select border="b-b" @eventClick="changeRedirectType" title="点击跳转" :options="redirectTypes" :defaultOption="rtDef"></mix-list-select>
		<mix-list-input v-if="redirectType == 'web'" :isMust="!0" title="网站地址" placeholder="请输入网站地址" @change="changeUrl"></mix-list-input>
		<mix-list-cell v-else-if="redirectType == 'goods'" title="跳转商品" :tips="goods.title" @eventClick="navToGoods()"></mix-list-cell>
		<mix-list-cell v-else-if="redirectType == 'docs'" title="跳转文档" :tips="docs.title" @eventClick="navToDocs()"></mix-list-cell>
		<mix-list-input title="背景颜色" :defContent="background" :isMust="!0" placeholder="例如:#54b85d" @change="changeBgcolor"></mix-list-input>
		<view class="specsTitlesBtn"><button class="add-btn" @click="save">提交保存</button></view>
	</view>
</template>

<script>
import { uploadFiles } from '@/common/functions.js';
import { adsAdmin } from '@/common/admin_request.js';
export default {
	data() {
		return {
			type: 'add',
			_id: '',
			imgsPreview: '',
			info: {},
			redirectType: 'none',
			redirectTypes: {
				none: '不跳转',
				goods: '商品详情页面',
				web: 'http网站',
				docs: '文档详情页'
			},
			rtDef: 'none',
			url: '',
			background: '',
			goods: {},
			docs: {},
			src: '',
			submiting: false
		};
	},
	onLoad(options) {
		if (options.type) {
			this.type = options.type;
			this.loadData();
			uni.setNavigationBarTitle({
				title: '修改广告图'
			});
		}
	},
	methods: {
		async loadData() {
			let data = uni.getStorageSync('adData');
			for (let field in data) {
				this[field] = data[field];
			}
			console.log(data);
			this.imgsPreview = this.src;
			this.rtDef = this.redirectType;
		},
		changeRedirectType(e) {
			this.redirectType = e;
		},
		chooseImg() {
			uploadFiles(
				'ad_imgs',
				1,
				srcs => {
					this.imgsPreview = srcs[0];
				},
				srcs => {
					this.src = srcs[0];
				}
			);
		},
		navToGoods() {
			uni.navigateTo({
				url: `/pages/admin/goods/list?type=chooseone`
			});
		},
		navToDocs() {
			uni.navigateTo({
				url: `/pages/admin/docs/list?type=chooseone`
			});
		},
		changeUrl(url) {
			this.url = url;
		},
		changeBgcolor(e) {
			this.background = e;
		},
		save() {
			if (this.submiting) {
				return;
			}
			this.submiting = true;
			adsAdmin('add', {
				_id: this._id,
				src: this.src,
				url: this.url,
				goods: this.goods,
				redirectType: this.redirectType,
				docs: this.docs,
				background: this.background
			}).then(
				res => {
					this.$api.msg('提交成功', 2000, true, 'success');
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);
					this.$api.prePage().refreshList();
				},
				err => {
					this.submiting = false;
					this.$api.msg(err.message || '提交失败');
				}
			);
		},
		refreshList(data, type) {
			if (type == 'goods') {
				this.goods = data;
			} else if (type == 'docs') {
				this.docs = data;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.container {
	image {
		width: 750rpx;
		height: 375rpx;
	}
}
.m-r {
	margin-right: 8upx;
}
.m-lr {
	margin: 0 8upx 0;
}
.mix-list-cell {
	display: flex;
	align-items: baseline;
	align-items: center;
	padding: 20upx $page-row-spacing;
	line-height: 60upx;
	position: relative;
	&.imgs {
		padding-bottom: 0;
	}
	&.cell-hover {
		background: #fafafa;
	}
	&.b-b:after {
		left: 30upx;
	}

	.cell-icon {
		align-self: center;
		width: 56upx;
		max-height: 60upx;
		font-size: 38upx;
	}
	.cell-more {
		align-self: center;
		font-size: 30upx;
		color: $font-color-base;
		margin-left: $uni-spacing-row-sm;
	}
	.cell-tit {
		font-size: $font-base;
		color: $font-color-dark;
		margin-right: 20upx;
	}
	.cell-content {
		flex: 1;
		font-size: $font-sm + 2upx;
		&.content-right {
			text-align: right;
		}
	}
	.cell-tip {
		flex: 1;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		text-align: right;
	}
}
.select-imgs {
	text-align: center;
	font-size: $font-base;
	padding: 120rpx 0 0;
	position: absolute;
	top: 0;
	width: 100%;
	height: 375rpx;
	background: #ffffff70;
}
.specsTitlesBtn {
	display: flex;
	padding: 10upx 30upx 30upx;
	&.submit {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 98;
		background: #ffffff;
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
</style>
