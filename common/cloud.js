const client = uniCloud.init({
	provider: 'tencent',
	spaceId: 'xxxxxxxx',
	debugFunction: false
});
const auth = client.auth();

export {
	client,
	auth
}
