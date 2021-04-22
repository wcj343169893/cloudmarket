export default {
	data() {
		return {
			page: 0, //页码
			limit: 10, //每页加载数据量
			loadingType: "loading", //0加载前 1加载中 2没有更多
			isLoading: false, //刷新数据
			loaded: false, //加载完毕
			isSubmit: false, //是否正在提交数据
			share: {}, //分享内容
			itemDataKey: "navigateToItemData"
		}
	},
	computed: {
		isLogin() {
			return this.$store.state.hasLogin;
		},
		shopId() {
			if (this.shopid) {
				return this.shopid;
			}
			return this.$store.state.shopId;
		},
		adminShopId() {
			return this.$store.state.adminShopId;
		},
		globalClass() {
			return this.$store.state.globalClass;
		},
		globalAdminClass() {
			return this.$store.state.globalAdminClass;
		}
	},
	methods: {
		log(data) {
			console.log(JSON.parse(JSON.stringify(data)))
		},

		/**
		 * navigatorTo跳转页面
		 * @param {String} url
		 * @param {Boolean} checkLogin 是否检测登录  
		 */
		navTo(url, checkLogin) {
			this.$finishSubmit();
			if (!url) {
				return;
			}
			if (checkLogin && !this.$store.state.hasLogin) {
				this.navToLogin();
				return;
			}
			uni.navigateTo({
				url
			})
		},
		navToLoginNotice() {
			uni.showModal({
				title: "温馨提示",
				content: '您还未登录，请登录后再操作',
				cancelText: '再逛逛',
				confirmText: '去登录',
				success: (res) => {
					if (res.confirm) {
						this.navToLogin();
					}
				}
			});
		},
		navToLogin() {
			uni.navigateTo({
				url: "/pages/public/login"
			})
		},
		/**
		 * 传递数据到下一个页面
		 * @param {Object} url
		 * @param {Object} item
		 */
		navToItem(url, item, checkLogin) {
			if (checkLogin && !this.$store.state.hasLogin) {
				url = "/pages/public/login";
			}
			this.$submitData(() => {
				if (item) {
					uni.setStorageSync(this.itemDataKey, item);
				} else {
					uni.removeStorage({
						key: this.itemDataKey
					})
				}
				this.navTo(url);
			});
		},
		navToLoad(url) {
			uni.navigateTo({
				url,
				events: {
					refreshData: () => {
						this.page = 0;
						this.loadData()
					}
				}
			})
		},
		navTimeBack(fn) {
			setTimeout(() => {
				uni.navigateBack({})
				if (fn) {
					fn();
				}
			}, 1500);
		},
		/**
		 * 获取上一个页面传过来的数据,对象是最好的，不要来数组
		 * @param {Boolean} isAutoSet 是否设置到data数据中
		 */
		getItemData(isAutoSet) {
			let data = uni.getStorageSync(this.itemDataKey);
			if (isAutoSet && data) {
				//数组不允许设置
				//console.log(typeof(data))
				if (typeof(data) == "array") {
					return data;
				}
				for (let key in data) {
					this[key] = data[key];
				}
			}
			return data;
		},
		/**
		 * 开始提交数据，设置isSubmit防止重复提交
		 * @param {Object} fn
		 */
		$submitData(fn) {
			if (this.isSubmit) {
				return false;
			}
			this.isSubmit = true;
			//如果回调不成功，则认为本次执行完毕
			if (!fn()) {
				setTimeout(() => {
					this.$finishSubmit();
				}, 500)
			}
		},
		/**
		 * 结束提交
		 */
		$finishSubmit() {
			this.isSubmit = false;
		},
		imageOnLoad(data, key) {
			//这里有问题，页面数据重新刷新后，图片地址为改变的时候，不触发图片的load事件，
			setTimeout(() => {
				this.$set(data, 'loaded', true);
			}, 100)
		},
		showPopups(key) {
			this.$api.throttle(() => {
				this.$refs[key].open();
			}, 200)
		},
		hidePopups(key) {
			this.$refs[key].close();
		},
		//检查字段是否为空
		checkFields(data, fields) {
			for (let fie in fields) {
				if (typeof data[fie] == 'undefined' || data[fie] == '') {
					this.$api.msg(fields[fie] + '不能为空');
					return false;
				}
			}
			return true;
		},
		/**
		 * 比较上一个字段与下一个自动的大小
		 * @param {Object} data
		 * @param {Object} fields
		 */
		checkTimeFields(data, fields) {
			let prev = 0;
			let prevField = "";
			for (let fie in fields) {
				if (prev > data[fie]) {
					this.$api.msg(`${fields[prevField]}必须大于或等于${fields[fie]}`);
					return false;
				}
				prev = data[fie];
				prevField = fie;
			}
			return true;
		},
		/**
		 * 输入字段自动填充data
		 * @param {Object} val
		 * @param {Object} field
		 */
		changeField(val, field) {
			console.log(val, field)
			let fs = field.split(".");
			if (fs.length == 1) {
				this[field] = val;
			} else if (fs.length == 2) {
				if (!this[fs[0]]) {
					this[fs[0]] = {};
				}
				this[fs[0]][fs[1]] = val;
			}
		},
		getObjectProperty(obj, fields) {
			if (!fields) {
				return {}
			}
			let out = {}
			for (let key of fields) {
				out[key] = obj[key]
			}
			return out;
		},
		stopPrevent() {},
		/**
		 * 获取分享参数
		 * @param {Object} path
		 */
		getShareContent(path, query = [], redirect) {
			let imageUrl, title = "";
			if (this.userInfo && this.userInfo.my_invite_code) {
				query.push('u=' + this.userInfo.my_invite_code);
			}
			if (this.shopId) {
				query.push(`shopid=${this.shopId}`)
			}
			if (redirect) {
				path = "/pages/index/fruit";
				query.push(`rdt=${redirect}`)
			}
			if (!this.share.title || this.share.title.trim() == "") {
				//读取首页分享
				this.share = uni.getStorageSync("app_share");
			}
			if (this.share) {
				if (this.share.pageLinkQuery) {
					query.push(this.share.pageLinkQuery);
				}
				if (this.share.title) {
					title = this.share.title;
				}
				//自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径。支持PNG及JPG。显示图片长宽比是 5:4。
				if (this.share.imageUrl) {
					imageUrl = this.share.imageUrl;
				}
			}
			console.log({
				title,
				imageUrl,
				path: path + "?" + query.join('&')
			})
			return {
				title,
				imageUrl,
				query: query.join('&'),
				path: path + "?" + query.join('&')
			};
		}
	},
}
