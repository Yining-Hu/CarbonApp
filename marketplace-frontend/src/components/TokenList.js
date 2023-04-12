import React from 'react';
import axios from 'axios';

export default class TokenList extends React.Component {
  state = {
    tokens:[]
  }

  delete_state = {
    tkid:''
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
    axios.get(`http://localhost:3000/digitaltwin/view/tokens`,apiConfig)
      .then(res => {
        const tokens = res.data;
        this.setState({ tokens });
      })
  }

  handleClick = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"rrJOuiTp22tVvaowz5Uw0DNUPDzwBF",
          "user-name":"seller",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/digitaltwin/seller/burn`, {tkid:this.state.tokens[0].tkid,gas:300000}, apiConfig)
      .then(res => {
        console.log(res.data);
      })
  }

  render() {
    return (
      <div>
        <h2>Display All Tokens</h2>
        <table>
        <tr>
          <th>Token ID</th>
          <th>Internal ID</th>
          <th>Datahash</th>
          <th>Recognition Result</th>
          <th>Verification Result</th>
          <th>Owner</th>
          <th>Action</th>
        </tr>
        {
          this.state.tokens
            .map(token =>
              <tr key={token.tkid}>
                <td>{token.tkid}</td>
                <td>{token.internal_id}</td>
                <td>{token.datahash}</td>
                <td>{token.recognition_result}</td>
                <td>{token.verification_result}</td>
                <td>{token.owner}</td>
                <td><button onClick={this.handleClick}>Delete</button></td>
              </tr>
            )
        }

        </table>
      </div>
    )
  }
}
