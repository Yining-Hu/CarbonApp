import React from 'react';
import axios from 'axios';
import { parseTimestamp } from '../utils';

export default class Project extends React.Component {
  state = {
    projects:[],
    projectid:"",
    baselinestart:"",
    baselineend:"",
    projectstart:"",
    projectend:"",
    name:"",
    herds:[{name:""}],
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

    axios.get(`http://localhost:3000/project/view/projects`,apiConfig)
      .then(res => {
        const projects = res.data;
        this.setState({ projects });
        console.log(projects[2].herds)
      })
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    })
  }

  handleHerdNameChange = (idx) => (evt) => {
    const newHerds = this.state.herds.map((herd, hidx) => {
      if (idx !== hidx) return herd;
      return { ...herd, name: evt.target.value };
    });

    this.setState({ herds: newHerds });
  };

  handleAddHerd = () => {
    this.setState({
      herds: this.state.herds.concat([{ name: "" }]),
    });
  };

  handleRemoveHerd = (idx) => () => {
    this.setState({
      herds: this.state.herds.filter((s, hidx) => idx !== hidx),
    });
  };

  // handleArrayInput = event => {
  //   this.setState({
  //     ...this.state,
  //     [event.target.name]: (event.target.value).split(','),
  //   })
  // }

  handleRegister = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          "user-name":"beston",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/project/register`, 
    {projectid:this.state.projectid,
     baselinestart:this.state.baselinestart,
     baselineend:this.state.baselineend,
     projectstart:this.state.projectstart,
     projectend:this.state.projectend,
     herds:this.state.herds,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  handleUpdate = event => {
    event.preventDefault();

    const apiConfig = {
      headers:{
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          "user-name":"beston",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.post(`http://localhost:3000/project/add/herds`, 
    {projectid:this.state.projectid,
     herdids:this.state.herds,
     gas:300000}, apiConfig)
    .then(res => {
      console.log(res.data);
    })
  };

  render() {
    return (
      <div>
        <h2>Carbon Projects</h2>
        <table>
        <tr>
          <th>ProjectID</th>
          <th>Baseline Start</th>
          <th>Baseline End</th>
          <th>Project Start</th>
          <th>Project End</th>
          <th>Herds</th>
        </tr>
        {
          this.state.projects
            .map(project =>
              <tr key={project.projectid}>
                <td>{project.projectid}</td>
                <td>{parseTimestamp(project.baselinestart)}</td>
                <td>{parseTimestamp(project.baselineend)}</td>
                <td>{parseTimestamp(project.projectstart)}</td>
                <td>{parseTimestamp(project.projectend)}</td>
                <td>{(project.herds).toString()}</td>
              </tr>
            )
        }
        </table>

        <h2>Register a Carbon Offset Project</h2>
        <form onSubmit={this.handleRegister}>
          <div className='form-div'>
            <label className='cbtoken-label'>ProjectID:</label>
            <input type="text" name="projectid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Baseline Start:</label>
            <input type="text" name="baselinestart" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Baseline End:</label>
            <input type="text" name="baselineend" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>Project start:</label>
            <input type="text" name="projectstart" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
            <label className='cbtoken-label'>ProjectID:</label>
            <input type="text" name="projectend" onChange={this.handleChange}/>
          </div>
          {/* <div className='form-div'>
            <label className='cbtoken-label'>Herds:</label>
            <input type="text" name="herd" onChange={this.handleArrayInput}/>
          </div> */}
          <button type="submit">Submit</button>
        </form>

        <h2>Add Herds to a Carbon Offset Project</h2>
        <form onSubmit={this.handleUpdate}>
          <div className='form-div'>
            <label className='cbtoken-label'>ProjectID:</label>
            <input type="text" name="projectid" onChange={this.handleChange}/>
          </div>
          <div className='form-div'>
              {this.state.herds.map((herd, idx) => (
                <div className='form-div'>
                  <label className='cbtoken-label'>Herd:</label>
                  <input
                    type="text"
                    placeholder={`Herd #${idx + 1} id`}
                    value={herd.name}
                    onChange={this.handleHerdNameChange(idx)}
                  />
                  <button type="button" onClick={this.handleAddHerd} className="small">
                    +
                  </button>
                  <button type="button" onClick={this.handleRemoveHerd(idx)} className="small">
                    -
                  </button>
                </div>
              ))}
            </div>
            <button type="submit">Update</button>
          </form>
      </div>
    )
  }
}
