import React, {useEffect,useState} from "react";
import { useHistory,Link } from "react-router-dom";
import CSRFToken from "./csrftoken"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEye, faEyeDropper, faEyeSlash} from "@fortawesome/free-solid-svg-icons"

function Login(){
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [error,setError] = useState()
    const history = useHistory()
    const [visible, setVisible] = useState(false)

    const handleChange = (event) => {
        if(event.target.name == "username"){
            setUsername(event.target.value)
        }
        else if(event.target.name == "password"){
            setPassword(event.target.value)
        }

    }
    
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

    const handleSubmit = (event) => {
        fetch('/api/login', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
                
                
            },
            body: JSON.stringify({
                username: username,
                password: password
               
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else if(res.status === 403){
                throw new Error('CSRF token missing')
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
          
        
       
        event.preventDefault()
        setTimeout(function(){
            setError()
        },5000)
    }



    function showPassword() {
        const passwords = document.getElementsByName('password')
        passwords.forEach(pp => {
            if(pp.getAttribute('type') === 'password'){
                pp.type = 'text'
                setVisible(true)
                
            }
             else {
                pp.type = 'password'
                setVisible(false)
            }
        })
        } 

    return (
    <div>
        <div className="page-name">
                <h2>Login</h2>
                <div className="underline"></div>
            </div>
        <form onSubmit={handleSubmit}>
            <CSRFToken/>
            <div class="form-group">
            <input className="form-control" type="text" name="username" placeholder="input username" onChange={handleChange}></input>
            </div>
            <div class="form-group">
            <input className="form-control" type="password" name="password" placeholder="password" onChange={handleChange}></input>
            {visible ? <FontAwesomeIcon className="eye" icon={faEyeSlash} onClick={showPassword}/> : <FontAwesomeIcon className="eye" icon={faEye} onClick={showPassword}/>}
            </div>
            
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
            <input  type="submit" value="submit" className="btn btn-primary" ></input>
        </form>
        <p>Dont have an account? <Link to="/register">register</Link></p>
    </div>
    )
}
 
export default Login