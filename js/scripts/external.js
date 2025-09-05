const minus_btn = document.getElementById('minus_btn');
const sum = document.getElementById('sum');
const n1 = document.getElementById('num1');
const n2 = document.getElementById('num2');

function sense_chk(value){
    if(typeof value === 'number' && !isNaN(value)){ return true; }else{ return false; }
}

minus_btn.addEventListener('click', e => {
    const val1 = Number(n1.value);
    const val2 = Number(n2.value);

    if(sense_chk(val1) && sense_chk(val2)){
        const result = val1 - val2;
        sum.innerText = '뺀거 : ' + result;
    }else{
        window.alert('숫자 똑바로넣으슈');
        sum.innerText = '계산불가';
    }
});


