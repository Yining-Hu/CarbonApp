import React from 'react';
import axios from 'axios';

export default class TokenMint extends React.Component {
  state = {
    tkid:'',
    GTIN:'',
    net_weight:'',
    packaging_date:'',
    batch_num:'',
    serial_num:'',
    gas:300000
  }

  handleChange_tkid = event => {
    this.setState({ tkid: event.target.value });
  }

  handleChange_gtin = event => {
    this.setState({ GTIN: event.target.value });
  }

  handleChange_nw = event => {
    this.setState({ net_weight: event.target.value });
  }

  handleChange_pd = event => {
    this.setState({ packaging_date: event.target.value });
  }

  handleChange_batch = event => {
    this.setState({ batch_num: event.target.value });
  }

  handleChange_serial = event => {
    this.setState({ serial_num: event.target.value });
  }

  handleSubmit = event => {
    event.preventDefault();

    const formdata = {
      tkid: this.state.tkid,
      GTIN: this.state.GTIN,
      net_weight: this.state.net_weight,
      packaging_date: this.state.packaging_date,
      batch_num: this.state.batch_num,
      serial_num: this.state.serial_num,
      gas: this.state.gas
    };

    const apiConfig = {
      headers:{
          "api-key":"rrJOuiTp22tVvaowz5Uw0DNUPDzwBF",
          "user-name":"seller",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/digitaltwin/seller/mint`, formdata, apiConfig)
      .then(res => {
        console.log(res);
        console.log(res.data);
      })
  }

  render() {
    return (
      <div>
        <h2>Mint a Token</h2>
        <form onSubmit={this.handleSubmit}>
          <div className='form-div'>
            <label className='token-mint-label'>Token ID:</label>
            <input type="text" name="tkid" onChange={this.handleChange_tkid} />
          </div>
          <div className='form-div'>
            <label className='token-mint-label'>GTIN:</label>
            <input type="text" name="GTIN" onChange={this.handleChange_gtin} />
          </div>
          <div className='form-div'>
            <label className='token-mint-label'>Net Weight:</label>
            <input type="text" name="net_weight" onChange={this.handleChange_nw} />
          </div>          
          <div className='form-div'>
            <label className='token-mint-label'>Packaging Date:</label>
            <input type="text" name="packaging_date" onChange={this.handleChange_pd} />
          </div>
          <div className='form-div'>
            <label className='token-mint-label'>Batch Number:</label>
            <input type="text" name="batch_num" onChange={this.handleChange_batch} />
          </div>      
          <div className='form-div'>
            <label className='token-mint-label'>Serial Num:</label>
            <input type="text" name="serial_num" onChange={this.handleChange_serial} />
          </div>
          <button type="submit">Add</button>
        </form>
      </div>
    )
  }
}
