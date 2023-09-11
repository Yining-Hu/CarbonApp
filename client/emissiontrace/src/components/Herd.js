import React from 'react';
import axios from 'axios';

export default class Herd extends React.Component {
  state = {
    herds:[],
    herdid:"",
    farmid:"",
    num_of_animals:"",
    days_on_farm:"",
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

    axios.get(`http://localhost:3000/herd/view/herds`,apiConfig)
      .then(res => {
        const herds = res.data;
        this.setState({ herds });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleRegister = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "user-name":"farmer",
          "api-key":"6RW3O2IIK9dskdrpanWhxfQVfmzxlT",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/herd/register`, 
    {herdid:this.state.herdid,
     farmid:this.state.farmid,
     num_of_animals:this.state.num_of_animals,
     days_on_farm:this.state.days_on_farm,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Herd</h2>
        <table>
        <tr>
          <th>HerID</th>
          <th>FarmID</th>
          <th>Number of Animals</th>
          <th>Days on Farm</th>
        </tr>
        {
          this.state.herds
            .map(herd =>
              <tr key={herd.herdid}>
                <td>{herd.herdid}</td>
                <td>{herd.farmid}</td>
                <td>{herd.num_of_animals}</td>
                <td>{herd.days_on_farm}</td>
              </tr>
            )
        }
        </table>

        <h2>Register a Herd</h2>
        <form onSubmit={this.handleRegister}>
          <div className='form-div'>
            <label className='label'>HerID:</label>
            <input className='form-input' type="text" name="herdid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>FarmID:</label>
            <input className='form-input' type="text" name="farmid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Number of Animals:</label>
            <input className='form-input' type="text" name="num_of_animals" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='label'>Days on Farm:</label>
            <input className='form-input' type="text" name="days_on_farm" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}
