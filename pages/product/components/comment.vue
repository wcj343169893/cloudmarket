<template>
	<view class="comment">
		<view class="comment-tags">
			<view v-for="(item,index) in commentTagStatics" :key="index" class="comment-tags-item" v-if="index<tagCount">
				<text>{{item.name}}</text>
				<text class="number">{{item.count}}</text>
			</view>
		</view>
		<view class="comment-tag-more" v-if="isShowMoreTag && commentTagStatics.length > showTagCount" @click="btnShowMore()">
			<view v-if="!showMore" class="comment-tag-more-item">
				<text>展开</text><text class="yticon icon-xia"></text>
			</view>
			<view v-else class="comment-tag-more-item">
				<text>收起</text><text class="yticon icon-shang"></text>
			</view>
		</view>
		<view v-for="(item,index) in comment" :key="index">
			<view class="comment-user">
				<image :src="item.user.avatar" mode="aspectFill" class="avatar"></image>
				<view class="info">
					<view class="nickname">
						<text>{{item.user.nickname}}</text>
						<view class="star" v-if="item.star > goodStar">
							<text class="yticon icon-dianzan-ash"></text>
							<text>好评</text>
						</view>
					</view>
					<text class="time">{{item.created | dateFormat('yyyy-MM-dd')}}</text>
				</view>
			</view>
			<view class="comment-content" :class="{'b-b':index<comment.length-1}">
				<view class="tags">
					<block v-for="(tg,tindex) in item.tags" :key="tindex">
						<text class="tg">{{tg}}</text>
						<text v-if="tindex<item.tags.length-1" class="tg">|</text>
					</block>
				</view>
				<text class="content">{{item.content}}</text>
				<text class="content reply" v-if="item.reply">客服回复：{{item.reply}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				goodStar: 2,
				showMore: false,
				tagCount: 0
			};
		},
		props: {
			commentTagStatics: {
				type: Array,
				default: []
			},
			comment: {
				type: Array,
				default: []
			},
			showTagCount: {
				type: Number,
				default: 6
			},
			isShowMoreTag: {
				type: Boolean,
				default: false
			}
		},
		created() {
			this.tagCount = this.showTagCount;
		},
		methods: {
			btnShowMore() {
				this.showMore = !this.showMore;
				if (this.showMore) {
					this.tagCount = this.commentTagStatics.length
				} else {
					this.tagCount = this.showTagCount;
				}
				console.log(this.showMore)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.number {
		font-size: $font-sm;
		color: $font-color-light;
		margin-left: 8rpx;
	}

	.comment-tags {
		font-size: $font-sm;
		display: flex;
		flex-wrap: wrap;
		transition: 0.5s;

		.comment-tags-item {
			margin-right: 12rpx;
			background: $border-color-light;
			padding: 6rpx 20rpx;
			border-radius: 18rpx;
			margin-bottom: 12rpx;
		}
	}

	.comment-user {
		margin-top: 20rpx;
		font-size: $font-sm;
		color: $font-color-light;
		display: flex;
		position: relative;
		padding-bottom: 8rpx;
		align-items: center;

		.avatar {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		.info {
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		.nickname {
			color: $font-color-dark;
			font-weight: 500;
			display: flex;
			justify-content: space-between;

			.star {
				color: $uni-color-warning;
				font-size: $font-ssm;
				display: flex;
				align-items: center;
			}
		}

		.time {
			font-size: $font-ssm;
		}
	}

	.comment-content {
		position: relative;
		font-size: $font-sm;
		padding-bottom: 20rpx;
		display: flex;
		flex-direction: column;

		.content {
			color: $font-color-dark;
		}

		.reply {
			background-color: $background-color;
			padding: 12rpx 20rpx;
			border-radius: 12rpx;
			margin-top: 8rpx;
		}


	}

	.tags {
		color: $font-color-light;
		margin-top: 0;

		.tg {
			margin-right: 12rpx;
			font-size: $font-ssm;
		}
	}

	.comment-tag-more {
		color: $font-color-light;
		font-size: $font-sm;
		padding-top: 12rpx;

		.comment-tag-more-item {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.yticon {
			transition: unset;
		}
		.icon-xia{
			padding-top: 12rpx;
		}
	}
</style>
