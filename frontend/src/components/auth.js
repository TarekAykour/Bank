import React, {useContext} from "react";
import {UserContext} from "./app"
import Login from "./login";

function Auth(){
    const user = useContext(UserContext)
    if(!user.logged){
        return (
            <Login/>
        )
    }    
}


export default Auth