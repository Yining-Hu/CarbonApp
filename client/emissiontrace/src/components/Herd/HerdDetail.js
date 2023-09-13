import React from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom'

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class HerdDetail extends React.Component {
  state = {
    herd:[],
  }

  componentDidMount() {
    const herdid = this.props.params.herdid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/herd/view?herdid=`+herdid,apiConfig)
      .then(res => {
        const herd = res.data;
        this.setState({ herd });
      })
  }

  render() {
    return (
      <div>
        <h2>Herd Details</h2>
        {
          Object.keys(this.state.herd).map((key) => {
            return <p className='detail'>
              <b>{key}</b> {this.state.herd[key]}
            </p>
         })
        }
      </div>
    )
  }
}

export default withRouter(HerdDetail)
