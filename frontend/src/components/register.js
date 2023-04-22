import React, {useEffect,useState} from "react";
import { useHistory, Link } from "react-router-dom";
import CSRFToken from "./csrftoken"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEye, faEyeDropper, faEyeSlash} from "@fortawesome/free-solid-svg-icons"

function Register(){
    const [username, setUsername] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [confirmation, setConfirmation] = useState()
    const [error,setError] = useState()
    const [visible, setVisible] = useState(false)
    const [countries,setCountries] = useState([])
    const [countryState, setCountry] = useState('')
    const [search,setSearch] = useState()
    let history = useHistory()


    // api
    useEffect(()=> {
        fetch('https://restcountries.com/v3.1/all')
        .then(response => (response.json()))
        .then(data => {
            setCountries(data)
        })
    }, {})
    

    // show password

    // HASH PASSWORDS TOO!
    const handleChange = (event) => {
        if(event.target.name === "username"){
            setUsername(event.target.value)
        }
        else if(event.target.name === "email"){
            setEmail(event.target.value)
        }
        else if(event.target.name === "password"){
            setPassword(event.target.value)
        }
        else if(event.target.name === "confirmation"){
            setConfirmation(event.target.value)
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
        fetch('/api/register', {
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
                email: email,
                password: password,
                confirmation: confirmation,
                country: countryState
            })
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
        <div className="register-form">
            <div className="page-name">
                <h2>Register</h2>
                <div className="underline"></div>
            </div>
            <form onSubmit={handleSubmit}>
                <CSRFToken/>
                <div class="form-group">
                <label className="label">Fill username *</label>
                <input className="form-control" type="text" name="username" placeholder="input username" onChange={handleChange}></input>
                </div>
                <div class="form-group">
                <label>Select Email*</label>
                <input className="form-control" type="email" name="email" placeholder="input email"  onChange={handleChange}></input>
                </div>

                <div class="form-group">
                <label>Select country *</label>
                <input className="form-control" type="text" name="country" placeholder="input country"   onChange={(e)=> {
                    setSearch(e.target.value.toLocaleLowerCase())                    
                    }}></input>
                <div className={search || countries.includes(search) ? "CountriesDropdown displayed" : "CountriesDropdown hidden"}>
                    {countries.filter((country)=> {
                   return country['name']['common'].toLowerCase() == '' || country['name']['common'].toLowerCase() == null
                   ? country
                   : country['name']['common'].toLowerCase().includes(search)
                })
                .map((country)=> {
                    return (
                        <div className="country-row" value={country['cca2']} onClick={(e)=> {
                            document.querySelector('[name="country"]').value = country['name']['common']
                            setCountry(country['name']['common'])
                            document.querySelector('.CountriesDropdown').classList.remove('displayed')
                            document.querySelector('.CountriesDropdown').classList.add('hidden')
                           
                            }}>
                            <p>{country['name']['common']}  {country['flag']}</p>
                            
                        </div>
                    )
                })}
                </div>
                </div>

                <div class="form-group">
                
                <label>Fill password *</label>
                <div className="eye-container">
                <input id="password" className="form-control" type="password" name="password" placeholder="password"  onChange={handleChange}></input>
                {visible ? <FontAwesomeIcon className="eye" icon={faEyeSlash} onClick={showPassword}/> : <FontAwesomeIcon className="eye" icon={faEye} onClick={showPassword}/>}
                </div>
                </div>
                <div class="form-group">
                <label>Confirm password *</label>
                <input className="form-control" type="password" name="confirmation" placeholder="confirm password"  onChange={handleChange}></input>
                </div>
                {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
                <input type="submit" value="submit" className="btn btn-primary"></input>
            </form>
            <p>Already have an account? <Link to="/login">login</Link></p>
            
    </div>
    )
}

export default Register