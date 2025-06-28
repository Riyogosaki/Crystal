import { Route, Routes } from 'react-router-dom'
import Creating from './product/Creating.jsx'
import Prouduct from './product/Product.jsx'
import Home from './home/Home.jsx'
import Cart from './cart/Cart.jsx'
import Login from './auth/Login.jsx'
import CartPage from './cart/CartPage.jsx'
import Signup from './auth/Signup.jsx'
import Payment from './buy/Payment.jsx'

const App = () => {
  return (
    <div>
      
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        <Route path='/product/bracylete' element={<Prouduct></Prouduct>}></Route>
        <Route path='/creatingproduct' element={<Creating></Creating>}></Route>
        <Route path="/product/:id" element={<Cart></Cart>}></Route>
        <Route path='/cart' element={<CartPage></CartPage>}></Route>
        <Route path="/payment" element={<Payment></Payment>}></Route>
      </Routes>
    </div>
  )
}

export default App
