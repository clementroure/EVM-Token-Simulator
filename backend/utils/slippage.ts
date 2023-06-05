/**
 * Calculate slippage percentage.
 * @param inputAmount - The amount of tokens being provided.
 * @param outputAmount - The amount of tokens being received.
 * @param inputReserve - The liquidity reserve for the token being provided.
 * @param outputReserve - The liquidity reserve for the token being received.
 */

export function calculateSlippage(inputAmount: any, outputAmount: any, inputReserve: any, outputReserve: any): string {

    console.log(inputAmount, outputAmount, inputReserve, outputReserve)

    const inputAmountWithFee = inputAmount.mul(997);
    const numerator = inputAmountWithFee.mul(outputReserve);
    const denominator = inputReserve.mul(1000).add(inputAmountWithFee);
    const expectedOutputAmount = numerator.div(denominator);
    
    const slippage = expectedOutputAmount.sub(outputAmount).mul(100).div(expectedOutputAmount);
    
    return slippage;  // returns the slippage in percentage with 2 decimal places
  }