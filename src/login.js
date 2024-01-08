// import React, {useState} from "react";

// const Login = ({login}) => {
//     const [username, setUsername] = useState('')
//     const [password, setPassword] = useState('')

//     const submitHandler = (e) => {
//         e.preventDefault()
//         const credentials = {
//             username,
//             password
//         }
//         login(credentials)
//     }

//     return(
//         <div>
//             <form className="loginForm" onSubmit={submitHandler}>
//                 <label>
//                     Username: <input type="text" value={username} onChange={(e) => {setUsername(e.target.value)}}/>
//                 </label>
//                 <label>
//                     Password: <input type="password" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
//                 </label>
//                 <button type="submit">Login</button>
//             </form>
//         </div>
//     )

// }

// export default Login