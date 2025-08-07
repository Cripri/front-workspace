const cards = {
    test_ready: testReadyComp(),
    test_wait: document.getElementById('test-wait'),
    test_wait_click: document.getElementById('test-wait-click'),
    test_clicked: document.getElementById('test-clicked'),
    test_record: document.getElementById('test-record')
};
const main = document.getElementById('main');
const progressBar = document.getElementById('progress-bar');


function replaceCard(card){
    // firstChild는 첫 번째 노드를 가져온다 (텍스트 노드도 포함)
    // firstElementChild는 첫 번째 요소를 가져온다
    const currCard = main.firstElementChild;

    main.replaceChild(card, currCard);
}



function testReadyComp(){
    const wrapper = document.createElement('div');
    wrapper.id = 'test-ready';

    const icon = document.createElement('div');
    icon.classList.add('main-icon');
    wrapper.appendChild(icon);

    const title = document.createElement('div');
    const titleText = document.createTextNode('React Time Test');
    title.classList.add('title');
    title.appendChild(titleText);
    wrapper.appendChild(title);

    const button = document.createElement('div');
    const buttonText = document.createTextNode('Start');
    button.id = 'start-button';
    button.classList.add('test-start-button');
    button.appendChild(buttonText);
    wrapper.appendChild(button);
    
    return wrapper;
}   

replaceCard(cards.test_wait);
replaceCard(cards.test_wait_click);
replaceCard(cards.test_clicked);
replaceCard(cards.test_record);
replaceCard(cards.test_ready);

let measureResult = [];

const getRecords = () => {
    const records = {
        max: Math.max(...measureResult),
        min: Math.min(...measureResult),
        avg: measureResult.reduce((a, b) => a + b) / measureResult.length
    }
    return records;
};


const startBtn = document.getElementById('start-button');

const startWaitHandler = e =>{
    replaceCard(cards.test_wait);
    main.classList.remove('measure-end');
    main.classList.add('waiting');
    waitClick();
};

startBtn.addEventListener('click', startWaitHandler);

let measure_start_time;
let measure_end_time;
let measure_id;
let tooFastClickHandler;

function waitClick(){
    main.removeEventListener('click',startWaitHandler);
    measure_id = window.setTimeout(() => {
        measureStart();
    }, parseInt(Math.random() * 4501 + 500));

    tooFastClickHandler = () =>{
        clearTimeout(measure_id);
        main.removeEventListener('click',tooFastClickHandler);
        window.alert('Fail! Clicked too early');
        main.classList.remove('waiting');
        measureResult = [];
        replaceCard(cards.test_ready);
    }

    window.setTimeout(() => {main.addEventListener('click',tooFastClickHandler);},10); 
}

function measureStart(){
    measure_start_time = new Date().getTime(); //측정 시작
    main.classList.remove('waiting');
    replaceCard(cards.test_wait_click);
    main.removeEventListener('click',tooFastClickHandler);
    main.addEventListener('click', measureEnd);
}

function measureEnd(){
    measure_end_time = new Date().getTime(); //측정 완료

    const to_show = cards.test_clicked;
    const result = (measure_end_time - measure_start_time);

    measureResult.push(result);
    progressBar.innerText = `${measureResult.length} / 5`;

    if(measureResult.length < 5){
        to_show.querySelector('.millisec').innerText = `${result}ms`;   
        main.classList.add('measure-end');
        replaceCard(to_show);

        main.removeEventListener('click', measureEnd);
        main.addEventListener('click',startWaitHandler);
    }else{
        const to_show = cards.test_record;
        
        const records = getRecords();

        to_show.querySelector('.avg-time > .millisec').innerText = records.avg;
        to_show.querySelector('.best-time > .millisec').innerText = records.min;
        to_show.querySelector('.worst-time > .millisec').innerText = records.max;
        to_show.querySelector('.try-again-button').addEventListener('click',tryagainBtn);

        replaceCard(to_show);
        main.removeEventListener('click', measureEnd);
    }
        
}

const tryagainBtn = () =>{
    measureResult = [];
    replaceCard(cards.test_ready);
};






