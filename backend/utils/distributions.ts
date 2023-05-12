
function normal_distribution(min: number, max: number, skew: number) {
  
    let u = 0, v = 0;
    while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random()
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    
    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0) 
      num = normal_distribution(min, max, skew) // resample between 0 and 1 if out of range
    
    else{
      num = Math.pow(num, skew) // Skew
      num *= max - min // Stretch to fill range
      num += min // offset to min
    }
    return num
}

function poisson_distribution(lambda: number, size: number): number[] {
  const poissonArray: number[] = [];
  for (let i = 0; i < size; i++) {
    let p = Math.exp(-lambda);
    let x = 0;
    let s = p;
    let u = Math.random();
    while (u > s) {
      x++;
      p *= lambda / x;
      s += p;
    }
    poissonArray.push(x);
  }
  return poissonArray;
}

function binomial_distribution(n: number, p: number, size: number): number[] {
  const result = [];
  for (let i = 0; i < size; i++) {
    let successes = 0;
    for (let j = 0; j < n; j++) {
      if (Math.random() < p) {
        successes++;
      }
    }
    result.push(successes);
  }
  return result;
}


function calculateBlackScholesPrice(P_t:number, u:number, sigma:number, dt:number) {
  // Generate a random number from a normal distribution
  function generateRandomNumber() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Calculate epsilon
  const epsilon = generateRandomNumber();

  // Calculate the term u * dt + sigma * epsilon * sqrt(dt)
  const term = u * dt + sigma * epsilon * Math.sqrt(dt);

  // Calculate the new price P_{t+1}
  const P_t_plus_1 = P_t + P_t * term;

  return P_t_plus_1;
}


export {normal_distribution, poisson_distribution, binomial_distribution, calculateBlackScholesPrice}
