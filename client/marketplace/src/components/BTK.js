import React from 'react';
import axios from 'axios';

export default class BTK extends React.Component {
  state = {
    balances:[],
    amountTobuy:"",
    amountTosell:""
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
    axios.get(`http://localhost:3000/marketplace/btk/balances`,apiConfig)
      .then(res => {
        const balances = res.data;
        this.setState({ balances });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleBuy = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"Mt0sYr7p3Kn8Ua8BWPvlURbhCOLmWq",
          "user-name":"buyer",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/marketplace/btk/buy`, {amountTobuy:this.state.amountTobuy,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleSell = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"Mt0sYr7p3Kn8Ua8BWPvlURbhCOLmWq",
          "user-name":"buyer",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/marketplace/btk/sell`, {amountTosell:this.state.amountTosell,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>User Balances</h2>
        <table>
        <tr>
          <th>User</th>
          <th>Balance</th>
        </tr>
        {
          this.state.balances
            .map(balance =>
              <tr key={balance.username}>
                <td>{balance.username}</td>
                <td>{balance.balance}</td>
              </tr>
            )
        }
        </table>

        <h2>Buy BTK</h2>
        <form onSubmit={this.handleBuy}>
          <div className='form-div'>
            <label className='token-mint-label'>Amount:</label>
            <input type="text" name="amountTobuy" onChange={this.handleChange}/>
            <button type="submit">Submit</button>
          </div>
        </form>

        <h2>Sell BTK</h2>
        <form onSubmit={this.handleSell}>
          <div className='form-div'>
            <label className='token-mint-label'>Amount:</label>
            <input type="text" name="amountTosell" onChange={this.handleChange}/>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    )
  }
}
