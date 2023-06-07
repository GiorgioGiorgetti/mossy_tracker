

const canvas_cnt = document.querySelectorAll("#canvas_cnt");
let canvas = [];
const time = document.querySelector("#time")
let data = [];
let today = null;

const get_data = async ()=>{
    try{
      let req = await fetch("/admin/get_data/"+ time.value);
      req = await req.json();
      data = req.data;
      today = new Date(req.today);
      update_char();
    }catch (e){
      console.log(e)
    }
    
}

const update_char = ()=>{

    /* const date =  */
    let labels = [];

    let day_before = 0;

    if(time.value == "week"){
      day_before = 7;
    }else if(time.value == "month"){
      day_before = 31;
    }
    
    for(let i = 0; i < day_before; i++){
      const d = new Date(new Date().setDate(today.getDate() - i));
      labels.push(d.toLocaleDateString())
    }

    if(day_before == 0){
      for(let i = 0; i < today.getHours(); i++){
        const current = today.getHours();
        labels.push(Math.abs(current - i));
      }
    }

    labels = labels.reverse();
    //remove the canvas
    for(let i = 0; i < canvas_cnt.length; i++){
      const elm = canvas_cnt[i];
      const canvas_chld = canvas_cnt[i].querySelector("canvas");
      if(canvas_chld){
        canvas_chld.remove();
      }

      const new_canvas = document.createElement("canvas");

      elm.appendChild(new_canvas);
      
    }
    
    canvas = document.querySelectorAll("canvas");

    //chart one
    (()=>{

      const session_data = {}
      labels.map(x=>{
        session_data[x] = 0;
      });
      const session_key = Object.keys(session_data);

      const filtered_data = data.filter(x=>{
        if(x.action == "onload"){
          const action_date = new Date(x.date);
          if(session_data[action_date.toLocaleDateString()] != undefined){
            session_data[action_date.toLocaleDateString()] ++
          }else if(session_data[action_date.getHours()] != undefined){
            session_data[action_date.getHours()] ++;
          }
          return x;
        }
      })


      const des_data_arr = ()=>{
        const arr = []
        for(let i = 0; i < session_key.length; i++){
          arr.push(session_data[session_key[i]]);
        }

        return arr;
      }
      

      new Chart(canvas[0], {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'sessioins',
            data: des_data_arr(),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })();

    //chart tow
    (()=>{

      const session_data = {}
      labels.map(x=>{
        session_data[x] = 0;
      });
      const session_key = Object.keys(session_data);

      const filtered_data = data.filter(x=>{
        if(x.action != "onload" && x.action != "close_sessinon"){
          const action_date = new Date(x.date);
          if(session_data[action_date.toLocaleDateString()] != undefined){
            session_data[action_date.toLocaleDateString()] ++
          }else if(session_data[action_date.getHours()] != undefined){
            session_data[action_date.getHours()] ++;
          }
          return x;
        }
      })


      const des_data_arr = ()=>{
        const arr = []
        for(let i = 0; i < session_key.length; i++){
          arr.push(session_data[session_key[i]]);
        }

        return arr;
      }
      

      new Chart(canvas[1], {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'interactions',
            data: des_data_arr(),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })();

    //chart three
    (()=>{

      const session_data = {}
      labels.map(x=>{
        session_data[x] = [];
      });
      const session_key = Object.keys(session_data);

      const filtered_data = data.filter(x=>{
        if(x.action == "close_sessinon"){

          const action_date = new Date(x.date);
          if(session_data[action_date.toLocaleDateString()] != undefined){
            session_data[action_date.toLocaleDateString()].push(x.duration)
          }else if(session_data[action_date.getHours()] != undefined){
            session_data[action_date.getHours()].push(x.duration);
          }
          return x;
        }
      })


      const des_data_arr = ()=>{
        const arr = []
        for(let i = 0; i < session_key.length; i++){
          
          const arr_dt = session_data[session_key[i]];
          if(arr_dt.length != 0){
            
            let sum = 0;
            arr_dt.map(x=> sum = sum + parseInt(x));

            arr.push(Math.floor(sum/arr_dt.length));
          }else{
            arr.push(0);
          }
        }

        return arr;
      }
      

      new Chart(canvas[2], {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'session duration',
            data: des_data_arr(),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })();

    //chart four
    (()=>{

      const session_data = {}
      labels.map(x=>{
        session_data[x] = [];
      });
      const session_key = Object.keys(session_data);

      const filtered_data = data.filter(x=>{
        if(x.action != "onload" && x.action != "close_sessinon"){
          const action_date = new Date(x.date);
          if(session_data[action_date.toLocaleDateString()] != undefined){
            session_data[action_date.toLocaleDateString()].push(x)
          }else if(session_data[action_date.getHours()] != undefined){
            session_data[action_date.getHours()].push(x);
          }
          return x;
        }
      })
      


      const des_data_arr = ()=>{
        const arr = []
        for(let i = 0; i < session_key.length; i++){
          
          const arr_dt = session_data[session_key[i]];
          if(arr_dt.length != 0){

            let arr_2 = {};
            
            arr_dt.map(x=>{
              if(arr_2[x.code_id] != undefined){
                arr_2[x.code_id] = arr_2[x.code_id] + 1;
              }else{
                arr_2[x.code_id] = 1;
              }
            })

            const arr_2_key = Object.keys(arr_2);
            arr_2 = arr_2_key.map(x=>{
              return arr_2[x]
            })

            //media
            let sum = 0;
            arr_2.map(x=> sum = sum + parseInt(x));

            arr.push(Math.floor(sum/arr_2.length));
          }else{
            arr.push(0);
          }
        }

        return arr;
      }
      

      new Chart(canvas[3], {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'sections interactions',
            data: des_data_arr(),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })();
}

get_data()


time.onchange = ()=>{
  get_data();
}

window.onresize = ()=>{
  update_char();
}
