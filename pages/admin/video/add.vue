<template>
	<view class="container bg-white" :class="[globalAdminClass]">
		<!-- 商品 -->
		<block v-if="goods.id > 0">
			<view class="goods-box-single b-b">
				<image class="goods-img" :src="goods.src" mode="aspectFill"></image>
				<view class="right">
					<view class="">
						<text class="title clamp">{{ goods.title }}</text>
					</view>
					<view class="sub-title" v-if="goods.subTitle && goods.subTitle != ''">
						<text>{{ goods.subTitle }}</text>
					</view>
					<view class="attr-box">
						<text>单价:</text>
						<text class="price">{{ goods.price }}</text>
						<block v-if="goods.originPrice > 0">
							<text class="price del">{{ goods.originPrice }}</text>
						</block>
						<text>库存:</text>
						<text class="m-r">{{ goods.stock }}</text>
					</view>
				</view>
			</view>
		</block>
		<!-- 沒有商品 -->
		<view v-else class="add_tmp b-b" @click="selectGoods()">
			<text class="yticon icon-jia1"></text>
			<text>请选择1件商品（选填）</text>
		</view>
		<mix-list-select border="b-b" @eventClick="changeType" title="视频来源" :options="videoTypes" :defaultOption="type"></mix-list-select>
		<block v-if="type == 'douyin'">
			<mix-list-input type="textarea" title=" " textAlign="content-left" :defContent="content" field="content" placeholder="请粘贴分享内容"
			 @change="changeContent"></mix-list-input>
			<view class="padding-sm">
				<text>选择视频 --> 分享 --> 复制链接</text>
			</view>
		</block>
		<block v-if="isShowData">
			<mix-list-input title="标题" type="text" :defContent="title" field="title" placeholder="请输入标题" @change="changeField"></mix-list-input>
			<mix-list-input type="text" title="视频地址" :defContent="url" field="url" placeholder="输入地址或者上传" @change="changeField"></mix-list-input>
			<view class="mix-list-cell" @click="uploadVideo">
				<text class="cell-tit clamp">视频文件</text>
				<view class="cell-tip">点击上传</view>
				<text class="cell-more yticon icon-you"></text>
			</view>
			<view class="imgs b-b">
				<view class="h-list" v-if="url">
					<j-video :url="url" :poster="poster" height="220px" width="690rpx"></j-video>
				</view>
			</view>
			<view class="mix-list-cell b-b">
				<cloud-image title="视频封面" tips="点击上传" v-model="poster"></cloud-image>
			</view>
		</block>
		<button class="fixed-add-btn" @click="save">发布</button>
	</view>
</template>

<script>
	import {
		cloudVideo
	} from '@/common/request.js';
	import {
		uploadVideo
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				goods: {},
				type: "douyin",
				videoTypes: {
					normal: '普通',
					douyin: '抖音分享'
				},
				originUrl: "",
				title: "",
				poster: "",
				url: "",
				content: "",
				duration: 0,
				width: 0,
				height: 0,
			};
		},
		onLoad() {
			this.loadData()
		},
		computed: {
			isShowData() {
				if (this.type != "douyin") {
					return true;
				}
				return (this.type == "douyin" && this.loaded)
			}
		},
		methods: {
			loadData() {
				this.goods = this.getItemData();
			},
			changeType(n) {
				this.type = n;
			},
			changeContent(n) {
				cloudVideo("douyin", "getInfo", {
					content: n
				}, true).then(res => {
					console.log(res)
					for (let key in res) {
						this[key] = res[key]
					}
					this.loaded = true;
					this.content = n;
				}, err => {
					this.$api.msg("解析失败")
					console.log("解析失败")
				})
			},
			uploadVideo() {
				uploadVideo(
					'video',
					info => {
						for (let key in info) {
							this[key] = info[key]
						}
					}
				);
			},
			save() {
				let info = {
					goods: this.getObjectProperty(this.goods, ["_id", "id", "shopid", "sku_id", "src", "stock", "subTitle", "title"]),
					type: this.type,
					originUrl: this.originUrl,
					title: this.title,
					poster: this.poster,
					url: this.url,
					shopid: this.adminShopId,
					content: this.content,
					duration: this.duration,
					width: this.width,
					height: this.height,
				};
				let fields = {
					title: '标题',
					url: '视频地址',
					poster: '视频封面'
				};
				//判断必填项
				if (!this.checkFields(info, fields)) {
					this.submiting = false;
					return;
				}
				cloudVideo("info", "save", info, true).then(res => {
					console.log(res)
					this.$api.success("发布成功");
					this.navTimeBack();
				}, err => {
					this.$api.msg("发布失败")
				})
			},
			//选择一件商品
			selectGoods() {
				uni.navigateTo({
					url: `/pages/admin/goods/list?type=chooseone&state=addvideo`
				});
			},
			refreshList(data) {
				this.goods = data;
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding-bottom: 120rpx;
	}

	.goods-box-single {
		display: flex;
		position: relative;
		padding: 20upx;

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
				font-size: $font-base + 2upx;
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

		.more {
			color: $font-color-light;
			margin-left: 8upx;
		}

		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;

			&.content-right {
				text-align: right;
				color: $font-color-light;
			}
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
		}
	}

	.imgs {
		position: relative;
		padding-bottom: 20upx;

		&.b-b:after {
			left: $page-row-spacing;
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
</style>
