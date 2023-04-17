import React from 'react';
import axios from 'axios';

export default class BTK extends React.Component {
  state = {
    balances:[]
  }

  handleLoad = event => {
    this.setState({
        ...this.state,
    })
  }

  render() {
    return (
      <div>
        <h2>BTK Balance</h2>
        <table>
        <tr>
          <th>User</th>
          <th>Balance</th>
        </tr>
        {
          this.state.balances
            .map(balance =>
              <tr key={balance.user}>
                <td>{balance.user}</td>
                <td>{balance.balance}</td>
              </tr>
            )
        }
        </table>

        <h2>Buy BTK</h2>
        <form onSubmit={this.handleSubmit}>
          <div className='form-div'>
            <label className='token-mint-label'>Amount to Buy:</label>
            <input type="text" name="amount_to_buy"/>
          </div>
          <div className='form-div'>
            <label className='token-mint-label'>To:</label>
            <input type="text" name="to"/>
          </div>
          <button type="submit">Add</button>
        </form>

        <h2>Sell BTK</h2>
      </div>
    )
  }
}
