// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SeafeedRegistry {
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

    struct SaleOrder {
        string Customer;
        address CustomerAddr;
        uint16 Quantity;
        OrderStatus OS;
        uint256 DateTime;
    }

    string[] public allorders;

    // storage of structs
    mapping(string => Production) public productions;
    mapping(string => Testing) public testings;
    mapping(string => Storage) public storages;
    mapping(string => SaleOrder) public saleorders;

    // existence of structs
    mapping(string => bool) public productionExists;
    mapping(string => bool) public testingExists;
    mapping(string => bool) public storageExists;
    mapping(string => bool) public saleorderExists;

    // trace from end product to source
    mapping(string => string) public TestingToProduction;
    mapping(string => string) public StorageToTesting;
    mapping(string => string) public OrderToStorage;

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
        require(productionExists[_productionid], "The referred productionid does not exist.");
        
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
        require(testingExists[_testingid], "The referred testingid does not exist.");

        storageExists[_storageid] = true;
        storages[_storageid] = Storage(_manufacturer,_location,_datetime,_bestbefore);
        StorageToTesting[_storageid] = _testingid; // traceability
    }

    function logSaleOrder(
        string memory _orderid, 
        string memory _customer, 
        address _customeraddr,
        uint16 _quantity, 
        uint256 _datetime,
        string memory _storageid) 
        public 
    {
        require(!saleorderExists[_orderid], "Order already exists.");
        require(storageExists[_storageid], "The referred storageid does not exist.");
        
        saleorderExists[_orderid] = true;
        saleorders[_orderid] = SaleOrder(_customer,_customeraddr,_quantity,OrderStatus.ORDERED,_datetime);
        OrderToStorage[_orderid] = _storageid;
        allorders.push(_orderid);
    }

    function updateOrder(string memory _orderid, uint8 _ordertatus) public {
        require(saleorderExists[_orderid], "Order does not exist.");
        saleorders[_orderid].OS = OrderStatus(_ordertatus);
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

    function querySaleOrder(string memory _orderid)
        public
        view
        returns(
            string memory,
            address,
            uint16,
            string memory,
            uint256)
    {
        require(saleorderExists[_orderid], "Order does not exist.");

        string memory orderstatus;
        if (saleorders[_orderid].OS == OrderStatus.ORDERED) {
            orderstatus = "Ordered";
        } else if (saleorders[_orderid].OS == OrderStatus.PAYMENTRECEIVED) {
            orderstatus = "Paymentreceived";
        } else if (saleorders[_orderid].OS == OrderStatus.DISPATCHED) {
            orderstatus = "Dispatched";
        } else if (saleorders[_orderid].OS == OrderStatus.ARRIVED) {
            orderstatus = "Arrived";
        } else {
            orderstatus = "Unknown";
        }

        return(
            saleorders[_orderid].Customer,
            saleorders[_orderid].CustomerAddr,
            saleorders[_orderid].Quantity,
            orderstatus,
            saleorders[_orderid].DateTime
        );
    }

    function queryAllSaleOrders() public view 
        returns(
            string[] memory,
            string[] memory,
            address[] memory,
            uint256[] memory,
            string[] memory,
            uint256[] memory
        )
    {
        string[] memory customers = new string[](allorders.length);
        address[] memory customeraddrs = new address[](allorders.length);
        uint256[] memory quantities = new uint256[](allorders.length);
        string[] memory statuss = new string[](allorders.length);
        uint256[] memory datetimes = new uint256[](allorders.length);

        for(uint256 i=0; i<allorders.length; i++) {
            if (saleorders[allorders[i]].OS == OrderStatus.ORDERED) {
                statuss[i] = "Ordered";
            } else if (saleorders[allorders[i]].OS == OrderStatus.PAYMENTRECEIVED) {
                statuss[i] = "Paymentreceived";
            } else if (saleorders[allorders[i]].OS == OrderStatus.DISPATCHED) {
                statuss[i] = "Dispatched";
            } else if (saleorders[allorders[i]].OS == OrderStatus.ARRIVED) {
                statuss[i] = "Arrived";
            } else {
                statuss[i] = "Unknown";
            }

            customers[i] = saleorders[allorders[i]].Customer;
            customeraddrs[i] = saleorders[allorders[i]].CustomerAddr;
            quantities[i] = saleorders[allorders[i]].Quantity;
            datetimes[i] = saleorders[allorders[i]].DateTime;
        }

        return(allorders,customers,customeraddrs,quantities,statuss,datetimes);
    }

    // use an orderid to trace back to source
    function querySaleOrderSource(string memory _orderid) public view 
        returns (
            string memory,
            string memory,
            string memory
        ) 
    {
        require(saleorderExists[_orderid], "Order does not exist.");
        string memory storageid = OrderToStorage[_orderid];
        string memory testingid = StorageToTesting[storageid];
        string memory productionid = TestingToProduction[testingid];
        return (productionid,testingid,storageid);
    }
}