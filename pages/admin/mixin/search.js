export default {
	data() {
		return {
			searchWord: ""
		}
	},
	computed: {
		statusBarHeight() {
			return this.systemInfo.statusBarHeight;
		},
		navigationBarHeight() {
			return this.systemInfo.navigationBarHeight;
		}
	},
	// #ifndef MP
	onNavigationBarSearchInputClicked: async function(e) {
		console.log('搜索');
		this.navToSearch();
	},
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		if (e.index === 0) {
			this.navToSearch();
		}
	},
	// #endif
	//滑到底部加载更多
	onReachBottom() {
		if (this.loadingType != 'noMore') {
			this.loadData();
		}
	},
	methods: {
		refreshList() {

		},
		navToSearch() {
			uni.navigateTo({
				url: `/pages/admin/search?key=${this.searchWord}`
			});
		},
		reSearch(key) {
			this.searchWord = key;
			this.refreshList();
			// #ifdef APP-PLUS
			var webView = this.$mp.page.$getAppWebview();
			var tn = webView.getStyle().titleNView;
			//tn.searchInput.placeholder = key;

			webView.setStyle({
				titleNView: tn
			});
			// #endif
		}
	}
}
