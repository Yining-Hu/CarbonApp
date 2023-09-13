import React from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom'

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class DistributionDetail extends React.Component {
  state = {
    distribution:[],
  }

  componentDidMount() {
    const distributionid = this.props.params.distributionid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/cbt/view/distribution?distributionid=`+distributionid,apiConfig)
      .then(res => {
        const distribution = res.data;
        this.setState({ distribution });
      })
  }

  render() {
    return (
      <div>
        <h2>Distribution Details</h2>
        {
          Object.keys(this.state.distribution).map((key) => {
            return <p className='detail'>
              <b>{key}</b> {this.state.distribution[key]}
            </p>
         })
        }
      </div>
    )
  }
}

export default withRouter(DistributionDetail)
