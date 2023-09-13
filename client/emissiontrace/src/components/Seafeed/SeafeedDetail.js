import React from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom'

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class OrderDetail extends React.Component {
  state = {
    order:[],
  }

  componentDidMount() {
    const orderid = this.props.params.orderid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/seafeed/view/saleorder?orderid=`+orderid,apiConfig)
      .then(res => {
        const order = res.data;
        this.setState({ order });
      })
  }

  render() {
    return (
      <div>
        <h2>Seafeed Order Details</h2>
        {
          Object.keys(this.state.order).map((key) => {
            return <p className='detail'>
              <b>{key}</b> {this.state.order[key]}
            </p>
         })
        }
      </div>
    )
  }
}

export default withRouter(OrderDetail)
