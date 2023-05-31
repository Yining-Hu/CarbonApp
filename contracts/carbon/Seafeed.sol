// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Seafeed {
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
        uint256 DateTime; //unix time
    }

    struct Testing {
        uint16 Temperature;
        uint256 DateTime;
    }

    struct Storage {
        string Manufacturer;
        string Location;
        uint256 DateTime;
        uint256 BestBefore;
    }

    struct Sale {
        uint16 Quantity;
        bool DispatchDocsAttached;
        uint256 DateTime;
    }

    struct Order {
        string Customer;
        uint16 Quantity;
        OrderStatus OS;
        uint256 DateTime;
    }

    string[] public allorders;

    // storage of structs
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

    // trace from end product to source
    mapping(string => string) public TestingToProduction;
    mapping(string => string) public StorageToTesting;
    mapping(string => string) public SaleToStorage;
    mapping(string => string) public OrderToSale;

// the setters
    function logProduction(
        string memory _productionid,
        string memory _batchid,
        string memory _farmid,
        uint256 _volume,
        uint256 _datetime) 
        public
    {
        require(!productionExists[_productionid], "Production already exists.");

        productionExists[_productionid] = true;
        productions[_productionid] = Production(_batchid,_farmid,_volume,_datetime);
    }

    function logTesting(
        string memory _testingid,
        uint16 _temperature,
        uint256 _datetime,
        string memory _productionid
    )
        public
    {
        require(!testingExists[_testingid], "Testing already exists.");
        
        testingExists[_testingid] = true;
        testings[_testingid] = Testing(_temperature,_datetime);
        TestingToProduction[_testingid] = _productionid; // traceability
    }

    function logStorage(
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
        storages[_storageid] = Storage(_manufacturer,_location,_datetime,_bestbefore);
        StorageToTesting[_storageid] = _testingid; // traceability
    }

    // logSale should be more like "orderSeafeed" or logOrder
    function logSale(
        string memory _saleid,
        uint16 _quantity,
        uint256 _datetime,
        string memory _storageid
    )
        public
    {
        require(!saleExists[_saleid], "Sale already exists.");

        saleExists[_saleid] = true;
        sales[_saleid] = Sale(_quantity,false,_datetime);   
        SaleToStorage[_saleid] = _storageid; // traceability
    }

    function logOrder(string memory _orderid, string memory _customer, uint16 _quantity, uint256 _datetime) 
        public 
    {
        require(!orderExists[_orderid], "Order already exists.");
        
        orderExists[_orderid] = true;
        orders[_orderid] = Order(_customer,_quantity,OrderStatus.ORDERED,_datetime);
        allorders.push(_orderid);
    }

    function updateOrder(string memory _orderid, uint8 _ordertatus) public {
        orders[_orderid].OS = OrderStatus(_ordertatus);
    }

// the getters
    function queryProduction(string memory _productionid) 
        public 
        view 
        returns(
            string memory,
            string memory,
            uint256,
            uint256) 
    {
        require(productionExists[_productionid], "Production does not exist.");
        return(
            productions[_productionid].BatchID,
            productions[_productionid].FarmID,
            productions[_productionid].Volume,
            productions[_productionid].DateTime
        );
    }

    function queryTesting(string memory _testingid)
        public
        view
        returns(
            uint16,
            uint256
        )
    {
        require(testingExists[_testingid], "Testing does not exist.");
        return(
            testings[_testingid].Temperature,
            testings[_testingid].DateTime
        );
    }

    function queryStorage(string memory _storageid)
        public
        view
        returns(
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        require(storageExists[_storageid],"Storage does not exist.");
        return(
            storages[_storageid].Manufacturer,
            storages[_storageid].Location,
            storages[_storageid].DateTime,
            storages[_storageid].BestBefore
        );
    }

    function querySale(string memory _saleid)
        public
        view
        returns(
            uint16,
            bool,
            uint256
        )
    {
        require(saleExists[_saleid], "Sale does not exist.");
        return(
            sales[_saleid].Quantity,
            sales[_saleid].DispatchDocsAttached,
            sales[_saleid].DateTime
        );
    }

    function queryOrder(string memory _orderid)
        public
        view
        returns(
            string memory,
            uint256,
            string memory,
            uint256)
    {
        require(orderExists[_orderid], "Order does not exist.");

        string memory orderstatus;
        if (orders[_orderid].OS == OrderStatus.ORDERED) {
            orderstatus = "Ordered";
        } else if (orders[_orderid].OS == OrderStatus.PAYMENTRECEIVED) {
            orderstatus = "Paymentreceived";
        } else if (orders[_orderid].OS == OrderStatus.DISPATCHED) {
            orderstatus = "Dispatched";
        } else if (orders[_orderid].OS == OrderStatus.ARRIVED) {
            orderstatus = "Arrived";
        } else {
            orderstatus = "Unknown";
        }

        return(
            orders[_orderid].Customer,
            orders[_orderid].Quantity,
            orderstatus,
            orders[_orderid].DateTime
        );
    }

    function queryAllOrders() public view 
        returns(
            string[] memory,
            string[] memory,
            uint256[] memory,
            string[] memory,
            uint256[] memory
        )
    {
        string[] memory customers = new string[](allorders.length);
        uint256[] memory quantities = new uint256[](allorders.length);
        string[] memory statuss = new string[](allorders.length);
        uint256[] memory datetimes = new uint256[](allorders.length);

        for(uint256 i=0; i<allorders.length; i++) {
            if (orders[allorders[i]].OS == OrderStatus.ORDERED) {
                statuss[i] = "Ordered";
            } else if (orders[allorders[i]].OS == OrderStatus.PAYMENTRECEIVED) {
                statuss[i] = "Paymentreceived";
            } else if (orders[allorders[i]].OS == OrderStatus.DISPATCHED) {
                statuss[i] = "Dispatched";
            } else if (orders[allorders[i]].OS == OrderStatus.ARRIVED) {
                statuss[i] = "Arrived";
            } else {
                statuss[i] = "Unknown";
            }

            customers[i] = orders[allorders[i]].Customer;
            quantities[i] = orders[allorders[i]].Quantity;
            datetimes[i] = orders[allorders[i]].DateTime;
        }

        return(allorders,customers,quantities,statuss,datetimes);
    }

    // use an orderid to trace back to source
    function queryOrderSource(string memory _orderid) public view returns (string memory) {
        string memory saleid = OrderToSale[_orderid];
        string memory storageid = TestingToProduction[saleid];
        string memory testingid = StorageToTesting[storageid];
        string memory productionid = SaleToStorage[testingid];
        return productionid;
    }
}