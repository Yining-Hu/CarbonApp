import React from 'react';
import axios from 'axios';
import { parseTimestamp } from '../../utils';
import { useNavigate } from "react-router-dom";

function withRouter(Component) {
  return props => <Component {...props} navigation={useNavigate()} />
}

class Emission extends React.Component {
  state = {
    emissions:[],
    emissionid:"",
    herdid:"",
    amount:"",
    feedtype:"",
    datetime:"",
    blocktime:"",
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

    axios.get(`http://localhost:3000/emission/view/emissions`,apiConfig)
      .then(res => {
        const emissions = res.data;
        this.setState({ emissions });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleClick = (emissionid) => {
    this.props.navigation("/emissiondetail/" + emissionid)
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

    axios.post(`http://localhost:3000/emission/log`, 
    {emissionid:this.state.emissionid,
     amount: this.state.amount,
     feedtype:this.state.feedtype,
     herdid:this.state.herdid,
     datetime:this.state.datetime,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Emission</h2>
        <table>
        <tr>
          <th>EmissionID</th>
          <th>HerdID</th>
          <th>Amount</th>
          <th>FeedType</th>
          <th>Datetime</th>
          <th>Blocktime</th>
          <th>Details</th>
        </tr>
        {
          this.state.emissions
            .map(emission =>
              <tr key={emission.emissionid}>
                <td>{emission.emissionid}</td>
                <td>{emission.herdid}</td>
                <td>{emission.amount}</td>
                <td>{emission.feedtype}</td>
                <td>{parseTimestamp(emission.datetime)}</td>
                <td>{parseTimestamp(emission.blocktime)}</td>
                <td><button onClick={() => this.handleClick(emission.emissionid)}>View</button></td>
              </tr>
            )
        }
        </table>

        <h2>Log an Emission</h2>
        <form onSubmit={this.handleLog}>
          <div className='form-div'>
            <label className='label'>EmissionID:</label>
            <input className='form-input' type="text" name="emissionid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Amount:</label>
            <input className='form-input' type="text" name="amount" onChange={this.handleChange}/>
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
            <label className='label'>HerdID:</label>
            <input className='form-input' type="text" name="herdid" onChange={this.handleChange}/>
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

export default withRouter(Emission)