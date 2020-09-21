import {
	mapMutations
} from 'vuex';
export default {
	computed: {
		cartCount() {
			return this.$store.state.cartCount;
		}
	},
	watch: {
		cartCount(count) {
			this.resetTabCartCount();
			console.log("watch mixin cartCount")
		}
	},
	onShow() {
		this.resetTabCartCount();
		console.log("onShow mixin")
	},
	methods: {
		...mapMutations(['updateCartNumber', 'incrCartNumber']),
		resetTabCartCount() {
			console.log("this.cartCount", this.cartCount)
			if (this.cartCount > 0) {
				uni.setTabBarBadge({
					index: 2,
					text: '' + this.cartCount
				})
			} else {
				uni.removeTabBarBadge({
					index: 2
				})
			}
		}
	}
}
