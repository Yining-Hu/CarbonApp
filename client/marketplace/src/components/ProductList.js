import React from 'react';
import axios from 'axios';

export default class ProductList extends React.Component {
  state = {
    productid:'',
    price:'',
    gas:400000
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleSubmit = event => {
    event.preventDefault();

    const formdata = {
      productid: this.state.productid,
      price: this.state.price,
      gas: this.state.gas
    };

    const apiConfig = {
      headers:{
          "api-key":"rrJOuiTp22tVvaowz5Uw0DNUPDzwBF",
          "user-name":"seller",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/marketplace/seller/list`, formdata, apiConfig)
      .then(res => {
        console.log(res.data);
      })
  }

  render() {
    return (
      <div>
        <h2>List a Product</h2>
        <form onSubmit={this.handleSubmit}>
          <div className='form-div'>
            <label className='token-mint-label'>Product ID:</label>
            <input type="text" name="productid" onChange={this.handleChange} />
          </div>
          <div className='form-div'>
            <label className='token-mint-label'>Price:</label>
            <input type="text" name="price" onChange={this.handleChange} />
          </div>
          <button type="submit">Add</button>
        </form>
      </div>
    )
  }
}
