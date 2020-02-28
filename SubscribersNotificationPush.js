
document.addEventListener("DOMContentLoaded", () => {

	if (typeof(Storage) === "undefined") {
		console.error("Local Storage are NOT Supported by this Browser");
		return;
	}


	if( !('serviceWorker' in navigator) ){
			console.error("Service Workers are NOT Supported by this Browser");
			return;
	}


	if( !('PushManager' in window) ){
			console.error('Push Notifications are NOT Supported by this Browser');
			return;
	}


	if( !('showNotification' in ServiceWorkerRegistration.prototype) ){
			console.error('Notifications are NOT Supported by this Browser');
			return;
	}


	function urlBase64ToUint8Array(base64String) {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}


	function setPushNotificationCookie(value) {
		var d = new Date();
		d.setDate(d.getDate()+7);
		var name	= "push_notification_dismissed = "+value;
		var expires = ";expires="+d.toGMTString();
		var path	= ";path=/";
		document.cookie = name + expires + path;
		$('#push_notification').show().animate({top: "-145px"}, 1000, function(){
			$("#push_notification").remove();
		});
	}


	function deleteCookie(name) {
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}


	navigator.serviceWorker.register("/service-worker.js")
	.then(() => {

		console.warn('[SW] Service Worker has been Registered');

		if( Notification.permission === 'default' ){

			console.warn('[SW] Notifications are Default');
			push_notificationSubscription();
			return;

		}else if( Notification.permission === 'granted' ){

			console.warn('[SW] Notifications are Granted');
			push_updateSubscription();
			return;

		}else if( Notification.permission === 'denied' ){

			console.warn('[SW] Notifications are Denied');
			push_deleteSubscription();
			return;

		}
	}, e => {
		console.error('[SW] Service Worker Registration Failed', e);
	});


	function push_subscribe() {

		var url = window.location.protocol+'//'+window.location.hostname+'/vapid';

		$.get(url, function(data) {
			vapidKey = data;
			navigator.serviceWorker.ready
			.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(vapidKey),
			}))
			.then(subscription => {

				var subsLocalStorage = JSON.parse(localStorage.getItem("subscription"));

				if (subsLocalStorage !== null) {
					console.warn('DELETE: Detect OLD Subscription in Local Storage');
					push_sendSubscriptionToServer(subsLocalStorage, 'DELETE');
				}

				console.warn('Subscription was Send');

				return push_sendSubscriptionToServer(subscription, 'ADD');
			})
			.catch(e => {
				if (Notification.permission === 'denied') {
					// The user denied the notification permission which
					// means we failed to subscribe and the user will need
					// to manually change the notification permission to
					// subscribe to push messages
					console.warn('Notifications are Denied by the User');
				} else {
					// A problem occurred with the subscription; common reasons
					// include network errors or the user skipped the permission
					console.error('Impossible to Subscribe to Push Notifications', e);
				}
			});
		}, 'json');
	}


	function push_updateSubscription() {

		navigator.serviceWorker.ready
		.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
		.then(subscription => {

			if (!subscription) {
				// We aren't subscribed to push, so set UI to allow the user to enable push
				console.warn('The Subscription NOT Exist for this User');
				push_notificationSubscription();
				return;
			}

			var subsLocalStorage = JSON.parse(localStorage.getItem("subscription"));

			if ( subsLocalStorage && (subscription.endpoint === subsLocalStorage.endpoint) ) {
				console.warn('NOT UPDATE: The Subscription Exist is Same');
				return;
			}

			console.warn('Subscription was Update');

			// Keep your server in sync with the latest endpoint
			return push_sendSubscriptionToServer(subscription, 'UPDATE');
		})
		.catch(e => {
			console.error('Error when Updating the Subscription', e);
		});
	}


	function push_deleteSubscription() {

		// To unsubscribe from push messaging, you need to get the subscription object
		navigator.serviceWorker.ready
		.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
		.then(subscription => {

			// Check that we have a subscription to unsubscribe
			if (!subscription) {
				// No subscription object, so set the state
				// to allow the user to subscribe to push
				console.warn('The Subscription NOT Exist, get Subscription in Local Storage');

				var subscription = JSON.parse(localStorage.getItem("subscription"));

				if (subscription === null) {
					console.warn('Local Storage does NOT have a Subscription');
					push_notificationSubscription();
					return;
				}
			}

			push_notificationSubscription();

			console.warn('Subscription was Unsubscribe');

			return push_sendSubscriptionToServer(subscription, 'DELETE');
		})
		//.then(subscription => subscription.unsubscribe())
		.catch(e => {
			// We failed to unsubscribe, this can lead to
			// an unusual state, so  it may be best to remove
			// the users data from your data store and
			// inform the user that you have done so
			console.error('Error when Unsubscribing the User', e);
		});
	}


	function push_sendSubscriptionToServer(subscription, method) {

		var url = window.location.protocol+'//'+window.location.hostname+'/push-subscription';

		if (method !== 'DELETE') {
			var endpoint = subscription.endpoint;
			var key = subscription.getKey('p256dh');
			var token = subscription.getKey('auth');
		} else {
			var endpoint = subscription['endpoint'];
			var key = subscription['p256dh'];
			var token = subscription['auth'];
		}

		var subscription = {
			endpoint: endpoint,
			key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
			token: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null
		};

		return fetch(url, {
			method,
			body: JSON.stringify(subscription),
		})
		.then(response => response.json())
		.then(data => {

			if (data) {
				subscription["p256dh"] = subscription["key"];
				subscription["auth"] = subscription["token"];
				delete subscription["key"];
				delete subscription["token"];

				switch (method) {
					case 'ADD':
							console.warn('Local Storage ADD');
							localStorage.setItem("subscription", JSON.stringify(subscription));
							_gaq.push(['gaGlobal._trackEvent', '/push-subscription', 'submit']);
							_gaq.push(['gaOwn._trackEvent', '/push-subscription', 'submit']);
							_gaq.push(['gaOwn2._trackEvent', '/push-subscription', 'submit']);
						break;
					case 'UPDATE':
							console.warn('Local Storage UPDATE');
							localStorage.setItem("subscription", JSON.stringify(subscription));
						break;
					case 'DELETE':
							console.warn('Local Storage DELETE');
							localStorage.removeItem("subscription");
						break;
				}
			}
		});
	}


	function push_notificationSubscription(request) {

		var push_notification = $('#push_notification');
		var cookie = readCookie('push_notification_dismissed');
		var permission = '';

		if( (!cookie) && ((Notification.permission === 'default') || (Notification.permission === 'denied')) ){

			var url = window.location.protocol+'//'+window.location.hostname+'/push-notification';

			$.get(url, function(data) {

				push_notification.html(data).show().animate({top: "0px"}, 1000);

				$("#js-push-cancel-button").bind("click", function() {

					console.warn('The Permission Request was Denied');

					setPushNotificationCookie(1);
					push_deleteSubscription();

				});
				$("#js-push-accept-button").bind("click", function() {

					Notification.requestPermission(function(permission) {

						if( permission === "granted" ){

							console.warn('The Permission Request was Accepted');
							push_subscribe();
							setPushNotificationCookie(1);

						}else if( permission === "denied" ){

							$('#denied').remove();
							$('.push-cta-box-msg').after('<div id="denied" class="m-t-md m-b-xs taCenter tRed">Notificaciones bloqueadas, por favor habilítalas en tu navegador</div>');
							$('#denied').hide().fadeIn(1000);

						}

					});
				});
			});

		}else if( Notification.permission === 'granted' ){

			console.warn('The Permission Request was Accepted');
			push_subscribe();

		}
	}

});
