import fetch from 'node-fetch';

let runAmmount = 10; // Result is multiplied by 100
for (var i = 0; i < runAmmount; i++) start();

let run = 0;
let times: Array<Number> = [];
async function start() {
  for (var i = 0; i < 100; i++) {
    let before = Date.now();
    await fetch('http://localhost:3000/api/discord/v1/376901199225552898');
    let after = Date.now();
    run++;
    console.log(`[${run}] Fetched API in ${after - before}ms`);
    times.push(after - before);
  }
  process.exit(0);
}

process.on('exit', () => {
  const sum = times.reduce((a: any, b: any) => a + b, 0);
  const avg = sum / times.length || 0;
  console.log(`Average: ${avg}ms`);
});
