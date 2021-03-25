var StellarSdk = require('stellar-sdk');
var Table = require('cli-table2');

var test = require('./lib/test');
var colors = require('cli-color');
var Conf = require('./config/Config');
var fs = require('fs');

var logfile        = './logs/app.log';

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
    //make emission for distr agent created previously
    .then(() => {
        var amount = 1000;
        return test.makeEmission(amount);
    })
    .then(function () {
        Conf.horizon.loadAccount(test.keypairs.distr.accountId())
            .then(source => {
                setInterval(function(){
                    var dest = StellarSdk.Keypair.random();

                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: dest.accountId(),
                            amount: "0.01",
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        }))
                        .build();

                    tx.sign(test.keypairs.distr);

                    Conf.horizon.submitTransaction(tx)
                        .catch(err => {
                            if (
                                typeof err != 'undefined' &&
                                typeof err.response != 'undefined' &&
                                typeof err.response.data != 'undefined' &&
                                typeof err.response.data.extras != 'undefined'
                            ) {
                                return console.log(err.response.data.extras);
                            }
                            console.log(err);
                        });
                }, 60000 / Conf.TPM);
            });

        var txid = [];
        var date_table = {};

        Object.prototype.leftPad = function(len, char) {
            str = this.toString();
            char = char || 0;
            char = char + '';

            while (str.length < len) {
                str = char + str;
            }

            return str;
        };


        Conf.horizon
            .payments()
            .cursor('now')
            .stream({
                onmessage: function(message){
                    if (txid.indexOf(message.id) > -1) {
                        console.log('already exists');
                        return;
                    }

                    txid.push(message.id);

                    var a = new Date(message.closed_at);
                    var date = [a.getDate().leftPad(2), a.getMonth().leftPad(2), a.getUTCFullYear().leftPad(2)].join('/') + ' ' + [a.getHours().leftPad(2), a.getMinutes().leftPad(2)].join(':');

                    if (!date_table[date]) {
                        date_table[date] = 1;
                    } else {
                        date_table[date]++;
                    }

                    fs.writeFile(logfile, JSON.stringify(date_table), function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });

                    process.stdout.write('\033c');
                    var table = new Table({
                        head: ['Date', 'TxCount'],
                    });

                    var keys = Object.keys(date_table);
                    keys.sort();

                    for (var i = 0; i < keys.length; i++) {
                        k = keys[i];
                        table.push([k, date_table[k]])
                    }

                    console.log(table.toString());
                },
                onerror: function(err){
                    // console.log(err)
                }
            });

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
    });