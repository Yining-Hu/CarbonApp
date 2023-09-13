import React from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom'

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class FeedDetail extends React.Component {
  state = {
    feed:[],
  }

  componentDidMount() {
    const feedid = this.props.params.feedid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/feed/view?feedid=`+feedid,apiConfig)
      .then(res => {
        const feed = res.data;
        this.setState({ feed });
      })
  }

  render() {
    return (
      <div>
        <h2>Feed Details</h2>
        {
          Object.keys(this.state.feed).map((key) => {
            return <p className='detail'>
              <b>{key}</b> {this.state.feed[key]}
            </p>
         })
        }
      </div>
    )
  }
}

export default withRouter(FeedDetail)
