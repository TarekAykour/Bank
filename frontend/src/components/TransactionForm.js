import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {useState,useEffect, useContext} from "react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import CSRFToken from "./csrftoken";
import {UserContext} from "./app"
import { useHistory } from "react-router-dom";


function TransactionForm(props){
    const userApp = useContext(UserContext)
    const [recipientName,setRecipientName] = useState()
    const [recipientIban,setRecipientIban] = useState()
    const [description, setDescription] = useState()
    const [search,setSearch] = useState()
    const [amount, setAmount] = useState()
    const [users,setUsers] = useState([])
    const [error,setError] = useState()
    let history = useHistory()
    //get users
    useEffect(() => {
       fetch('/api/users', {
        method: 'GET',
        
       })
       .then(res => res.json())
       .then(data => {
        setUsers(data)
       })
    }, []);

    

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



    //handle change
    const handleChange = (event) => {
        if(event.target.name === "amount"){
            setAmount(event.target.value)
        }
        
        else if(event.target.name === "iban"){
            setRecipientIban(event.target.value)
        }

        else if(event.target.name === "recipient"){
            setRecipientName(event.target.value)
        }
        
        else if(event.target.name === "description"){
            setDescription(event.target.value)
        }

        
    }
    
    const handleSubmit = (e) => {
        fetch('/api/transfer', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                recipientName: recipientName,
                iban_recipient: recipientIban,
                description: description 
            })
        })
        .then(res => {
            if(!res.ok) {
                return res.text().then(text => { throw new Error(text) })
             }

            else {
             history.push("/transactions")
             location.reload()
             return res.json();

           }    
          })
          .catch(err => {
             
             setError(JSON.parse(err.message)["error"])
          });

        e.preventDefault()
        setTimeout(function(){
            setError()
        },5000)
    }
   
    return(
        userApp.logged ? 
        <div className="make-transaction">
            <nav>
                <FontAwesomeIcon icon={faArrowLeft} onClick={props.onClick} size="2x" />
                <h2>Transfer</h2>
            </nav>
            <form onSubmit={handleSubmit}>
            <CSRFToken/>
            <div className="input-group mb-3">
            <input  className="form-control" type="text" placeholder="amount" name="amount" onChange={handleChange}></input>
            <div class="input-group-append">
                <span class="input-group-text" id="basic-addon2">EUR</span>
            </div>
            </div>
            {/* add filter function */}
            <div className="form-group">
            <input className="form-control" type="text" placeholder="Name recipient" name="recipient"  onChange={(e)=> {
                setSearch(e.target.value.toLocaleLowerCase())                    
            }}></input>
            <div className={search || users.includes(search) ? "CountriesDropdown displayed" : "CountriesDropdown hidden"}>
                    {users.filter((user)=> {
                   return user['username'].toLowerCase() == '' || user['username'].toLowerCase() == null
                   ? user
                   : user['username'].toLowerCase().includes(search)
                })
                .map((user)=> {
                    return (
                        <div className="country-row" value={user['cca2']} onClick={(e)=> {
                            document.querySelector('[name="recipient"]').value = user['username']
                            { user['iban'] != null ? document.querySelector('[name="iban"]').value = user['iban'] : document.querySelector('[name="iban"]').value = user['email']}
                            setRecipientName(user['username'])
                            setRecipientIban(user['iban'])
                            document.querySelector('.CountriesDropdown').classList.remove('displayed')
                            document.querySelector('.CountriesDropdown').classList.add('hidden')
                           
                            }}>
                            <p>{user['username']}</p>
                            
                        </div>
                    )
                })}
                </div>
            
            </div>
            <div className="form-group">
            <input className="form-control" type="text" placeholder="Iban" name="iban" onChange={handleChange}></input>
            </div>
            <div className="form-group">
                <textarea className="form-control" placeholder="description" onChange={handleChange}></textarea>
            </div>
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
            <input type="submit" value="Confirm" className="btn btn-primary"></input>
            </form>
        </div>
        :
        <div>not logged in</div>
    )
}

export default TransactionForm;