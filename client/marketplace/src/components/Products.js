import React from 'react';
import axios from 'axios';

export default class Products extends React.Component {
  state = {
    products:[]
  }

  componentDidMount() {
    const apiConfig = {
        headers:{
            "api-key":"qdpJCrjbL14djS2cVPYoNSdCw6UzCT",
            "user-name":"agent",
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
    }
    axios.get(`http://localhost:3000/marketplace/view/products`,apiConfig)
      .then(res => {
        const products = res.data;
        this.setState({ products });
      })
  }

  handleDirectPurchase = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"Mt0sYr7p3Kn8Ua8BWPvlURbhCOLmWq",
          "user-name":"buyer",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/marketplace/buyer/purchase`, {productid:event.target.value,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })

    this.setState({
      tokens: this.state.tokens.slice(0, -1)
    });
  }

  render() {
    return (
      <div>
        <h2>Display All Products</h2>
        <table>
        <tr>
          <th>Product ID</th>
          <th>Price</th>
          <th>Purchase State</th>
          <th>Seller</th>
          <th>Buyer</th>
          <th>Direct Purchase</th>
          <th>Escrow Purchase</th>
        </tr>
        {
          this.state.products
            .map(product =>
              <tr key={product.productid}>
                <td>{product.productid}</td>
                <td>{product.price}</td>
                <td>{product.purchase_state}</td>
                <td>{product.seller}</td>
                <td>{product.buyer}</td>
                <td><button value={product.productid}>Proceed</button></td>
                <td><button value={product.productid}>Proceed</button></td>
              </tr>
            )
        }

        </table>
      </div>
    )
  }
}
