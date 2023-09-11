import React from 'react';
import axios from 'axios';
import { parseTimestamp } from '../utils';

export default class Feed extends React.Component {
  state = {
    feeds:[],
    feedid:"",
    feedtype:"",
    claimstatus:"",
    herdid:"",
    dmi:"",
    datetime:"",
  }

  componentDidMount() {
    const apiConfig = {
      headers:{
          "user-name":"farmer",
          "api-key":"6RW3O2IIK9dskdrpanWhxfQVfmzxlT",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/feed/view/feeds`,apiConfig)
      .then(res => {
        const feeds = res.data;
        this.setState({ feeds });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleLog = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"farmer",
          "api-key":"6RW3O2IIK9dskdrpanWhxfQVfmzxlT",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/feed/log`, 
    {feedid:this.state.feedid,
     feedtype:this.state.feedtype,
     orderid:this.state.orderid,
     herdid:this.state.herdid,
     dmi:this.state.dmi,
     datetime:this.state.datetime,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Feed</h2>
        <table>
        <tr>
          <th>FeedID</th>
          <th>Feed Type</th>
          <th>OrderID</th>
          <th>HerdID</th>
          <th>DMI</th>
          <th>Datetime</th>
        </tr>
        {
          this.state.feeds
            .map(feed =>
              <tr key={feed.feedid}>
                <td>{feed.feedid}</td>
                <td>{feed.feedtype}</td>
                <td>{feed.orderid}</td>
                <td>{feed.herdid}</td>
                <td>{feed.dmi}</td>
                <td>{parseTimestamp(feed.datetime)}</td>
              </tr>
            )
        }
        </table>

        <h2>Log a Feed</h2>
        <form onSubmit={this.handleLog}>
          <div className='form-div'>
            <label className='label'>FeedID:</label>
            <input className='form-input' type="text" name="feedid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Feed Type:</label>
            <select name="feedtype" id="feedtype" onChange={this.handleChange}>
              <option value="0">Regular</option>
              <option value="1">Asparagopsis</option>
              <option value="2">Polygain</option>
          </select>
          </div>
          <div className='form-div'>
            <label className='label'>OrderID:</label>
            <input className='form-input' type="text" name="orderid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>HerdID:</label>
            <input className='form-input' type="text" name="herdid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>DMI:</label>
            <input className='form-input' type="text" name="dmi" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Datetime:</label>
            <input className='form-input' type="text" name="datetime" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}
