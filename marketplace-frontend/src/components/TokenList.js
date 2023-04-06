import React from 'react';
import axios from 'axios';

export default class TokenList extends React.Component {
  state = {
    tokens: []
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

  render() {
    return (
      <div>
        <h2>Display All Tokens</h2>
        <ul>
        {
          this.state.tokens
            .map(token =>
              <li key={token.tkid}>{token.tkid}</li>
            )
        }
      </ul>
      </div>
    )
  }
}
