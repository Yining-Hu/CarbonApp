import React from 'react';
import axios from 'axios';

export default class Users extends React.Component {
  state = {
    users:[],
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
        const users = res.data;
        this.setState({ users });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleBuyerRegister = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"Mt0sYr7p3Kn8Ua8BWPvlURbhCOLmWq",
          "user-name":"buyer",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/marketplace/btk/register`, {gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleBuyerApprove = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"Mt0sYr7p3Kn8Ua8BWPvlURbhCOLmWq",
          "user-name":"buyer",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/btk/approve`, {spender:process.env.REACT_APP_MARKETPLACE,amount:200,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleSellerRegister = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"rrJOuiTp22tVvaowz5Uw0DNUPDzwBF",
          "user-name":"seller",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/marketplace/btk/register`, {gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleSellerApprove = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"rrJOuiTp22tVvaowz5Uw0DNUPDzwBF",
          "user-name":"seller",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/btk/approve`, {spender:process.env.REACT_APP_MARKETPLACE,amount:200,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>User Registration</h2>
        <form onSubmit={this.handleBuyerRegister}>
          <div className='form-div'>
            <label className='token-mint-label'>Username:</label>
            <input type="text" name="username" onChange={this.handleChange} />
            <button type="submit">Add</button>
          </div>
        </form>

        <h2>User Approval</h2>
        <table>
        <tr>
          <th>User</th>
          <th>Approval</th>
        </tr>
        {
          this.state.users
            .map(user =>
              <tr key={user.username}>
                <td>{user.username}</td>
                <td><button value={user.username} onClick={this.handleBuyerApprove}>Approve</button></td>

              </tr>
            )
        }
        </table>
      </div>
    )
  }
}
