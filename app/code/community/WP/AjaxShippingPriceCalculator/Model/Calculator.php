<?php

class WP_AjaxShippingPriceCalculator_Model_Calculator
{
    protected $_customer        = null;
    protected $_quote           = null;
    protected $_product         = null;
    protected $_result          = array();
    protected $_addressInfo     = null;

    public function setAddressInfo($info)
    {
        $this->_addressInfo = $info;
        return $this;
    }

    public function getAddressInfo()
    {
        return $this->_addressInfo;
    }

    public function setProduct($product)
    {
        $this->_product = $product;
        return $this;
    }

    public function getProduct()
    {
        return $this->_product;
    }

    public function getResult()
    {
        return $this->_result;
    }

    public function calculate()
    {
        $product        = $this->getProduct();
        $addToCartInfo  = (array) $product->getAddToCartInfo();
        $addressInfo    = (array) $this->getAddressInfo();

        #Mage::log($product->getId());
        #Mage::log($addToCartInfo);
        #Mage::log($addressInfo);

        if (!($product instanceof Mage_Catalog_Model_Product) || !$product->getId()) {
            Mage::throwException(
                Mage::helper('wp_ajaxshippingpricecalculator')->__('Please specify a valid product')
            );
        }

        if (!isset($addressInfo['country_id'])) {
            Mage::throwException(
                Mage::helper('wp_ajaxshippingpricecalculator')->__('Please specify a country')
            );
        }

        if (empty($addressInfo['cart'])) $this->resetQuote();

        $shippingAddress = $this->getQuote()->getShippingAddress();

        $shippingAddress->setCountryId($addressInfo['country_id']);

        if (isset($addressInfo['region_id']))
            $shippingAddress->setRegionId($addressInfo['region_id']);

        if (isset($addressInfo['postcode']))
            $shippingAddress->setPostcode($addressInfo['postcode']);

        if (isset($addressInfo['region']))
            $shippingAddress->setRegion($addressInfo['region']);

        if (isset($addressInfo['city']))
            $shippingAddress->setCity($addressInfo['city']);

        $shippingAddress->setCollectShippingRates(true);
        $this->getQuote()->save();

        if (isset($addressInfo['coupon_code']))
            $this->getQuote()->setCouponCode($addressInfo['coupon_code']);

        $request = new Varien_Object($addToCartInfo);

        if ($product->getStockItem()) {
            $minimumQty = $product->getStockItem()->getMinSaleQty();
            if ($minimumQty > 0 && $request->getQty() < $minimumQty) {
                $request->setQty($minimumQty);
            }
        }

        $result = $this->getQuote()->addProduct($product, $request);
        #Mage::log($result->debug());

        if (is_string($result)) Mage::throwException($result);

        Mage::dispatchEvent('checkout_cart_product_add_after', array('quote_item' => $result, 'product' => $product));

        $this->getQuote()->collectTotals();
        $result = $shippingAddress->getGroupedAllShippingRates();

        if (is_array($result) && !count($result)) {
            Mage::getSingleton('catalog/session')->addNotice(
                Mage::helper('wp_ajaxshippingpricecalculator')->__('Sorry, no shipping rates are available at the moment for selected delivery address.')
            );
        }

        $this->_result = $result;
        return $this;
    }

    public function getQuote()
    {
        if ($this->_quote === null) {
            $addressInfo = $this->getAddressInfo();
            if (!empty($addressInfo['cart'])) {
                $quote = Mage::getSingleton('checkout/session')->getQuote();
            } else {
                $quote = Mage::getModel('sales/quote');
            }
            $this->_quote = $quote;
        }
        return $this->_quote;
    }

    public function resetQuote()
    {
        $this->getQuote()->removeAllAddresses();
        if ($this->getCustomer()) {
            $this->getQuote()->setCustomer($this->getCustomer());
        }
        return $this;
    }

    public function getCustomer()
    {
        if ($this->_customer === null) {
            $customerSession = Mage::getSingleton('customer/session');
            if ($customerSession->isLoggedIn()) {
                $this->_customer = $customerSession->getCustomer();
            } else {
                $this->_customer = false;
            }
        }
        return $this->_customer;
    }
}
