

 const radius =[3 ,1 ,2 ,4]

  const formula=(radius)=>{
   return Math.PI*radius*radius

 }

 const calculate = (radius ,formula) =>{
    const output=[]
    for(let i=0 ;i<radius.length ;i++){

        output.push(formula(radius[i]))
    }
    return output
 }



 console.log(calculate(radius ,formula))