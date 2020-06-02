<template>
	<view class="content">
		<view class="">
			<text>{{ title }}</text>
		</view>
		<button type="default" @click="onClick">点我</button>
		<button type="default" @click="onSignout">退出</button>
		<button type="default" @click="check">check</button>
	</view>
</template>

<script>
// 下个alpha版本就不需要手动初始化了
const client = uniCloud.init({
	provider: 'tencent',
	spaceId: 'cloud-market-3c5868',
	debugFunction: false
});
const auth = client.auth();
export default {
	data() {
		return {
			title: 'Hello'
		};
	},
	onLoad() {},
	methods: {
		onClick() {
			client.callFunction({
				name: 'token',
				data: {
					uid: 10000,
					token:'VCjcvvEcigSXPwgECoOcemoxtOZuRgPR5Y4x3yBgssJHYWRLF/6qbKUhgxS3WwvrHe1NtWuyVIEB4ZWmmbXA+yNbociDw/y7gPf/1569x/iAdUmxVtnfkVZGXQ8Kj/2D5LifxTsYxmbckfZbAuZuZEXj6sv2yPCzENKV8XN6xLA='
				},
				success(res) {
					console.log(res);
					auth.signInWithTicket(res.result.data.ticket)
						.then(res => {
							console.log(res);
						})
						.catch(err => {
							console.error(err);
						});
				},
				fail(err) {
					console.log('fail', err);
				}
			});
		},
		onSignout(){
			auth.signOut().then(res=>{
				console.log("退出登录",res)
			});
		},
		check() {
			client.callFunction({
				name: 'check',
				success(res) {
					console.log(res);
				},
				fail(err) {
					console.log('fail', err);
				}
			});
		}
	}
};
</script>

<style></style>
