<template>
	<view class="avatar-container">
		<view class="mix-list-cell bg-white" :class="[border,size]" @click="changeAvatar" hover-class="cell-hover"
		 :hover-stay-time="50">
			<text class="cell-tit">{{title}}</text>
			<view class="cell-content"></view>
			<image v-if="defContent" class="portrait" :src="defContent" mode="aspectFill"></image>
			<view v-else class="portrait bg-gray">
			</view>
		</view>
	</view>
</template>

<script>
	import {
		uploadFiles
	} from '@/common/functions.js';
	export default {
		data() {
			return {

			};
		},
		props: {
			title: {
				type: String,
				default: '标题'
			},
			field: {
				type: String,
				default: ''
			},
			border: {
				type: String,
				default: 'b-b'
			},
			size: {
				type: String,
				default: ''
			},
			needCut: {
				type: Boolean,
				default: true
			},
			count: {
				type: Number,
				default: 1
			},
			defContent: {
				type: [String, Number],
				default: ''
			}
		},
		methods: {
			changeAvatar() {
				if (this.needCut) {
					uni.chooseImage({
						count: this.count, //默认9
						sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
						sourceType: ['album', 'camera'], //从相册选择
						success: (res) => {
							console.log(res);
							if (res.tempFilePaths.length > 0) {
								uni.setStorage({
									key: 'avatar',
									data: res.tempFilePaths[0]
								});
								uni.setStorage({
									key: 'avatarField',
									data: this.field
								});
								uni.navigateTo({
									url: '/pages/userinfo/avatar'
								});
							}
						}
					});
				} else {
					uploadFiles(this.field, this.count, (src) => {
						if(this.count == 1){
							this.$emit('change', src[0], this.field);
						}else{
							this.$emit('change', src, this.field);
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.avatar-container {
		.mix-list-cell {
			display: flex;
			align-items: center;
			padding: 20upx $page-row-spacing;
			line-height: 60upx;
			position: relative;

			&.b-b:after {
				left: 30upx;
			}

			&.cell-hover {
				background: #fafafa;
			}

			.cell-tit {
				font-size: $font-base;
				color: $font-color-dark;
				margin-right: 20upx;
			}

			.cell-content {
				flex: 1;
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				text-align: right;
				&.content-left {
					text-align: left;
				}

			}
		}

		.portrait {
			width: 60rpx;
			height: 60rpx;
			border-radius: 8rpx;
		}

		.lg {
			line-height: 100rpx;

			.portrait {
				width: 100rpx;
				height: 100rpx;
			}
		}

		.xlg {
			line-height: 140rpx;

			.portrait {
				width: 140rpx;
				height: 140rpx;
			}
		}
	}
</style>
