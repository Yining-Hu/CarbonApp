// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SeafeedTracking {
    enum OrderStatus {
        ORDERED,
        PAYMENTRECEIVED,
        DISPATCHED,
        ARRIVED
    }

    struct Production {
        string BatchID;
        string FarmID;
        uint256 Volume;
        uint256 DateTime;
    }

    struct Testing {
        uint16 Temperature;
        uint256 DateTime; //unix time
    }

    struct Storage {
        string Manufacturer;
        string Location;
        uint256 DateTime; //unix time
        uint256 BestBefore;
    }

    struct Sale {
        string Order;
        uint16 Quantity;
        bool DispatchDocsAttached;
        uint256 DateTime; //unix time
    }

    struct Order {
        string Customer;
        uint16 Quantity;
        OrderStatus OS;
        uint256 DateTime;
    }

    // storage of stucts
    mapping(string => Production) public productions;
    mapping(string => Testing) public testings;
    mapping(string => Storage) public storages;
    mapping(string => Sale) public sales;
    mapping(string => Order) public orders;

    // existence of structs
    mapping(string => bool) public productionExists;
    mapping(string => bool) public testingExists;
    mapping(string => bool) public storageExists;
    mapping(string => bool) public saleExists;
    mapping(string => bool) public orderExists;

    // from end product to source
    mapping(string => string) public TestingToProduction;
    mapping(string => string) public StorageToTesting;
    mapping(string => string) public SaleToStorage;
    mapping(string => string) public OrderToSale;

    function registerProduction(
        string memory _productionid,
        string memory _batchid,
        string memory _farmid,
        uint256 _volume,
        uint256 _datetime) 
        public
    {
        require(!productionExists[_productionid], "Production already exists.");

        productionExists[_productionid] = true;

        productions[_productionid].BatchID = _batchid;
        productions[_productionid].FarmID = _farmid;OrderStatus;
        productions[_productionid].Volume = _volume;
        productions[_productionid].DateTime = _datetime;
    }

    function registerTesting(
        string memory _testingid,
        uint16 _temperature,
        uint256 _datetime,
        string memory _productionid
    )
        public
    {
        require(!testingExists[_testingid], "Testing already exists.");
        
        testingExists[_testingid] = true;

        testings[_testingid].Temperature = _temperature;
        testings[_testingid].DateTime = _datetime;

        // traceability
        TestingToProduction[_testingid] = _productionid;
    }

    function registerStorage(
        string memory _storageid,
        string memory _manufacturer,
        string memory _location,
        uint256 _datetime,
        uint256 _bestbefore,
        string memory _testingid
    )
        public
    {
        require(!storageExists[_storageid], "Storage already exists.");

        storageExists[_storageid] = true;

        storages[_storageid].Manufacturer = _manufacturer;
        storages[_storageid].Location = _location;
        storages[_storageid].DateTime = _datetime;
        storages[_storageid].BestBefore = _bestbefore;

        // traceability
        StorageToTesting[_storageid] = _testingid;
    }

    // registerSale should be more like "orderSeafeed" or registerOrder
    function registerSale(
        string memory _saleid,
        string memory _order,
        uint16 _quantity,
        uint256 _datetime,
        string memory _storageid
    )
        public
    {
        require(!saleExists[_saleid], "Sale already exists.");

        saleExists[_saleid] = true;

        sales[_saleid].Order = _order;
        sales[_saleid].Quantity = _quantity;
        sales[_saleid].DispatchDocsAttached = false; // default false
        sales[_saleid].DateTime = _datetime;

        // traceability
        SaleToStorage[_saleid] = _storageid;
    }

    function registerOrder(string memory _orderid, string memory _customer, uint16 _quantity, uint256 _datetime) 
        public 
    {
        require(!orderExists[_orderid], "Order already exists.");
        
        orderExists[_orderid] = true;

        orders[_orderid].Customer = _customer;
        orders[_orderid].Quantity = _quantity;
        orders[_orderid].OS = OrderStatus.ORDERED;
        orders[_orderid].DateTime = _datetime;
    }

    function updateOrder(string memory _saleid, uint8 _ordertatus) public {
        orders[_saleid].OS = OrderStatus(_ordertatus);
    }

    // use an orderid to trace back to source
    function traceToSource(string memory _orderid) public view returns (string memory) {
        string memory saleid = OrderToSale[_orderid];
        string memory storageid = TestingToProduction[saleid];
        string memory testingid = StorageToTesting[storageid];
        string memory productionid = SaleToStorage[testingid];
        return productionid;
    }
}