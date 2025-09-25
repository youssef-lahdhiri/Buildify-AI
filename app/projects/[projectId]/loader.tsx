"use client"
import { useEffect, useState } from "react";

const Loading = () => {
    const [timer,setTimer]=useState(10)
    useEffect(()=>{
        const id=setInterval(()=>{setTimer((prev)=>prev+0.1);console.log(timer)},40)
        
return()=>clearInterval(id)
    },[timer])
    return ( 
        <div className="w-full h-full flex items-center justify-center">  
        <div className="flex flex-col text-center"> 
            <p>ca 2mn</p>
            <div className=" rounded-full  relative bg-[#c7c7d6]/40 w-40 h-4">
                <div style={{width: `${Math.min(timer,100)}%`}} className={`  rounded-full  absolute bg-[#c7c7d6] top-0 left-0 h-4 duration-1000  `}>         </div>
            </div></div>
        </div>
     );
}
 
export default Loading;