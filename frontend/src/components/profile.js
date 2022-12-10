import { faArrowAltCircleLeft, faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {useContext,useState} from "react";
import {ThemeContext, UserContext} from "./app"
import Error from "./Error";
import { useHistory, Link } from "react-router-dom";
import Modal from 'react-modal';
import CSRFToken from "./csrftoken";



function Profile(){
    const user = useContext(UserContext)
    const {dark, setDark} = useContext(ThemeContext)
    const history = useHistory()

    const [email,setEmail] = useState(user.email)
    const [adress,setAdress] = useState(user.country)
    const [username,setUsername] = useState(user.username)

    // open input fields
    const [openEmail,setEmailOpen] = useState(false)
    const [openUser,setUsernameOpen] = useState(false)
    const [openAdress,setAdressOpen] = useState(false)

    const [error,setError] = useState()

    const [deleteQuestion, setDeleteQuestion] = useState(false)




    const handleChange = (event) => {
        if(event.target.name == "email"){
            setEmail(event.target.value)
        }
        else if (event.target.name =="username"){
            setUsername(event.target.value)
        }
        else if (event.target.name =="adress"){
            setAdress(event.target.value)
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
        fetch(`/api/update_user/${user.id}`, {
            credentials:'include', 
            method: 'PUT',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                username: username,
                adress: adress,
                email: email
            })
        }) 
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }
            else {
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

        setAdressOpen(false)
        setEmailOpen(false)
        setUsernameOpen(false)
    }



    const deleteAccount = (event) => {
        fetch(`/api/delete_user/${user.id}`, {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
                
                
            },
        })
        
        event.preventDefault()
    }
    





    return (
        <div>
        {
        user.logged ?  
        <div className={open ? "profile profile-closed" : "profile profile-open"}>
            <nav>
                <FontAwesomeIcon icon={faArrowLeft} onClick={()=> {
                    history.push('/transactions')
                }}  />
                <h2>Personal Data</h2>
            </nav>

            <div className="info">
                
                {/* change name */}
                <div className="change name">
                    <h2>Name</h2>
                    {
                    openUser ? 
                    <div>
                        <input type="text" value={username} name="username" onChange={handleChange} />
                        <button className="btn btn-danger" onClick={()=> {
                            setUsernameOpen(false)
                        }}>Cancel</button>
                        <form onSubmit={handleSubmit}>
                        <CSRFToken/>
                        <input type="submit" value="Confirm" className="btn btn-success"/>
                        </form>
                    </div> 
                    :
                    <div>      
                    <p>{user.username}</p>
                    <a href="#" id="changeUsername" onClick={()=> {
                        setUsernameOpen(true)
                    }}>Change</a>
                    </div>
                    }
                </div>

                {/* change adress */}
                <div className="change adress">
                    <h2>Adress</h2>
                    {
                     openAdress ? 
                     <div>
                         <input type="text" value={adress} name="adress" onChange={handleChange} />
                         <button className="btn btn-danger" onClick={()=> {
                             setAdressOpen(false)
                         }}>Cancel</button>
                         <form onSubmit={handleSubmit}>
                            <CSRFToken/>
                            <input type="submit" value="Confirm" className="btn btn-success"/>
                         </form>
                     </div> 
                     :
                    <div>
                    <p>{user.country}</p>
                    <a id="changeCountry" href="#" onClick={()=> {
                        setAdressOpen(true)
                    }}>Change</a>
                    </div>
                    }
                </div>

               {/* Change email */}
                <div className="change email">
                <h2>Email</h2>
                { openEmail ? 
                <div>
                    <input type="email" value={email} name="email" onChange={handleChange} />
                         <button className="btn btn-danger" onClick={()=> {
                             setEmailOpen(false)
                         }}>Cancel</button>
                         <form onSubmit={handleSubmit}>
                            <CSRFToken/>
                         <input type="submit" value="Confirm" className="btn btn-success"/>
                         </form>
                </div>
                : 
                    <div>
                    <p>{user.email}</p>
                    <a id="changeEmail" href="#" onClick={()=> {
                        setEmailOpen(true)
                    }}>Change</a>
                    </div>
                      }
                </div>
              
                
            </div>
            
            <div style={{display: 'flex' , flexDirection: 'column', width: '75%', margin: 'auto'}} >
                { dark ? <button style={{marginBottom: '15px'}} className="btn btn-outline-light" onClick={()=> {
                 setDark(localStorage.setItem('dark', JSON.stringify(false)))
                 location.reload()}}>Light mode</button> : <button style={{marginBottom: '15px'}} className="btn btn-dark" onClick={()=>{
                  localStorage.setItem('dark', JSON.stringify(true))
                  location.reload()
                  
                }}>Dark mode</button> }
                {
                deleteQuestion 
                ? 
                <div>
                <h2 style={{fontSize:'19px', fontWeight: 'bold', textAlign: 'center'}}>Are you sure you want to delete your account ?</h2>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <button type="button" className="btn btn-primary" onClick={()=> setDeleteQuestion(false)}>Cancel</button>
                    <form onSubmit={deleteAccount}>
                        <CSRFToken/>
                        <button type="submit" className="btn btn-danger">delete user</button>
                        </form>
                </div> 
                </div>
                :
                <button className="btn btn-outline-danger" onClick={()=> setDeleteQuestion(true)}>Delete account</button>
                }
            </div>
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
        </div> 
        
        :  <Error/>}
    
        </div>
    )
       
        
    
}


export default Profile