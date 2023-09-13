import React from 'react';
import axios from 'axios';
// import Grid from '@mui/material/Grid'
import {useParams} from 'react-router-dom'

function withRouter(Component) {
  return props => <Component {...props} params={useParams()} />
}

class FarmDetail extends React.Component {
  state = {
    farm:[],
  }

  componentDidMount() {
    const farmid = this.props.params.farmid;
    const apiConfig = {
      headers:{
          "user-name":"beston",
          "api-key":"dTR4EeuqZgPcW6dAvv1Ka7805Sht6P",
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
      },
    }

    axios.get(`http://localhost:3000/farm/view?farmid=`+farmid,apiConfig)
      .then(res => {
        const farm = res.data;
        this.setState({ farm });
      })
  }

  render() {
    return (
      <div>
        <h2>Farm Details</h2>
        {
          Object.keys(this.state.farm).map((key) => {
            // return <Grid container spacing={0} alignItems="center" justifyContent="center">
            //         <Grid item xs={1} className="detail" fontFamily="Segoe UI" fontSize={22}>{ key }</Grid>
            //         <Grid item xs={1} className="detail" fontSize={22}>{ this.state.farm[key] }</Grid>
            //        </Grid>
            return <p className='detail'>
              <b>{key}</b> {this.state.farm[key]}
            </p>
         })
        }
      </div>
    )
  }
}

export default withRouter(FarmDetail)
