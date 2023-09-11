import React from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function withRouter(Component) {
  return props => <Component {...props} params={useNavigate()} />
}

class Farm extends React.Component {
  state = {
    farms:[],
    farmid:"",
    farmer:"",
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

    axios.get(`http://localhost:3000/farm/view/farms`,apiConfig)
      .then(res => {
        const farms = res.data;
        this.setState({ farms });
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleClick = event => {
    const {navigate} = this.props;
    navigate("/farmdetail/" + event.target.value);
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

    axios.post(`http://localhost:3000/farm/register`, 
    {farmid:this.state.farmid,
     farmer:this.state.farmer,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Farm</h2>
        <table>
        <tr>
          <th>FarmID</th>
          <th>Farmer</th>
        </tr>
        {
          this.state.farms
            .map(farm =>
              <tr key={farm.farmid}>
                <td>{farm.farmid} onClick={this.handleClick}</td>
                <td>{farm.farmer}</td>
              </tr>
            )
        }
        </table>

        <h2>Register a Farm</h2>
        <form onSubmit={this.handleRegister}>
          <div className='form-div'>
            <label className='label'>FarmID:</label>
            <input className='form-input' type="text" name="farmid" onChange={this.handleChange}/>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}

export default withRouter(Farm)