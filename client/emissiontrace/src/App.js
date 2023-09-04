import './App.css';
import AppRouter from './AppRouter';

function App() {
  return (
    <div className="App">
      <ul className='nav-list'>
        {/* <li className='nav-list-item'><a href="http://localhost:3007/sequence/user"> User Registration Sequence </a></li> */}
        {/* <li className='nav-list-item'><a href="http://localhost:3007/sequence/emission"> Emission Trace Sequence </a></li> */}
        <li className='nav-list-item'><a href="http://localhost:3007/farm"> Farm </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/herd"> Herd </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/project"> Project </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/seafeed"> Seafeed </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/feed"> Feed Tracking </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/emission"> Emission Tracking </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/carbontoken"> Carbon Token </a></li>
      </ul>
      <AppRouter/>
    </div>
  )
}
export default App;
