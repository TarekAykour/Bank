import React, {useState,useEffect,useContext} from "react";
import { useHistory,Link } from "react-router-dom";
import CSRFToken from "./csrftoken"
import {UserContext} from "./app"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowLeft, faListDots, faEllipsis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import TransactionForm from "./TransactionForm";

function Transactions(){
    const user = useContext(UserContext)
    const history = useHistory()
    const [transactions,setTransactions] = useState([{}])
    const [open,setOpen] = useState(false)
    const [symbol,setSymbol] = useState([{}])
    const [currency,setCurrency] = useState()
    const [searchField, setSearchField] = useState(false)
    const [search, setSearch] = useState()
    const [error,setError] = useState()


    // get all transactions of-/to user
    useEffect(()=> {
        fetch('/api/transactions')
        .then(res=> res.json())
        .then(data=> setTransactions(data))
        .catch(err=> setError(err))
    },{})

    // get currency
    useEffect(()=> {
        fetch(`https://restcountries.com/v3.1/name/${user.country}`)
        .then(response=> response.json())
        .then((data)=> {
            
            setCurrency(Object.keys(data[0]['currencies'])[0])
            setSymbol(Object.values(data[0]['currencies']))
            
        })
    }, {})
    
 
    return (
        open ? <TransactionForm isOpen={open} onClick={()=> setOpen(false)}/> :
        <div className="transactions-page">
            <head>
                <nav>
                    <div className="back">
                    <FontAwesomeIcon className="back-to-home" size="2x" icon={faArrowLeft} color="rgb(7,30,163)" onClick={()=> {
                        history.push('/')
                    }}/>
                    {searchField ? <input className="search-transactions" type="search" onChange={(e)=> {
                        setSearch(e.target.value.toLowerCase())
                    }}></input> : <h2>Checking account</h2>}
                    </div>
                    <div className="settings">
                        {/* go through all transactions of and to user */}
                        <FontAwesomeIcon icon={faSearch} onClick={()=>searchField ? setSearchField(false): setSearchField(true)} />
                        <FontAwesomeIcon icon={faEllipsisVertical} onClick={()=> {history.push('/profile')}} />
                    </div>
                </nav>
                <br></br>
                <div className="user-info">
                    <h2>{user.username}</h2>
                    <div className="data">
                        <p>{user.iban}</p>
                        <div>
                            <p>{currency}  <strong>{user.balance}</strong></p>
                        </div>
                    </div>
                    <div className="transaction-page-btns">
                        <button type="button" className="btn btn-primary" onClick={()=> {
                            open ? setOpen(false) : setOpen(true)
                        }}>Transfer</button>
                        <button type="button" className="btn btn-primary">Payment request</button>
                    </div>
                </div>
            </head>
            
            {/* the transactions */}
            <div className="transactions">
                {transactions.length > 0 ? transactions.filter((transaction)=> {
                    return JSON.stringify(transaction) == null  ?
                    transaction : JSON.stringify(transaction).toLowerCase().match(search)
                })
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
            {error ? <p className="alert alert-danger" role="alert">{error}</p> : ''}
        </div>
    )
}

export default Transactions;