<?php

use Minishlink\WebPush\WebPush;

class SubscribersNotificationPushController extends dotFan_Generic_PublicController{


	public function vapidAction() {

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender(true);

		die($this->_helper->Json(VAPID_PUBLIC_KEY));
	}


	// Ejemplo de Estructura JSON
	/*const notifications = {
		title: "Última Hora - Motofan Noticias",
		options: {
		  body: "Novedades en la ITV de las motos en 2020",
		  icon: "https://images.motofan.com/img/favicon-new-114.png",
		  image: "https://images.motofan.com/N/3/9/7/novedades-en-la-itv-de-las-motos-en-2020_fs_95105.jpg",
		  //badge: "https://images.motofan.com/img/mf-imago-white.png",
		  data: {
					url_open: "https://www.motofan.com/noticias",
					url_close: "https://www.motofan.com/noticias"
				},
		  tag: "push-news",
		  requireInteraction: true,
		  /*actions: [
		    { action: "yes", title: "Ver más", icon: "https://images.motofan.com/img/mf-imago-new.png" },
		    { action: "no", title: "No, Gracias", icon: "https://images.motofan.com/img/mf-imago-white.png" }
		  ],*
		}
	};*/
	public function pushsubscriptionAction() {

		error_reporting(E_ALL ^ E_WARNING);

		$this->_helper->layout()->disableLayout();
		$this->_helper->viewRenderer->setNoRender(true);
		$subscription = json_decode(file_get_contents('php://input'), true);

		if (!isset($subscription['endpoint'])) {
			die($this->_helper->Json("Error: not a subscription"));
			return;
		}

		$push_notification = Motofan_Model_SubscribersNotificationPush::getInstance();
		$method = $_SERVER['REQUEST_METHOD'];

		switch ($method) {
		    case 'ADD':
	        	// create a new subscription entry in your database (endpoint is unique)
				$response = $push_notification->addSubscribersNotificationPush($subscription);
				$notifications = array(
					'payload' => array(
						'title' => $this->view->translate("¡Gracias por suscribirte!"),
						'options' => array(
							'body' => $this->view->translate("Pronto recibirás las últimas novedades de Motofan.com"),
							'icon' => MEDIAURL."/img/favicon-new-114.png",
							'image' => MEDIAURL."/img/img-push.jpg",
							'data' => array(),
							'tag' => "push-subscribe",
							'requireInteraction' => true
						)
					)
				);
		        break;
		    case 'UPDATE':
		        	// update the key and token of subscription corresponding to the endpoint
					$response = $push_notification->updateSubscribersNotificationPush($subscription);
		        break;
		    case 'DELETE':
					// delete the subscription corresponding to the endpoint
					$response = $push_notification->removeSubscribersNotificationPush($subscription);
		        break;
		    default:
					die($this->_helper->Json("Error: method not handled"));
		        return;
		}


		if( ($method == 'ADD') && ($response != NULL) ){

			$auth = array(
				'VAPID' => array(
					'subject' => WEBURL,
					'publicKey' => VAPID_PUBLIC_KEY,
					'privateKey' => VAPID_PRIVATE_KEY
				),
			);

			$webPush = new WebPush($auth);

			$response = $webPush->sendNotification(
				$subscription['endpoint'],
				json_encode($notifications['payload']),
				$subscription['key'],
				$subscription['token'],
				true
			);

		}

		die($this->_helper->Json($response));
	}


}

?>