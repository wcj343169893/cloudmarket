/* const client = uniCloud.init({
	provider: 'tencent',
	spaceId: 'cloud-market-3c5868',
	debugFunction: false
}); */
const client = uniCloud;
const auth = client.auth();

export {
	client,
	auth
}
