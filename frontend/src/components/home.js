import React, { useEffect, useContext, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import Nav from "./nav"
import {UserContext} from "./app"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInbox, faPlus, faSignOut, faTimes, faSignIn, faSignOutAlt, faBlackboard } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal"
import CSRFToken from "./csrftoken";





Modal.setAppElement('#app')

 // styling

 const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      color: 'black',
      background: 'white'
    },
  };


function Home() {
    let history = useHistory()
    const user = useContext(UserContext)
    const [symbol,setSymbol] = useState([{}])
    const [currency,setCurrency] = useState()
    const [modal,setModal] = useState(false)
    const [error,setError] = useState()
    const [amount,setAmount] = useState()
    const [withdraw, setWithdraw] = useState()
    const [transactions,setTransactions] = useState([{}])




    useEffect(()=> {
        fetch('/api/transactions')
        .then((response)=> response.json())
        .then((data)=> {
            setTransactions(data)

        })
        }, {})

    useEffect(()=> {
        fetch(`https://restcountries.com/v3.1/name/${user.country}`)
        .then(response=> response.json())
        .then((data)=> {
            setCurrency(Object.keys(data[0]['currencies'])[0])
            setSymbol(Object.values(data[0]['currencies']))
            
        })
    }, {})
    

    // cookie
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
        fetch(withdraw ?'/api/savings_remove' :'/api/savings_add', {
            credentials:'include', 
            method: 'POST',
            mode: 'same-origin',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
                
                
            },
            body: JSON.stringify({
                amount: parseFloat(amount)
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

    
    
   
    
    return (
        <div className="Home">
            <div className="transfer">
                <div className="transfer-to-saving">
                    {/* <FontAwesomeIcon icon={}/> */}
                </div>
            </div>
            <div className="balance" onClick={()=> {
                history.push('/transactions') 
            }}>
                <div className="currency">
                    <h2>Balance</h2>
                    <p>{currency}<span>({symbol[0].symbol})</span></p>
                </div>
                
                <div className="bank-info">

                <div className="balance-value">
                    <h5>{user.username}</h5>
                    <strong>{user.balance}</strong>
                </div>
                    <div className="iban">
                    {user.iban ? <p>{user.iban}</p> : <p>{user.email}</p>}
                    </div>
                </div>     

                
                </div>

            <div className="savings">
                <div className="title">
                    <h2>Savings</h2>
                    <div>
                    <FontAwesomeIcon style={{scale:'-1.1'}} icon={faSignIn} size="2x" className="faplus" onClick={()=> {
                        setModal(true)
                        setWithdraw(false)
                    }} />  
                
                    <FontAwesomeIcon style={{marginLeft: '25px'}} icon={faSignOut} size="2x" className="faplus" onClick={()=> {
                        setModal(true)
                        setWithdraw(true)
                    }} />  
                    </div>
                </div>
                <div className="savings-info">
                    <p>{user.username}</p>
                    <div className="user-and-value">
                    <p>{currency}</p>
                    <h4><strong>{parseFloat(user.savings)}</strong></h4>
                    </div>
                </div>
                </div>

                <Modal id="modal" isOpen={modal} style={customStyles}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <FontAwesomeIcon icon={faArrowLeft} onClick={()=> setModal(false)} size="2x" />
                        <h2 style={{fontSize: '19px', fontWeight: 'bold', marginLeft: '25px', textAlign: 'center'}}>{withdraw ? 'withdraw' : 'invest'}</h2>
                    </div>
                    <form onSubmit={handleSubmit} style={{marginTop: '25px', display: 'flex', flexDirection: 'row', justifyContent: "space-evenly"}}>
                        <CSRFToken/>
                        <input type="text" name="amount" placeholder="put in amount" onChange={(event)=> setAmount(event.target.value)}></input>
                        {withdraw ? <input type="submit" name="add_savings" value="withdraw" className="btn btn-danger" />  : <input type="submit" name="add_savings" value="invest" className="btn btn-primary" />}
                    </form>
                    {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
                </Modal>

            <div className="recent-transactions" style={{width: '95%', margin: 'auto', overflowY: 'scroll', marginTop: '25px'}}>
            <div>
                <h2 style={{fontWeight: 'bold', fontSize: '19px'}}>Recent Transactions</h2>
                <div className="underline"></div>
            </div>
            {transactions.length > 0 ? transactions.slice(0,3)
                .map((transaction)=> {
                      return ( 
                        <div className="transaction">
                            <div className="transaction-header">
                                <p>{transaction['timestamp']}</p>
                                <p>{currency}</p>
                            </div>
                            <div className="transaction-data">
                                <p>{transaction['send'] ? transaction['recipient'] : transaction['sender']}</p>
                                <h2>{ transaction['send'] ? <div>- {transaction['amount']}</div> : <div className="received-transaction">+ {transaction['amount']}</div>}</h2>
                            </div>
                        </div>
                       ) 
                      }) : <div>no transactions</div>} 
            </div>
        </div>
       
    )
}

export default Home