import fs from 'fs';
  
  class JumpDiffusion {
    constructor(
      // This is the initial asset price. It sets the starting point for the simulation.
      private S0: number, 
      // This is the expected return rate (drift) of the asset in the absence of jumps. It is often based on historical returns of the asset.
      private mu: number, 
      // This is the standard deviation of returns (volatility) in the absence of jumps. It is often based on the historical volatility of the asset.
      private sigma: number,
      //  This is the expected size of the jumps. A positive value will cause the jumps to increase the asset price on average, while a negative value will cause the jumps to decrease the asset price on average.
      private muJ: number,
      // This is the standard deviation of the jump sizes. A higher value will make the jump sizes more variable.
      private sigmaJ: number,
      // This is the average number of jumps per time unit (often per year). A higher value will make jumps more frequent.
      private lambda: number
    ) {}
  
    simulate(T: number, dt: number): number[] {
      const N = Math.ceil(T/dt);
      const sqrtDt = Math.sqrt(dt);
      let S = this.S0;
      const path = [S];
  
      for (let i = 0; i < N; i++) {
        const dW = sqrtDt * this.randn();
        const dN = Math.random() < this.lambda*dt ? 1 : 0;
        const dJ = dN === 0 ? 0 : this.muJ + this.sigmaJ * this.randn();
        S *= Math.exp((this.mu - 0.5 * this.sigma**2) * dt + this.sigma * dW + dJ);
        path.push(S);
      }
  
      return path;
    }
  
    private randn(): number {
      // Box-Muller transform to generate a random number from normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    }

    // export as .csv
    saveToCSV(path: number[], fileName: string) {
      const writer = fs.createWriteStream(fileName);
      writer.write('index,value\n'); // Write header
      path.forEach((value, index) => {
        writer.write(`${index},${value}\n`); // Write data
      });
      writer.end();
    }
  }

  export default JumpDiffusion


  // The long-term trend of the asset price in a jump-diffusion model is influenced by both 
  // the standard geometric Brownian motion (defined by mu and sigma) and 
  // the jumps (defined by muJ, sigmaJ, and lambda).
  