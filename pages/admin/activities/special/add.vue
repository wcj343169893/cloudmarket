<template>
	<view class="container" :class="[globalAdminClass]">
		<page-header title="新增专题"></page-header>
		<view class="imgs banner" @click="uploadBanner">
			<view class="h-list" v-if="bannerPreview && bannerPreview != ''">
				<view class="h-list-image">
					<image :src="bannerPreview" mode="aspectFill"></image>
				</view>
			</view>
		</view>
		<view class="content">
			<mix-list-input title=" " textAlign="content-left" :defContent="title" field="title" placeholder="请输入标题" @change="changeField"></mix-list-input>
			<mix-list-input type="textarea" title=" " textAlign="content-left" :defContent="description" field="description"
			 placeholder="请输入描述" @change="changeField"></mix-list-input>
			<mix-list-select title="商品样式" :options="goodsTypes" :defaultOption="goodsType" @eventClick="changeGoodsType"></mix-list-select>
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">*开始时间</text>
				<kx-datetime class="cell-tip" :time="beginTime | dateFormat('yyyy-MM-dd hh:mm')" :end="beginTimeEndDate" @rundata="beginTimeChange"
				 :start="beginTimeStartDate" default="start"></kx-datetime>
				<text class="cell-more yticon icon-you"></text>
			</view>
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">*结束时间</text>
				<kx-datetime class="cell-tip" :time="endTime | dateFormat('yyyy-MM-dd hh:mm')" :end="endTimeEndDate" @rundata="endTimeChange"
				 :start="endTimeStartDate" default="start"></kx-datetime>
				<text class="cell-more yticon icon-you"></text>
			</view>
			<!-- 商品 -->
			<view class="mix-list-cell b-b" @click="selectGoods">
				<text class="cell-tit clamp">商品</text>
				<view class="cell-tip">添加</view>
				<text class="cell-more yticon icon-you"></text>
			</view>
			<view class="goods-section" :class="[goodsType]">
				<block v-if="goods.length > 0">
					<view class="goods-box-single" v-for="(goodsItem, index) in goods" :key="index">
						<image class="goods-img" :src="goodsItem.src" mode="aspectFill"></image>
						<view class="right">
							<view class="">
								<text class="title">{{ goodsItem.title }}</text>
							</view>
							<view class="attr-box">
								<text>单价:</text>
								<text class="price">{{ (goodsItem.originPrice > 0 ? goodsItem.originPrice : goodsItem.price) | toFixed }}</text>
								<text>库存:</text>
								<text>{{ goodsItem.stock }}</text>
							</view>
						</view>
						<view class="buttons">
							<button type="warn" class="small" @click="del(index)">删除</button>
						</view>
					</view>
				</block>
				<!-- 沒有商品 -->
				<view v-else class="add_tmp b-b" @click="selectGoods()">
					<text class="yticon icon-jia1"></text>
					<text>请选择商品</text>
				</view>
			</view>
		</view>

		<button class="fixed-add-btn" @click="save">提交保存</button>
	</view>
</template>

