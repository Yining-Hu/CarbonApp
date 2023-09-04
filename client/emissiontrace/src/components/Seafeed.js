import React from 'react';
import axios from 'axios';

export default class Seafeed extends React.Component {
  state = {
    saleorders:[],
    productionid:"",
    batchid:"",
    farmid:"",
    volume:"",
    datetime:"",
    farmer:"",
    testingid:"",
    temperature:"",
    storageid:"",
    manufacturer:"",
    location:"",
    bestbefore:"",
    orderid:"",
    customer:"",
    customeraddr:"",
  }

  componentDidMount() {
    const apiConfig = {
      headers:{
          "user-name":"sf",
          "api-key":"H8me0exNcSJwc6VWjO83BV0u9bC1UI",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/seafeed/view/saleorders`,apiConfig)
      .then(res => {
        const saleorders = res.data;
        this.setState({ saleorders });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleLogProduction = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"sf",
          "api-key":"H8me0exNcSJwc6VWjO83BV0u9bC1UI",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/seafeed/log/production`, 
    {productionid:this.state.productionid,
     batchid:this.state.batchid,
     farmid:this.state.farmid,
     volume:this.state.volume,
     datetime:this.state.datetime,
     farmer:this.state.farmer,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleLogTesting = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"sf",
          "api-key":"H8me0exNcSJwc6VWjO83BV0u9bC1UI",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/seafeed/log/testing`, 
    {testingid:this.state.testingid,
     temperature:this.state.temperature,
     datetime:this.state.datetime,
     productionid:this.state.productionid,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleLogStorage = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"sf",
          "api-key":"H8me0exNcSJwc6VWjO83BV0u9bC1UI",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/seafeed/log/production`, 
    {storageid:this.state.storageid,
     manufacturer:this.state.manufacturer,
     location:this.state.location,
     datetime:this.state.datetime,
     bestbefore:this.state.bestbefore,
     testingid:this.state.testingid,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleLogSaleorder = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"sf",
          "api-key":"H8me0exNcSJwc6VWjO83BV0u9bC1UI",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/seafeed/log/saleorder`, 
    {orderid:this.state.orderid,
     customer:this.state.customer,
     customeraddr:this.state.customeraddr,
     datetime:this.state.datetime,
     storageid:this.state.storageid,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Sale Orders</h2>
        <table>
        <tr>
          <th>OrderID</th>
          <th>Customer</th>
          <th>Customer Blockchain Address</th>
          <th>Quantity</th>
          <th>Status</th>
          <th>Datetime</th>
        </tr>
        {
          this.state.saleorders
            .map(saleorder =>
              <tr key={saleorder.orderid}>
                <td>{saleorder.orderid}</td>
                <td>{saleorder.customer}</td>
                <td>{saleorder.customeraddr}</td>
                <td>{saleorder.quantity}</td>
                <td>{saleorder.status}</td>
                <td>{saleorder.datetime}</td>
              </tr>
            )
        }
        </table>

        <h2>Log a Production</h2>
        <form onSubmit={this.handleLogProduction}>
          <div className='form-div'>
            <label className='cbtoken-label'>ProductionID:</label>
            <input type="text" name="productionid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>BatchID:</label>
            <input type="text" name="batchid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>FarmID:</label>
            <input type="text" name="farmid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Volume:</label>
            <input type="text" name="volume" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Datetime:</label>
            <input type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>

        <h2>Log a Testing</h2>
        <form onSubmit={this.handleLogTesting}>
          <div className='form-div'>
            <label className='cbtoken-label'>TestingID:</label>
            <input type="text" name="testingid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Temperature:</label>
            <input type="text" name="temperature" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Datetime:</label>
            <input type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>ProductionID:</label>
            <input type="text" name="productionid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>

        <h2>Log a Storage</h2>
        <form onSubmit={this.handleLogStorage}>
          <div className='form-div'>
            <label className='cbtoken-label'>StorageID:</label>
            <input type="text" name="storageid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Manufacturer:</label>
            <input type="text" name="manufacturer" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Location:</label>
            <input type="text" name="location" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Datetime:</label>
            <input type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Best Before:</label>
            <input type="text" name="bestbefore" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>TestingID:</label>
            <input type="text" name="testingid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>

        <h2>Log a Saleorder</h2>
        <form onSubmit={this.handleLogSaleorder}>
          <div className='form-div'>
            <label className='cbtoken-label'>SaleorderID:</label>
            <input type="text" name="orderid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Customer:</label>
            <input type="text" name="customer" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Customer Blockchain Account:</label>
            <input type="text" name="customeraddr" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Quantity:</label>
            <input type="text" name="quantity" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Datetime:</label>
            <input type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>StorageID:</label>
            <input type="text" name="storageid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}
