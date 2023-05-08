import './App.css';
import AppRouter from './AppRouter';

function App() {
  return (
    <div className="App">
      <ul className='nav-list'>
        <li className='nav-list-item'><a href="http://localhost:3006"> Home </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/mint"> Mint </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/tokens"> Tokens </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/list"> List </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/products"> Products </a></li>
        <li className='nav-list-item'><a href="http://localhost:3006/btk"> BTK </a></li>
      </ul>
      <AppRouter/>
    </div>
  )
}
export default App;
