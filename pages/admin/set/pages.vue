<template>
	<view class="container">
		<view v-for="(item,index) in settings" :key="index" class="item b-b">
			<view class="header">
				<text>{{item.name}}</text>
			</view>
			<view class="content-limits" v-if="item.limits">
				<view class="title">
					<text>查询数量</text>
				</view>
				<view class="form">
					<view v-for="(item1,index1) in item.limits" :key="index1" class="fields b-b">
						<text>{{index1}}</text>
						<input type="number" class="input" v-model="item.limits[index1]" />
					</view>
				</view>
			</view>
			<view class="content-limits" v-if="item.titles">
				<view class="title">
					<text>标题设置</text>
				</view>
				<view class="form">
					<view v-for="(item1,index1) in item.titles" :key="index1" class="fields b-b">
						<text>{{index1}}</text>
						<input type="text" class="input" v-model="item.titles[index1]" />
					</view>
				</view>
			</view>
		</view>
		<view class="specsTitlesBtn">
			<button class="add-btn cancel" @click="cancel">取消</button>
			<button class="add-btn" @click="save">保存</button>
		</view>
	</view>
</template>

<script>
	import {
		shopAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				cacheKey: "adminShopInfo",
				settings: {
					"home": {
						"name": "首页",
						"limits": {
							"ads": 5,
							adBanners: 5,
							"category": 10,
							"miaosha": 2,
							"newest": 10,
							"tuangou": 3,
							"yuding": 4,
							"recommend": 4
						},
						"titles": {
							"miaosha": "限时抢购",
							"newest": "鲜货排行",
							"tuangou": "限时团购",
							"yuding": "限时预定",
							"recommend": "精品推荐",
						}
					}
				},
				shopinfo: {}
			};
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			async loadData() {
				this.shopinfo = uni.getStorageSync(this.cacheKey);
				if (this.shopinfo.pages) {
					for (let pg in this.shopinfo.pages) {
						for (let key in this.shopinfo.pages[pg]) {
							if (typeof(this.shopinfo.pages[pg][key]) == "object") {
								Object.assign(this.settings[pg][key], this.shopinfo.pages[pg][key]);
							} else {
								this.settings[pg][key] = this.shopinfo.pages[pg][key];
							}
						}
					}
				}
				//this.settings = Object.assign(this.settings, this.shopinfo.pages);
				console.log(JSON.stringify(this.settings))
			},
			save() {
				if (this.isSubmit) {
					return;
				}
				this.isSubmit = true;
				//处理limits为数字
				let setting = this.settings;
				for (let main in setting) {
					for (let key in setting[main]) {
						if (key == "limits") {
							for (let key1 in setting[main][key]) {
								setting[main][key][key1] = Number(setting[main][key][key1]);
							}
						}
					}
				}
				console.log(JSON.stringify(setting))
				shopAdmin("save", {
					pages: setting
				}, true).then(res => {
					this.$api.success("修改成功");
					this.shopinfo.pages = setting;
					this.navTimeBack();
					uni.setStorage({
						key: this.cacheKey,
						data: this.shopinfo
					})
				}, err => {
					this.$api.msg("修改失败");
					this.isSubmit = false;
				})
			},
			cancel() {
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style lang="scss">
	page,
	.container {
		background: $background-color;
	}

	.item {
		position: relative;
		padding-bottom: 20rpx;
	}

	.header {
		padding: 20rpx 10rpx 0;
	}

	.content-limits {
		padding: 20rpx $page-row-spacing 0;
		font-size: $font-base;
	}

	.title {
		padding-bottom: 16rpx;
	}

	.form {
		background: #FFFFFF;
		border-radius: 10rpx;
	}

	.fields {
		font-size: $font-sm;
		display: flex;
		padding: 20rpx $page-row-spacing;
		position: relative;
		color: $font-color-light;

		&::after {
			left: 20rpx;
		}

		.input {
			flex: 1;
			text-align: right;
			font-size: $font-sm;
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
</style>
