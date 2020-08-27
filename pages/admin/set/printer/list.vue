<template>
	<view class="container">
		<empty v-if="loaded && printers.length == 0"></empty>
		<view v-for="(item,index) in printers" :key="index" class="mix-list-cell b-b" hover-class="cell-hover"
		 :hover-stay-time="50">
			<view class="cell-tit">
				<view class="">
					<text>{{item.name}}</text>
					<text class="subname">{{item.machine}}</text>
				</view>
				<view class="">
					<text class="status success" v-if="item.enable">启用</text>
					<text class="status error" v-else>未启用</text>
					<text class="status success" v-if="item.online">运行中</text>
					<text class="status error" v-else>已掉线</text>
				</view>
			</view>
			<view class="cell-more">
				<button class="action-btn" v-if="item.enable" @click="btnEnable(item,false,index)">暂停</button>
				<button class="action-btn recom" v-else @click="btnEnable(item,true,index)">启用</button>
				<button class="action-btn warning" @click="btnDelete(item,index)">删除</button>
			</view>
		</view>
		<view class="specsTitlesBtn">
			<button class="action-btn" @click="navTo('/pages/admin/set/printer/add')">新增</button>
		</view>
	</view>
</template>

<script>
	import {
		printerAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				shopCacheKey: "adminShopInfo",
				printers: []
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				let info = uni.getStorageSync(this.shopCacheKey);
				this.printers = info.printers;
				this.loaded = true;
				printerAdmin("checkStatus",{}).then(res=>{
					console.log(res)
					this.printers = res;
				});
			},
			btnEnable(item, enable, index) {
				item.enable = enable;
				this.save({
					index: index,
					info: item
				})
			},
			btnDelete(item, index) {
				printerAdmin("delete", item).then(res => {
					this.$api.success("删除成功");
					this.printers.splice(index, 1);
				}, err => {
					this.$api.msg("修改失败");
				});
			},
			save(data) {
				printerAdmin("save", data).then(res => {
					this.$api.success("修改成功");
					this.updateCache();
					this.$api.prePage().refreshList();
				}, err => {
					this.$api.msg("修改失败");
				})
			},
			refreshList(data) {
				this.printers.push(data);
				this.updateCache();
			},
			updateCache() {
				let info = uni.getStorageSync(this.shopCacheKey);
				info.printers = this.printers;
				uni.setStorage({
					key: this.shopCacheKey,
					data: info
				})
			}
		}
	}
</script>


<style lang="scss" scoped>
	.icon .mix-list-cell.b-b:after {
		left: 90upx;
	}

	.mix-list-cell {
		display: flex;
		align-items: baseline;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;
		justify-content: space-between;

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
			display: flex;
		}

		.cell-tit {
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 20upx;
			line-height: 1.2;

			.subname {
				font-size: 0.8em;
				margin-left: 20rpx;
				color: $font-color-light;
			}
		}

		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;
			display: flex;
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
		}
	}

	.m-r {
		margin-right: 16upx;
	}

	.action-btn {
		margin: 0;
		padding: 0 30upx;
		margin-left: 24upx;
		text-align: center;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		background: #fff;
		border-radius: 10upx;

		.time {
			width: 72upx;
			display: inline-block;
		}

		&:after {
			border-radius: 10px;
		}

		&.recom {
			background: $base-color;
			color: #fff;
		}

		&.warning {
			background: $btn-color-warning;
			color: #fff;
		}
	}

	.cell-more {
		.action-btn {
			height: 60upx;
			line-height: 60upx;
		}
	}

	.specsTitlesBtn {
		position: fixed;
		bottom: 0;
		width: 100%;
		left: 0;
		display: flex;
		padding: 10upx 30upx 30upx;
		background-color: #ffffff;
		justify-content: space-between;

		.action-btn {
			flex: 1;
			margin: 0 30rpx;
			background-color: $btn-color-light;
			color: #FFFFFF;
		}
	}

	.status {
		font-size: $font-sm;
		margin-right: 20rpx;

		&.error {
			color: $font-color-warning;
		}

		&.success {
			color: $font-color-emphasis;
		}
	}
</style>
