<?php

class Motofan_Model_SubscribersNotificationPush extends Motofan_Model_Abstract {

  /**
   * @var Motofan_Model_DbTable_SubscribersNotificationPush
   */
  protected $_SubscribersNotificationPushDb;


  public function __construct($cache = true) {

    $this->_SubscribersNotificationPushDb = Motofan_Model_DbTable_SubscribersNotificationPush::getInstance();
    parent::__construct($cache);
  }


  /**
   * Función para guardar un Suscriptor en la BBDD
   *
   * @param array $data
   *
   * @return int
   *
   */
  public function addSubscribersNotificationPush($data) {

    return $this->_SubscribersNotificationPushDb->addSubscribersNotificationPush($data);
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

    return $this->_SubscribersNotificationPushDb->updateSubscribersNotificationPush($data);
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

    return $this->_SubscribersNotificationPushDb->removeSubscribersNotificationPush($data);
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

    return $this->_SubscribersNotificationPushDb->getNumberActiveSubscribers();
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

    return $this->_SubscribersNotificationPushDb->getAllSubscribers();
  }

}

?>