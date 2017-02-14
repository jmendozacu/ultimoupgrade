<?php

class Rewardpoints_Block_Adminhtml_Dashboard_Tab_Spend extends Rewardpoints_Block_Adminhtml_Dashboard_Graph
{
    /**
     * Initialize object
     *
     * @return void
     */
    public function __construct()
    {
        $this->setHtmlId('spend_points');
        parent::__construct();
    }

    /**
     * Prepare chart data
     *
     * @return void
     */
    protected function _prepareData()
    {
        $this->setDataHelperName('rewardpoints/dashboard_stats');
        $this->getDataHelper()->setParam('store', $this->getRequest()->getParam('store'));
        $this->getDataHelper()->setParam('website', $this->getRequest()->getParam('website'));
        $this->getDataHelper()->setParam('group', $this->getRequest()->getParam('group'));
        

        /*$this->setDataRows('quantity');
        $this->_axisMaps = array(
            'x' => 'range',
            'y' => 'quantity'
        );*/
        $this->setDataRows('points_spent');
        $this->_axisMaps = array(
            'x' => 'range',
            'y' => 'points_spent'
        );

        parent::_prepareData();
    }
}
