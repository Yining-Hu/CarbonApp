import React from 'react';
import axios from 'axios';

export default class CarbonToken extends React.Component {
  state = {
    cbts:[],
    carbontokenid:"",
    amount:"",
    feedids:"",
    projectid:"",
    distributionid:"",
    farmid:""
  }

  componentDidMount() {
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/cbt/view/cbtokens`,apiConfig)
      .then(res => {
        const cbts = res.data;
        this.setState({ cbts });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleIssue = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          "user-name":"beston",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/cbt/issue`, {cbtokenid:this.state.cbtokenid,amount:this.state.amount,feedids:this.state.feedids,projectid:this.state.projectid,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleDistribute = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          "user-name":"beston",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/cbt/distribute`, {cbtokenid:this.state.cbtokenid,distributionid:this.state.distributionid, farmid:this.state.farmid,amount:this.state.amount,gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Carbon Tokens</h2>
        <table>
        <tr>
          <th>CarbonTokenID</th>
          <th>ProjectID</th>
          <th>InternalID</th>
          <th>Amount</th>
        </tr>
        {
          this.state.cbts
            .map(cbt =>
              <tr key={cbt.cbtokenid}>
                <td>{cbt.cbtokenid}</td>
                <td>{cbt.projectid}</td>
                <td>{cbt.internalid}</td>
                <td>{cbt.amount}</td>
              </tr>
            )
        }
        </table>

        <h2>Issue Carbon Token</h2>
        <form onSubmit={this.handleIssue}>
          <div className='form-div'>
            <label className='cbtoken-label'>CarbonTokenID:</label>
            <input type="text" name="carbontokenid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Amount:</label>
            <input type="text" name="amount" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>FeedIDs:</label>
            <input type="text" name="feedids" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>ProjectID:</label>
            <input type="text" name="projectid" onChange={this.handleChange}/>
          </div>
            <button type="submit">Submit</button>
        </form>

        <h2>Distribute Carbon Token</h2>
        <form onSubmit={this.handleDistribute}>
          <div className='form-div'>
            <label className='cbtoken-label'>CarbonTokenID:</label>
            <input type="text" name="carbontokenid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>DistributionID:</label>
            <input type="text" name="distributionid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>FarmID:</label>
            <input type="text" name="farmid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Amount:</label>
            <input type="text" name="amount" onChange={this.handleChange}/>
          </div>
            <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}
