import React, { useEffect, useState,useContext } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import {UserContext} from "./app"
import CSRFToken from "./csrftoken"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faBars} from "@fortawesome/free-solid-svg-icons"

function Nav() {
    const user = useContext(UserContext)
    const [error,setError] = useState()
    const [open,setOpen] = useState(false)
    const history = useHistory()

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');
    
    
  
    

    function logout(e){
        fetch('/api/logout', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            }
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
             history.push("/")
             location.reload()
             return res.json();

           }    
          })
          .catch(err => {
            setError(JSON.parse(err.message)["error"]);
          });
          sessionStorage.removeItem('csrftoken');
          sessionStorage.removeItem('user');
          e.preventDefault()
    }
   


    const handleOpen = () => {
        if(open){
            setOpen(false)
        }
        else{
            setOpen(true)
        }
    }
    return (
        <div className="bottom-nav">
            <div className={open? "mobile-nav open-nav" : "mobile-nav closed-nav"}>
            <div className="logo">
                <img src="../../static/images/payfriendlogo.png" width="200px" onClick={()=> {
                    history.push('/') 
                    location.reload()}}></img>
            </div>
            <FontAwesomeIcon className={open ? "bars bars-open" : "bars bars-closed"} icon={faBars} size="3x" onClick={handleOpen}/>
            </div>

            <ul className={ open ? "navigation open" : "navigation closed"} >
                {/* <li>{user}</li> */}
                <li><Link to="/" onClick={handleOpen}>Home</Link></li>
                {user.logged === true ? 
                <li>
                <div>
                <li>
                    <Link to='/profile' onClick={handleOpen}>Profile</Link>
                </li>
                <li style={{height:'500px'}}>
                    <form onSubmit={logout}>
                        <CSRFToken/>
                        <input className="btn btn-danger" type="submit" value='logout'/>
                    </form>
                </li>
                    </div>
                    </li>
                    : 
                    <li>
                    <div>
                    <li> <Link to="/login" onClick={handleOpen}>Login</Link></li>
                    <li> <Link to="/register" onClick={handleOpen}>Register</Link></li> 
                    </div>
                    </li>
                    
                    }
            </ul>
         </div>
    )
}

export default Nav