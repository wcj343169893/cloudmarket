// uni iap
const IapTransactionState = {
	purchasing: "0", // A transaction that is being processed by the App Store.
	purchased: "1", // A successfully processed transaction.
	failed: "2", // A failed transaction.
	restored: "3", // A transaction that restores content previously purchased by the user.
	deferred: "4" // A transaction that is in the queue, but its final status is pending external action such as Ask to Buy.
};

class Iap {

	constructor(data={}) {
		this._productIds = data.products || [];
		this._channel = null;
		this._channelError = null;
		this.ready = false;
	}

	init() {
		return new Promise((resolve, reject) => {
			this.getChannels((channel) => {
				this.ready = true;
				resolve(channel);
			}, (err) => {
				reject(err);
			})
		})
	}

	getProduct(productIds) {
		return new Promise((resolve, reject) => {
			this._channel.requestProduct(productIds || this._productIds, (res) => {
				resolve(res);
			}, (err) => {
				reject(err);
			})
		});
	}

	requestPayment(orderInfo) {
		return new Promise((resolve, reject) => {
			uni.requestPayment({
				provider: "appleiap",
				orderInfo: {
					quantity: 1,
					manualFinishTransaction: true,
					...orderInfo
				},
				success: (res) => {
					resolve(res);
				},
				fail: (err) => {
					//console.log('requestPayment-err: ', err)
					reject(err);
				}
			});
		});
		
	}

	restoreCompletedTransactions(username) {
		return new Promise((resolve, reject) => {
			this._channel.restoreCompletedTransactions({
				manualFinishTransaction: true,
				username
			}, (res) => {
				resolve(res);
			}, (err) => {
				console.log('restoreCompletedTransactions-err: ', err)
				reject(err);
			})
		});
	}

	finishTransaction(transaction) {
		return new Promise((resolve, reject) => {
			this._channel.finishTransaction(transaction, (res) => {
				resolve(res);
			}, (err) => {
				reject(err);
			});
		});
	}

	getChannels(success, fail) {
		if (this._channel !== null) {
			success(this._channel)
			return
		}

		if (this._channelError !== null) {
			fail(this._channelError)
			return
		}

		uni.getProvider({
			service: 'payment',
			success: (res) => {
				this._channel = res.providers.find((channel) => {
					return (channel.id === 'appleiap')
				})

				if (this._channel) {
					success(this._channel)
				} else {
					this._channelError = {
						errMsg: 'paymentContext:fail iap service not found'
					}
					fail(this._channelError)
				}
			}
		});
	}

	get channel() {
		return this._channel;
	}
}

export default {
	Iap,
	IapTransactionState
};