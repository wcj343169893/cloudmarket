<template>
	<view class="container">
		<empty v-if="!hasLogin" content="请登录"></empty>
		<block v-else>
			<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}"
				:collection="collectionList" field="user_id,title,content,payload,status,created,goods,page"
				orderby="created desc" where="user_id==$cloudEnv_uid">
				<view v-if="error">{{error.message}}</view>
				<view v-else-if="data && data.length>0">
					<uni-swipe-action>
						<uni-swipe-action-item class="uni-swipe-action-item" v-for="(item,index) in data" :key="index"
							:right-options="options" @click="onClick" @change="swipeChange($event, item._id)">
							<view class="item" @click="handleItemClick(item)">
								<view class="title weui-flex">
									<text>{{item.title}}</text>
									<view class="weui-flex__item">

									</view>
									<text class="yticon icon-you"></text>
								</view>
								<view class="goods" v-if="item.goods">
									<image :src="item.goods.avatar" mode="aspectFill" class="avatar"></image>
									<view class="m-l">
										<text>{{item.goods.title}}</text>
									</view>
								</view>
							</view>
						</uni-swipe-action-item>
					</uni-swipe-action>
					<uni-load-more :status="loading?'loading':(hasMore ? 'more' : 'noMore')"></uni-load-more>
				</view>
				<empty v-else></empty>
			</unicloud-db>
		</block>

	</view>
</template>

<script>
	const db = uniCloud.database()
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				collectionList: "cloud_message",
				loadMore: {
					contentdown: '',
					contentrefresh: '',
					contentnomore: ''
				},
				_id: "",
				swiper: "",
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}]
			}
		},
		computed: {
			...mapState(['hasLogin']),
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			onClick(e) {
				// console.log('点击了' + (e.position === 'left' ? '左侧' : '右侧') + e.content.text + '按钮')
				//直接删除
				this.$refs.udb.remove(this._id, {
					needConfirm: false,
					success: (res) => {}
				})
			},
			swipeChange(e, index) {
				this._id = index;
				console.log('当前状态：' + e + '，下标：' + index)
				setTimeout(() => {
					this.swiper = e;
				}, 100)
			},
			handleItemClick(item) {
				if (this.swiper !== "none") {
					//打开了滑动
					return
				}
				console.log("detail", item)
				if (item.page) {
					uni.navigateTo({
						url: item.page
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 22rpx;
	}

	.item {
		padding: 22rpx;
		background: #fff;
		border-radius: 12rpx;

		.title {
			font-weight: 600;
		}

		.goods {
			display: flex;
			align-items: center;
			background-color: #f4f4f4;
			margin-top: 12rpx;
			font-size: 24rpx;

			.avatar {
				width: 120rpx;
				height: 120rpx;
				margin-right: 12rpx;
			}

			.m-l {
				flex: 1;
			}
		}
	}

	.uni-swipe-action-item {
		margin-bottom: 22rpx;
	}
</style>
