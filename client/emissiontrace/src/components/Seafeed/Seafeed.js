import React from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

function withRouter(Component) {
  return props => <Component {...props} navigation={useNavigate()} />
}

class Seafeed extends React.Component {
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
    quantity:""
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

  handleClick = (orderid) => {
    this.props.navigation("/orderdetail/" + orderid)
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

    axios.post(`http://localhost:3000/seafeed/log/storage`, 
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
     quantity:this.state.quantity,
     datetime:this.state.datetime,
     storageid:this.state.storageid,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <Grid2 
        container 
        direction={'row'} 
        justifyContent={'center'} 
        alignItems={'center'} 
        spacing={2} 
      >
        <Grid2 xs={12}>
        <h2>Sale Orders</h2>
        <table>
        <tr>
          <th>OrderID</th>
          <th>Customer</th>
          <th>Customer Blockchain Address</th>
          <th>Quantity</th>
          <th>Status</th>
          <th>Datetime</th>
          <th>Details</th>
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
                <td><button onClick={() => this.handleClick(saleorder.orderid)}>View</button></td>
              </tr>
            )
        }
        </table>
        </Grid2>

        <Grid2 xs={3}>
        <h2>Step 1: Log a Production</h2>
        <form onSubmit={this.handleLogProduction}>
          <div className='form-div'>
            <label className='label'>ProductionID:</label>
            <input className='form-input' type="text" name="productionid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>BatchID:</label>
            <input className='form-input' type="text" name="batchid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>FarmID:</label>
            <input className='form-input' type="text" name="farmid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Volume:</label>
            <input className='form-input' type="text" name="volume" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Datetime:</label>
            <input className='form-input' type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
        </Grid2>

        <Grid2 xs={3}>
        <h2>Step 2: Log a Testing</h2>
        <form onSubmit={this.handleLogTesting}>
          <div className='form-div'>
            <label className='label'>TestingID:</label>
            <input className='form-input' type="text" name="testingid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Temperature:</label>
            <input className='form-input' type="text" name="temperature" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Datetime:</label>
            <input className='form-input' type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>ProductionID:</label>
            <input className='form-input' type="text" name="productionid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
        </Grid2>

        <Grid2 xs={3}>
        <h2>Step 3: Log a Storage</h2>
        <form onSubmit={this.handleLogStorage}>
          <div className='form-div'>
            <label className='label'>StorageID:</label>
            <input className='form-input' type="text" name="storageid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Manufacturer:</label>
            <input className='form-input' type="text" name="manufacturer" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Location:</label>
            <input className='form-input' type="text" name="location" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Datetime:</label>
            <input className='form-input' type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Best Before:</label>
            <input className='form-input' type="text" name="bestbefore" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>TestingID:</label>
            <input className='form-input' type="text" name="testingid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
        </Grid2>

        <Grid2 xs={3}>
        <h2>Step 4: Log a Saleorder</h2>
        <form onSubmit={this.handleLogSaleorder}>
          <div className='form-div'>
            <label className='label'>SaleorderID:</label>
            <input className='form-input' type="text" name="orderid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Customer:</label>
            <input className='form-input' type="text" name="customer" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Customer Blockchain Account:</label>
            <input className='form-input' type="text" name="customeraddr" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Quantity:</label>
            <input className='form-input' type="text" name="quantity" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Datetime:</label>
            <input className='form-input' type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>StorageID:</label>
            <input className='form-input' type="text" name="storageid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
        </Grid2>
      </Grid2>
    )
  }
}

export default withRouter(Seafeed)