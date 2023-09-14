import React from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom'
import { parseTimestamp } from '../../utils';

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class EmissionDetail extends React.Component {
  state = {
    emission:[],
  }

  componentDidMount() {
    const emissionid = this.props.params.emissionid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/emission/view?emissionid=`+emissionid,apiConfig)
      .then(res => {
        const emission = res.data;
        this.setState({ emission });
      })
  }

  render() {
    return (
      <div>
        <h2>Emission Details</h2>
        {
          Object.keys(this.state.emission).map((key) => {
            if (key==='datetime' | key==='blocktime') {
              return <p className='detail'>
                <b>{key}</b> {parseTimestamp(this.state.emission[key])}
              </p>
            } else {
              return <p className='detail'>
                <b>{key}</b> {this.state.emission[key]}
              </p>
            }
         })
        }
      </div>
    )
  }
}

export default withRouter(EmissionDetail)