<script>
	import {
		uploadFiles,
		dateFormat
	} from '@/common/functions.js';
	import {
		specialAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				_id: "",
				title: "",
				goods: [],
				banners: [],
				banner: "",
				bannerPreview: "",
				description: "",
				beginTime: 0,
				endTime: 0,
				goodsType: "normal",
				goodsTypes: {
					normal: '经典样式',
					grid: '宫格样式'
				},
			}
		},
		onLoad(options) {
			if (!options.isnew) {
				this.loadData()
			}
			this.loadBanners();
		},
		computed: {
			beginTimeStartDate() {
				return dateFormat(false, 'yyyy-MM-dd');
			},
			beginTimeEndDate() {
				return this.getDefaultEndDate();
			},
			endTimeStartDate() {
				if (this.miaosha && this.miaosha.beginTime) {
					return dateFormat(this.miaosha.beginTime, 'yyyy-MM-dd hh:mm');
				}
				return dateFormat(false, 'yyyy-MM-dd');
			},
			endTimeEndDate() {
				return this.getDefaultEndDate();
			}
		},
		methods: {
			async loadBanners() {
				specialAdmin("banners", {}).then(
					res => {
						this.banners = res;
						//默认第一张图
						if (this.bannerPreview == "") {
							this.bannerPreview = res[0]
							this.banner = res[0]
						}
					},
					err => {}
				);
			},
			async loadData() {
				this.getItemData(true);
				specialAdmin("detail", {
					id: this._id,
				}).then(
					res => {
						for (let key in res) {
							if (key != "banner") {
								this[key] = res[key];
							}
						}
						if (res.banner && res.banner != "") {
							this.bannerPreview = res.banner;
							this.banner = res.banner;
						}
					},
					err => {}
				);
			},
			beginTimeChange(e) {
				console.log(e);
				//苹果时间问题
				let d = new Date(e.replace(/-/g, '/'));
				this.beginTime = d.getTime();
			},
			endTimeChange(e) {
				console.log(e);
				//苹果时间问题
				let d = new Date(e.replace(/-/g, '/'));
				this.endTime = d.getTime();
			},
			//获取默认结尾日期
			getDefaultEndDate() {
				let d = new Date();
				d.setFullYear(d.getFullYear() + 1);
				return dateFormat(d, 'yyyy-MM-dd');
			},
			del(index) {
				this.goods.splice(index, 1)
			},
			changeGoodsType(val) {
				console.log('changeGoodsType', val);
				this.goodsType = val;
			},
			//选择一件商品
			selectGoods() {
				let gids = [];
				this.goods.map(g => {
					gids.push(g._id);
				})
				uni.setStorageSync("selectedIds", gids);
				uni.navigateTo({
					url: `/pages/admin/goods/list?type=choosemany&state=special`
				});
			},
			refreshList(data) {
				//商品数组
				this.goods = data;
			},
			//banner横图
			uploadBanner() {
				uploadFiles(
					'goods_banner',
					1,
					srcs => {
						this.bannerPreview = srcs[0];
					},
					srcs => {
						this.banner = srcs[0];
					}
				);
			},
			changeField(val, field) {
				console.log(val, field)
				this[field] = val;
			},
			save() {
				let data = {
					id: this._id,
					title: this.title,
					goods: this.goods,
					banner: this.banner,
					description: this.description,
					beginTime: this.beginTime,
					endTime: this.endTime,
					goodsType: this.goodsType,
				}
				let fields = {
					title: '标题',
					description: '描述',
					beginTime: '开始时间',
					endTime: '结束时间',
				};
				//判断必填项
				if (!this.checkFields(data, fields)) {
					return false;
				}
				if (data.goods.length == 0) {
					this.$api.msg('商品不能为空');
					return false;
				}
				this.$submitData(() => {
					specialAdmin("save", data, true).then(
						res => {
							this.$api.success("保存成功")
							this.navTimeBack(() => {
								this.$api.prePage().refreshList();
							});
						},
						err => {}
					);
				});
			},
			//检查字段是否为空
			checkFields(data, fields) {
				for (let fie in fields) {
					if (typeof data[fie] == 'undefined' || data[fie] == '' || data[fie] == 0) {
						this.$api.msg(fields[fie] + '不能为空');
						return false;
					}
				}
				return true;
			},
		}
	}
</script>

<style lang="scss">
	.container {
		background-color: $background-color;
		padding-bottom: 120rpx;
	}

	.content {
		background: #FFFFFF;
		margin: 0rpx 30rpx;
		border-radius: 20rpx;
		margin-top: -80rpx;
		position: relative;
	}

	.goods-box-single {
		display: flex;
		position: relative;
		padding: 20upx;
		align-items: center;

		.goods-img {
			display: block;
			width: 120upx;
			height: 120upx;
			border-radius: 4%;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 30upx 0 24upx;
			overflow: hidden;

			.title {
				font-size: $font-base;
				color: $font-color-dark;
				line-height: 1;
			}
		}
	}

	.attr-box {
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		padding: 8upx 0upx 0;

		&.notstart {
			color: $base-color;
		}

		&.started {
			color: $font-color-warning;

			.price {
				color: $font-color-warning;
			}
		}

		&.ended {
			text-decoration: line-through;
		}
	}

	.price-box {
		display: flex;
		justify-content: flex-end;
		align-items: baseline;
		padding: 20upx 30upx;
		font-size: $font-sm + 2upx;
		color: $font-color-light;

		.num {
			margin: 0 8upx;
			color: $font-color-dark;
		}
	}

	.sub-title {
		font-size: $font-sm;
		color: $font-color-disabled;
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

	.add_tmp {
		font-size: $font-base;
		text-align: center;
		padding: 40rpx 0;
		position: relative;

		.yticon {
			color: $base-color;
			font-size: $font-sm;
		}
	}

	.submit {
		padding-top: 40rpx;
	}

	.add-btn {
		flex: 1;
		margin: 0 30upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $btn-color-light;
		border-radius: 10upx;
	}

	.goods-section {
		margin-top: 16upx;
		background: #fff;
		padding-bottom: 1px;
		font-size: $font-base;

		.g-header {
			display: flex;
			align-items: center;
			height: 84upx;
			padding: 0 30upx;
			position: relative;
			margin-bottom: 12upx;
		}

		.goods_list {
			width: 80%;
		}

		.scoll-wrapper {
			display: inline-flex;
			align-items: flex-start;
		}

		.total {
			text-align: center;
			font-size: $font-sm;
		}

		.yticon {
			font-size: $font-sm;
		}

		.g-item {
			margin-left: 16upx;

			image {
				border-radius: 4%;
				width: 100upx;
				height: 100upx;
			}
		}

		&.grid {
			display: flex;
			flex-wrap: wrap;
			padding-right: 20rpx;

			.goods-box-single {
				width: 50%;
				padding-right: 0;
				flex-direction: column;

				.goods-img {
					width: 100%;
					height: 300rpx;
				}

				.right {
					padding: 12rpx 0;
					width: 100%;

					.title {
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						display: block;
					}
				}
			}
		}
	}

	.banner {
		.h-list-image {
			image {
				width: 750rpx;
				height: 454rpx;
			}
		}
	}

	.imgs {
		position: relative;
	}
</style>
