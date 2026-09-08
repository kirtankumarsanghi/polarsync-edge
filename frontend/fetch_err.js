fetch('http://localhost:3000/').then(r=>r.text()).then(t=>{ 
  console.log("Status:", t.substring(0, 500)); 
})
