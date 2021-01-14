export class Wallet {
    constructor() {
        
    }    
    public usdRate = 0;
    public usdBalance = 0;
    public confirmedAccountBalance = 0;
    public escrow = 0;
    public tickerSymbol: string;
    public chainAddress: string;
    public chain: string;
    public fees: Fees = new Fees();
}

export class Fees {
    constructor() {

    }
    public minBuyAmount = 0;
    public minBlockFees = 0;
    public minXendFees = 0;
    public maxXendFees = 0;
    public percXendFees = 0;
    public externalDepositFees = 0;
    public percExternalTradingFees = 0;
    public externalWithdrawalFees = 0;
    public tickerSymbol: string;
    public chainAddress: string;
    public chain: string;
    public feesChain: string;
    public logoURI: string;
}