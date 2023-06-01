import './App.css';
import AppRouter from './AppRouter';

function App() {
  return (
    <div className="App">
      <ul className='nav-list'>
        <li className='nav-list-item'><a href="http://localhost:3007/sequence/user"> User Registration Sequence </a></li>
        <li className='nav-list-item'><a href="http://localhost:3007/sequence/emission"> Emission Trace Sequence </a></li>
      </ul>
      <AppRouter/>
    </div>
  )
}
export default App;
