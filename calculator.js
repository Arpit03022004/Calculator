function add(a , b ){
    return a + b ;

}

function sub(a , b ){
    return a - b ;
    
}

function multiply(a , b ){
    return a * b ;
    
}

function division(a , b){
    if(b==0){
        throw new Error ('Divisor cant be zero') ;
    }
    else{
        const quotient = Math.floor(a/b);
        const remainder = a%b ;
        return { quotient , remainder} ;
    }
}

module.exports = {
    add,
    sub,
    multiply,
    division
}