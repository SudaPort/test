var test = require('./lib/test');
var colors = require('cli-color');
var Conf = require('./config/Config');
var fs = require('fs');


return Promise.resolve()
    .then(test.createAdmin)
    .then(test.createEmission)
    .then(() => {
        console.log(colors.yellow('Create asset: ' + Conf.asset));
        return test.createAsset();
    })
    .then(() => {
        console.log(colors.yellow('Create distr agent'));
        return test.createAgent(test.keypairs.distr.accountId(), StellarSdk.xdr.AccountType.accountDistributionAgent().value);
    })
    //set trust for distr agent created previously
    .then(() => {
        console.log(colors.yellow('Set trust for distr agent'));
        return test.setTrust(test.keypairs.distr);
    })
    //set commission for all incoming payments for distr agent created previously
    .then(() => {
        var opts = {
            to: test.keypairs.distr.accountId(),
            asset: test.asset
        };
        var flat    = 0;
        var percent = 0.01;
        console.log(colors.yellow('Set commission for distr agent'));
        return test.setCommission(opts, flat, percent);
    })
    //make emission for distr agent created previously
    .then(() => {
        var amount = 100;
        return test.makeEmission(amount);
    })
    .then(test.createAnonym)
    .then(() => {
        console.log(colors.yellow('Set trust for anonym'));
        return test.setTrust(test.keypairs.anonym);
    })
    //set commission for all incoming payments for anonymous account
    .then(() => {
        var opts = {
            to: test.keypairs.anonym.accountId(),
            asset: test.asset
        };
        var flat    = 0.01;
        var percent = 0;
        console.log(colors.yellow('Set commission for anonym'));
        return test.setCommission(opts, flat, percent);
    })
    .then(() => {
        return test.createInvoice(test.keypairs.anonym, 90);
    })
    .then((response) => {
        if (typeof response == 'undefined' || typeof response.data == 'undefined' || typeof response.data.id == 'undefined') {
            return Promise.reject('Unexpected response from api while create invoice');
        }
        return test.getInvoice(test.keypairs.distr, response.data.id);
    })
    .then((response) => {
        if (
            typeof response == 'undefined' ||
            typeof response.data == 'undefined' ||
            typeof response.data.asset == 'undefined' ||
            typeof response.data.amount == 'undefined' ||
            typeof response.data.account == 'undefined'
        ) {
            return Promise.reject('Unexpected response from api while get invoice');
        }
        console.log(colors.yellow('Send money from distr to anonym'));
        return test.sendMoney(test.keypairs.distr, response.data.account, response.data.amount);
    })
    .then(test.createRegisteredUser)
    .then(() => {
        console.log(colors.yellow('Set trust for registered user'));
        return test.setTrust(test.keypairs.registered);
    })
    .then(() => {
        console.log(colors.yellow('Send money from anonym to registered'));
        return test.sendMoney(test.keypairs.anonym, test.keypairs.registered.accountId(), 70);
    })
    .then(() => {
        var limits = {
            max_operation_out: "-1",
            daily_max_out: "-1",
            monthly_max_out: "-1",
            max_operation_in: "-1",
            daily_max_in: "-1",
            monthly_max_in: "-1"
        };
        return test.limitAgent(test.keypairs.distr.accountId(), limits);
    })
    .then(() => {
        return test.restrictAgent(test.keypairs.distr.accountId(), true, true);
    })
    .then(() => {
        console.log(colors.yellow('Create merchant'));
        return test.createAgent(test.keypairs.merchant.accountId(), StellarSdk.xdr.AccountType.accountMerchant().value);
    })
    .then(() => {
        console.log(colors.yellow('Set trust for merchant'));
        return test.setTrust(test.keypairs.merchant);
    })
    .then(() => {
        console.log(colors.yellow('Send money from registered to merchant'));
        return test.sendMoney(test.keypairs.registered, test.keypairs.merchant.accountId(), 50);
    })
    .then(() => {
        return test.createCard(5);
    })
    .then(() => {
        return test.useCard(test.keypairs.card, test.keypairs.anonym.accountId(), 5);
    })
    //unset commission for all incoming payments for distr agent created previously
    .then(() => {
        var opts = {
            to: test.keypairs.distr.accountId(),
            asset: test.asset
        };
        console.log(colors.yellow('Unset commission for distr agent'));
        return test.unsetCommission(opts);
    })
    //unset commission for all incoming payments for anonymous account
    .then(() => {
        var opts = {
            to: test.keypairs.anonym.accountId(),
            asset: test.asset
        };
        console.log(colors.yellow('Unset commission for anonym'));
        return test.unsetCommission(opts);
    })
    .then(() => {
        console.log(colors.yellow('Create exchange'));
        return test.createAgent(test.keypairs.exchange.accountId(), StellarSdk.xdr.AccountType.accountExchangeAgent().value);
    })
    // .then(() => {
    //     console.log(colors.yellow('Make external payment'));
    //     return test.makeExternalPayment(23.03, Conf.master_key, test.keypairs.anonym.accountId())
    // })
    //clear after test
    .then(test.deleteAdmin)
    .then(test.deleteEmission)
    .then(() => {
        console.log(colors.black.bgBlue.underline('Test finished'));
    })
    .catch(err => {
        console.error(err);
        if (
            typeof err != 'undefined' &&
            typeof err.response != 'undefined' &&
            typeof err.response.data != 'undefined' &&
            typeof err.response.data.extras != 'undefined'
        ) {
            console.log(colors.yellow("EXTRAS:"));
            console.error(err.response.data.extras);
            //StellarSdk.xdr.TransactionEnvelope.fromXDR(
            console.log(StellarSdk.xdr.TransactionEnvelope.fromXDR(err.response.data.extras.envelope_xdr, 'base64'));
        }
    })
    .then(() => {
        //remove .env
        console.log('Remove .env file...');
        fs.unlink('../.env');
    })
    .catch((err) => {
        console.error(err);
        console.error('Can not delete generated .env file! Remove it manually!!!');
    })
    .then(() => {
        process.exit(0);
    });