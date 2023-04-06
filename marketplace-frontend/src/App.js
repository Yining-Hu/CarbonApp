import './App.css';
import AppRouter from './AppRouter';

function App() {
  return (
    <div className="App">
      <ul className='nav-list'>
        <li className='nav-list-item'><a href="http://localhost:3006/home"> Home </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/mint"> TokenMint </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/list"> TokenList </a></li>
      </ul>
      <AppRouter/>
    </div>
  )
}
export default App;
