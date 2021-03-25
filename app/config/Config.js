StellarSdk = require('stellar-sdk');
var smart_api = require('smart-api-js');

var conf = {
    master_seed:        process.env.MASTER_SEED,
    master_key:         process.env.MASTER_KEY,
    horizon_host:       process.env.HORIZON_HOST,
    api_host:           process.env.API_HOST,
    asset:              process.env.ASSET,
    stellar_network:    process.env.STELLAR_NETWORK,
    TPM:                process.env.TPM || 150,
};

conf.SmartApi = new smart_api({
    host: process.env.API_HOST
});

StellarSdk.Network.use(new StellarSdk.Network(conf.stellar_network));
conf.horizon = new StellarSdk.Server(conf.horizon_host);

var Config = module.exports = conf;
