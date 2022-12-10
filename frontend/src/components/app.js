import React, { Component,useEffect, useState } from "react";
import { render } from "react-dom";
import Login from "./login"
import Register from "./register"
import Home from "./home"
import Nav from "./nav"
import Profile from "./profile";
import {BrowserRouter as Router, Switch, Route, Link, Redirect} from "react-router-dom"
import Auth from "./auth";
import Transactions from "./Transactions"







export const UserContext = React.createContext('user');
export const ThemeContext = React.createContext(false, ()=> {});

function App(){
    const [user, setUser] = useState({})
    const [dark, setDark] = useState(JSON.parse(localStorage.getItem('dark')))
    const value = {dark, setDark}

   
        useEffect(()=> {
        fetch('/api/user')
        .then((response)=> response.json())
        .then((data)=> {
            setUser(data)

        })
        }, {})
  
       
    // dark theme
    dark ? document.querySelector("body").classList.add('dark') : document.querySelector("#app").classList.remove('dark')

    return (
        
        <Router>
         <ThemeContext.Provider value={value}>
                <UserContext.Provider value={user}>
                <Nav/>
                <Switch>
                    <Route path='/' exact component={
                        user.logged ? Home : Login
                    } />
                    <Route path='/register' component={user.logged ? Home : Register}/>
                    <Route path='/login' component={user.logged ? Home : Login}/>
                    <Route path='/profile' component={user.logged ? Profile : Login}/>
                    <Route path="/transactions" component={user.logged ? Transactions : Login} />
                </Switch>
                </UserContext.Provider>
            </ThemeContext.Provider>
        </Router>
        
    
    
    )
    
}

const appDiv = document.getElementById('app');

render(< App/>, appDiv)


export default App