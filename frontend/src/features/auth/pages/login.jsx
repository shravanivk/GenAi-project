import React from 'react'
import "../auth.form.scss"
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useState } from "react";
const Login = () => {
    const {loading,handleLogin}=useAuth()
    
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")

    const handleSubmit=async (e)=>{
        e.preventDefault()
        handleLogin({email,password})
    }

    if(loading){
      return(<main><h1>Loading...</h1></main>)
    }
  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
            onChange={(e)=>{setemail(e.target.value)}}
            type="email" id="email" name='email' placeholder='Enter email address' />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
            onChange={(e)=>{setpassword(e.target.value)}}
            type="password" id="password" name='password' placeholder='Enter password' />
          </div>

          <button type='submit' className='button primary-button'>Login</button>

        </form>
           <p>
    Dont have an account? <Link to="/register">Register</Link>
</p>
      </div>
    </main>
  )
}

export default Login