import React from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom'

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class ProjectDetail extends React.Component {
  state = {
    project:[],
  }

  componentDidMount() {
    const projectid = this.props.params.projectid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/project/view?projectid=`+projectid,apiConfig)
      .then(res => {
        const project = res.data;
        this.setState({ project });
      })
  }

  render() {
    return (
      <div>
        <h2>Project Details</h2>
        {
          Object.keys(this.state.project).map((key) => {
            return <p className='detail'>
              <b>{key}</b> {this.state.project[key]}
            </p>
         })
        }
      </div>
    )
  }
}

export default withRouter(ProjectDetail)
