import React from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function withRouter(Component) {
  return props => <Component {...props} navigation={useNavigate()} />
}

class CarbonToken extends React.Component {
  state = {
    cbts:[],
    distributions:[],
    carbontokenid:"",
    amount:"",
    name:"",
    feedids:[{name:""}],
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

    axios.get(`http://localhost:3000/cbt/view/distributions`,apiConfig)
      .then(res => {
        const distributions = res.data;
        this.setState({ distributions });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleCbtokenClick = (cbtokenid) => {
    this.props.navigation("/cbtokendetail/" + cbtokenid)
  }

  handleDistributionClick = (distributionid) => {
    this.props.navigation("/distributiondetail/" + distributionid)
  }

  handleFeedIDChange = (idx) => (evt) => {
    const newFeeds = this.state.feedids.map((feedid, fidx) => {
      if (idx !== fidx) return feedid;
      return { ...feedid, name: evt.target.value };
    });

    this.setState({ feedids: newFeeds });
  };

  handleAddFeed = () => {
    this.setState({
      feedids: this.state.feedids.concat([{ name: "" }]),
    });
  };

  handleRemoveFeed = (idx) => () => {
    this.setState({
      feedids: this.state.feedids.filter((s, fidx) => idx !== fidx),
    });
  };

  handleIssue = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/cbt/issue`, 
    {cbtokenid:this.state.carbontokenid,
     amount:this.state.amount,
     feedids:this.state.feedids.map(a => a.name),
     projectid:this.state.projectid,
     gas:300000}, apiConfig)
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

    axios.post(`http://localhost:3000/cbt/distribute`, 
    {cbtokenid:this.state.carbontokenid,
     distributionid:this.state.distributionid,
     farmid:this.state.farmid,
     amount:this.state.amount,
     gas:300000}, apiConfig)
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
          <th>Details</th>
        </tr>
        {
          this.state.cbts
            .map(cbt =>
              <tr key={cbt.cbtokenid}>
                <td>{cbt.cbtokenid}</td>
                <td>{cbt.projectid}</td>
                <td>{cbt.internalid}</td>
                <td>{cbt.amount}</td>
                <td><button onClick={() => this.handleCbtokenClick(cbt.cbtokenid)}>View</button></td>
              </tr>
            )
        }
        </table>

        <h2>Carbon Token Distributions</h2>
        <table>
        <tr>
          <th>DistributionID</th>
          <th>CarbonTokenID</th>
          <th>Amount</th>
          <th>Farmer Blockchain Account</th>
          <th>Paid</th>
          <th>Details</th>
        </tr>
        {
          this.state.distributions
            .map(distribution =>
              <tr key={distribution.distributionid}>
                <td>{distribution.distributionid}</td>
                <td>{distribution.cbtokenid}</td>
                <td>{distribution.amount}</td>
                <td>{distribution.farmer}</td>
                <td>{String(distribution.paid)}</td>
                <td><button onClick={() => this.handleDistributionClick(distribution.distributionid)}>View</button></td>
              </tr>
            )
        }
        </table>

        <h2>Issue Carbon Token</h2>
        <form onSubmit={this.handleIssue}>
          <div className='form-div'>
            <label className='label'>CarbonTokenID:</label>
            <input className='form-input' type="text" name="carbontokenid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Amount:</label>
            <input className='form-input' type="text" name="amount" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            {this.state.feedids.map((feedid, idx) => (
              <div className='form-div'>
                <label className='label'>FeedIDs:</label>
                <input className='form-input'
                  type="text"
                  placeholder={`feed${idx + 1}`}
                  value={feedid.name}
                  onChange={this.handleFeedIDChange(idx)}
                />
                <button type="button" onClick={this.handleAddFeed} className="small">
                  +
                </button>
                <button type="button" onClick={this.handleRemoveFeed(idx)} className="small">
                  -
                </button>
              </div>
            ))}
          </div>
          <div className='form-div'>
            <label className='label'>ProjectID:</label>
            <input className='form-input' type="text" name="projectid" onChange={this.handleChange}/>
          </div>
            <button type="submit">Submit</button>
        </form>

        <h2>Distribute Carbon Token</h2>
        <form onSubmit={this.handleDistribute}>
          <div className='form-div'>
            <label className='label'>CarbonTokenID:</label>
            <input className='form-input' type="text" name="carbontokenid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>DistributionID:</label>
            <input className='form-input' type="text" name="distributionid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Farmer Blockchain Account:</label>
            <input className='form-input' type="text" name="farmer" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Amount:</label>
            <input className='form-input' type="text" name="amount" onChange={this.handleChange}/>
          </div>
            <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}

export default withRouter(CarbonToken)
