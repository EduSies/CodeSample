<?php

class Motofan_Model_DbTable_SubscribersNotificationPush extends Motofan_Model_DbTable_Abstract {

	protected $_name = 'SubscribersNotificationPush';


	/**
	 * Función para guardar un Suscriptor en la BBDD
	 *
	 * @param array $data
	 *
	 * @return int
	 *
	 */
	public function addSubscribersNotificationPush($data) {

		try {

			$data = array_merge($data, array('id_site' => ID_SITE, 'date_created' => time()));
			$result = $this->insert($data);

			return $result;

		} catch (Exception $e) {
			return false;
		}
	}


	/**
	 * Función para actualizar los datos de un Suscriptor en la BBDD
	 *
	 * @param array $data
	 *
	 * @return bool
	 *
	 */
	public function updateSubscribersNotificationPush($data) {

		try{

			$id = $this->getSubscribersByEndPoint($data['endpoint']);
			$data = array_merge($data, array('id_site' => ID_SITE, 'date_created' => time()));
			$result	= $this->update($data, 'id = ' . $id['id']);

			return $result;

		} catch (Exception $e) {
			return $this->addSubscribersNotificationPush($data);
		}
	}


	/**
	 * Función para "borrar/dar de baja" los datos de un Suscriptor en la BBDD
	 *
	 * @param array $data
	 *
	 * @return bool
	 *
	 */
	public function removeSubscribersNotificationPush($data) {

		try{

			$id = $this->getSubscribersByEndPoint($data['endpoint']);
			$result	= $this->delete('id = ' . $id['id']);

			return $result;

		} catch (Exception $e) {
			return false;
		}
	}


	/**
	 * Función que retorna el id del suscriptor, pasando su endpoint, dado la primera vez que se suscribio.
	 *
	 * @param int $endpoint
	 *
	 * @return int
	 *
	 */
	public function getSubscribersByEndPoint($endpoint) {

		$select = $this->select()
			->from(array('s'=>$this->_name), 's.*')
			->setIntegrityCheck(false)
			->where('s.endpoint = ?', $endpoint);

		$result = $this->fetchRow($select);

		return $result;
	}


	/**
	 * Función que retorna la cantidad de usuarios suscritos a las notificaciones push.
	 *
	 * @param void
	 *
	 * @return int
	 *
	 */
	public function getNumberActiveSubscribers() {

		$select = $this->fetchRow($this->select()->from(array('s'=>$this->_name),array("CID"=>"COUNT(*)")))->toArray();

		return $select['CID'];
	}


	/**
	 * Función que retorna los usuarios suscritos a las notificaciones push.
	 *
	 * @param void
	 *
	 * @return array
	 *
	 */
	public function getAllSubscribers() {

		$select = $this->select()->from(array('s' => $this->_name),'s.*')->order('s.date_created DESC');

		$select_count = $this->select()->from(array('s'=>$this->_name),array('CID'=>'COUNT(*)'));

		$cnt = $this->fetchRow($select_count)->toArray();

		if($ret = $this->fetchAll($select)){

			$ret = $ret->toArray();

			$items = array(
				'CID' => $cnt['CID'],
				'SUBS' => $ret
			);

		}else{

			$items = false;
		}

		return $items;
	}


}

?>