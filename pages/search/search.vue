<template>
	<view class="container">
		<mehaotian-search :isAutoFocus="!0" @search="search($event)" @canceled="cancel" :placeholder="placeholder"></mehaotian-search>
		<view class="content">
			<block v-if="historyWords && historyWords.length > 0">
				<view class="title">
					<text>历史搜索</text>
					<text class="yticon icon-iconfontshanchu1" @click="clean()"></text>
				</view>
				<view class="weui-flex">
					<block v-for="(item, index) in historyWords" :key="index">
						<text class="words" @click="search(item)">{{ item }}</text>
					</block>
				</view>
			</block>
			<block v-if="searchKeyWords && searchKeyWords.length > 0">
				<view class="title m-t"><text>搜索发现</text></view>
				<view class="weui-flex">
					<block v-for="(item, index) in searchKeyWords" :key="index">
						<text class="words" @click="search(item)">{{ item }}</text>
					</block>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			placeholder: '',
			comefrom: null,
			historyWords: [],
			searchKeyWords: [],
			historyKey: 'searchHistory'
		};
	},
	onLoad(options) {
		if (options.comefrom) {
			this.comefrom = options.comefrom;
		}
		if (options.key) {
			this.placeholder = options.key;
		}
		this.loadData();
	},
	methods: {
		async loadData() {
			//最多显示50条
			let words = uni.getStorageSync(this.historyKey);
			if(!words){
				words=[];
			}
			this.historyWords = words.slice(0,50);
			this.searchKeyWords = uni.getStorageSync('shopSearchGoodsKeywords');
		},
		search(e) {
			console.log(e);
			let data = uni.getStorageSync(this.historyKey);
			if (!data) {
				data = [];
			}
			//如果已经存在，则需要移除
			let data2 = [e];
			data.map(ele => {
				if (ele != e) {
					data2.push(ele);
				}
			});
			uni.setStorage({
				key: this.historyKey,
				data: data2
			});
			//记录历史
			if (this.comefrom && this.comefrom == 'searchresult') {
				this.$api.prePage().reSearch(e);
				uni.navigateBack({
					delta: 1
				});
			} else {
				uni.redirectTo({
					url: `/pages/search/goods?key=${e}`
				});
			}
		},
		//清空搜索记录
		clean() {
			uni.removeStorage({
				key: this.historyKey
			});
			this.historyWords = [];
		},
		//取消搜索，返回上一页
		cancel() {
			uni.navigateBack({
				delta: 1
			});
		}
	}
};
</script>

<style lang="scss">
.container {
	font-size: $font-base;
	padding-top: var(--status-bar-height);
	//#ifdef MP
	padding-top: calc(var(--status-bar-height) + 120upx);
	//#endif
}
.content {
	padding: 20upx;
}
.title {
	font-size: $font-lg;
	padding-bottom: 10upx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.weui-flex {
	display: flex;
	flex-wrap: wrap;
}
.words {
	padding: 8upx 18upx;
	background-color: #f5f5f5;
	margin-right: 16upx;
	border-radius: 8upx;
	color: #888;
}
.m-t {
	margin-top: 30upx;
}
</style>
