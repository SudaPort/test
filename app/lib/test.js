"use strict";

var StellarSdk = require('stellar-sdk');
var sjcl = require('sjcl');
var Conf = require('../config/Config');
var colors = require('cli-color');
var fs = require('fs');

var self;

class Test {

    constructor() {
        self = this;

        this.keypairs = {
            admin: StellarSdk.Keypair.random(),
            emission: StellarSdk.Keypair.random(),
            distr: StellarSdk.Keypair.random(),
            merchant: StellarSdk.Keypair.random(),
            anonym: StellarSdk.Keypair.random(),
            registered: StellarSdk.Keypair.random(),
            card: StellarSdk.Keypair.random(),
            exchange: StellarSdk.Keypair.random()
        };

        this.data = {
            code: Date.now().toString()
        };

        this.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
    }

    createAdmin() {
        console.time("createAdmin");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.setOptions({
                        signer: {
                            pubKey: self.keypairs.admin.accountId(),
                            weight: StellarSdk.xdr.SignerType.signerAdmin().value,
                            signerType: StellarSdk.xdr.SignerType.signerAdmin().value
                        }
                    }))
                    .build();
                tx.sign(StellarSdk.Keypair.fromSeed(Conf.master_seed));
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("createAdmin");
                console.log(colors.green("Create admin: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createAdmin");
                console.log(colors.red("Create admin: ERR"));
                return Promise.reject(error);
            })
    }

    deleteAdmin() {
        console.time("deleteAdmin");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.setOptions({
                        signer: {
                            pubKey: self.keypairs.admin.accountId(),
                            weight: 0,
                            signerType: StellarSdk.xdr.SignerType.signerAdmin().value
                        }
                    }))
                    .build();
                tx.sign(StellarSdk.Keypair.fromSeed(Conf.master_seed));
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("deleteAdmin");
                console.log(colors.green("Delete admin: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("deleteAdmin");
                console.log(colors.red("Delete admin: ERR"));
                return Promise.reject(error);
            })
    }

    createEmission() {
        console.time("createEmission");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.setOptions({
                        signer: {
                            pubKey: self.keypairs.emission.accountId(),
                            weight: StellarSdk.xdr.SignerType.signerEmission().value,
                            signerType: StellarSdk.xdr.SignerType.signerEmission().value
                        }
                    }))
                    .build();

                tx.sign(StellarSdk.Keypair.fromSeed(Conf.master_seed));
                return Conf.horizon.submitTransaction(tx)
            })
            .then(() => {
                console.timeEnd("createEmission");
                console.log(colors.green("Create emission key: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createEmission");
                console.log(colors.red("Create emission key: ERR"));
                return Promise.reject(error);
            })
    }

    deleteEmission() {
        console.time("deleteEmission");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.setOptions({
                        signer: {
                            pubKey: self.keypairs.emission.accountId(),
                            weight: 0,
                            signerType: StellarSdk.xdr.SignerType.signerEmission().value
                        }
                    }))
                    .build();

                tx.sign(StellarSdk.Keypair.fromSeed(Conf.master_seed));
                return Conf.horizon.submitTransaction(tx)
            })
            .then(() => {
                console.timeEnd("deleteEmission");
                console.log(colors.green("Delete emission key: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("deleteEmission");
                console.log(colors.red("Delete emission key: ERR"));
                return Promise.reject(error);
            })
    }

    createAgent(acc_id, type) {
        console.time("createAgent");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.createAccount({
                        destination: acc_id,
                        accountType: type
                    }))
                    .build();
                tx.sign(self.keypairs.admin);

                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("createAgent");
                console.log(colors.green("Create agent: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createAgent");
                console.log(colors.red("Create agent: ERR"));
                return Promise.reject(error);
            })
    }

    createCompany(keypair, data) {
        console.time("createCompany");
        Conf.SmartApi.setKeypair(keypair);

        return Conf.SmartApi.Companies.create(data)
            .then((response) => {
                console.timeEnd("createCompany");
                console.log(colors.green("Create company with api: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("createCompany");
                console.log(colors.red("Create company with api: ERR"));
                return Promise.reject(error);
            })
    }

    createAgentWithApi(keypair, data) {
        console.time("createAgentWithApi");
        Conf.SmartApi.setKeypair(keypair);

        return Conf.SmartApi.Agents.create(data)
            .then((response) => {
                console.timeEnd("createAgentWithApi");
                console.log(colors.green("Create agent with api: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("createAgentWithApi");
                console.log(colors.red("Create agent with api: ERR"));
                return Promise.reject(error);
            })
    }

    createWallet(keypair, login, password) {
        console.time("createWallet");

        Conf.SmartApi.setKeypair(keypair);

        return Conf.SmartApi.Wallets.create({
                username: login,
                password: password,
                accountId: keypair.accountId(),
                publicKey: keypair.rawPublicKey().toString('base64'),
                keychainData: keypair.seed(),
                mainData: 'mainData'
            })
            .then((response) => {
                console.timeEnd("createWallet");
                console.log(colors.green("Create wallet: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("createWallet");
                console.log(colors.red("Create wallet: ERR"));
                return Promise.reject(error);
            })
    }

    getWallet(login, password) {
        console.time("getWallet");

        Conf.SmartApi.setKeypair(StellarSdk.Keypair.random());

        return Conf.SmartApi.Wallets.get({
                username: login,
                password: password
            })
            .then((response) => {
                console.timeEnd("getWallet");
                console.log(colors.green("Get wallet: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("getWallet");
                console.log(colors.red("Get wallet: ERR"));
                return Promise.reject(error);
            })
    }

    acceptAgentEnrollment(keypair, data) {
        console.time("acceptAgentEnrollment");

        Conf.SmartApi.setKeypair(keypair);

        return Conf.SmartApi.Enrollments.accept(data)
            .then((response) => {
                console.log('API | Accept agent enrollment | Response');
                console.log(response);
                console.timeEnd("acceptAgentEnrollment");
                console.log(colors.green("Accept agent enrollment: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("acceptAgentEnrollment");
                console.log(colors.red("Accept agent enrollment: ERR"));
                return Promise.reject(error);
            })
    }

    approveEnrolment(keypair, data) {
        console.time("approveEnrolment");

        Conf.SmartApi.setKeypair(keypair);

        return Conf.SmartApi.Enrollments.approve(data)
            .then((response) => {
                console.log('API | Create agent | Response');
                console.log(response);
                console.timeEnd("approveEnrolment");
                console.log(colors.green("Approve enrollment: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("approveEnrolment");
                console.log(colors.red("Approve enrollment: ERR"));
                return Promise.reject(error);
            })
    }

    createAsset(asset) {
        console.time("createAsset");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {

                if (asset) {
                    asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
                } else {
                    asset = self.asset;
                }

                var isAnonymous = true;
                var isDelete = false;

                var tx = new StellarSdk.TransactionBuilder(source).addOperation(
                    StellarSdk.Operation.manageAssets(asset, isAnonymous, isDelete)
                ).build();

                tx.sign(self.keypairs.admin);
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("createAsset");
                console.log(colors.green("Create asset: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createAsset");
                console.log(colors.red("Create asset: ERR"));
                return Promise.reject(error);
            })
    }

    deleteAsset(asset) {
        console.time("deleteAsset");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {

                if (asset) {
                    asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
                } else {
                    asset = self.asset;
                }

                var isAnonymous = true;
                var isDelete = true;

                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.manageAssets(asset, isAnonymous, isDelete))
                    .build();

                tx.sign(self.keypairs.admin);

                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("deleteAsset");
                console.log(colors.green("Delete asset: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("deleteAsset");
                console.log(colors.red("Delete asset: ERR"));
                return Promise.reject(error);
            })
    }

    setTrust(keypair) {
        console.time("setTrust");
        return Conf.horizon.loadAccount(keypair.accountId())
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(
                        StellarSdk.Operation.changeTrust({
                            asset: self.asset
                        })
                    ).build();

                tx.sign(keypair);
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("setTrust");
                console.log(colors.green("Set trust: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("setTrust");
                console.log(colors.red("Set trust: ERR"));
                return Promise.reject(error);
            })
    }

    createInvoice(keypair, amount) {
        console.time("createInvoice");

        Conf.SmartApi.setKeypair(keypair);

        return Conf.SmartApi.Invoices.create({asset: Conf.asset, amount: parseFloat(amount).toFixed(2)})
            .then((response) => {
                console.timeEnd("createInvoice");
                console.log(colors.green("Create invoice: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("createInvoice");
                console.log(colors.red("Create invoice: ERR"));
                return Promise.reject(error);
            })
    }

    getInvoice(keypair, id) {
        console.time("getInvoice");

        Conf.SmartApi.setKeypair(keypair);
        return Conf.SmartApi.Api.refreshNonce()
            .then(() => {
                return Conf.SmartApi.Invoices.get({id: id});
            })
            .then((response) => {
                console.timeEnd("getInvoice");
                console.log(colors.green("Get invoice: OK"));
                return Promise.resolve(response);
            })
            .catch(function (error) {
                console.timeEnd("getInvoice");
                console.log(colors.red("Get invoice: ERR"));
                return Promise.reject(error);
            })
    }

    setCommission(opts, flat, percent) {
        console.time("setCommission");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var op = StellarSdk.Operation.setCommission(opts, flat.toString(), percent.toString());
                var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                tx.sign(self.keypairs.admin);
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("setCommission");
                console.log(colors.green("Set commission: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("setCommission");
                console.log(colors.red("Set commission: ERR"));
                return Promise.reject(error);
            })
    }

    unsetCommission(opts) {
        console.time("unsetCommission");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var op = StellarSdk.Operation.deleteCommission(opts);
                var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                tx.sign(self.keypairs.admin);
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("unsetCommission");
                console.log(colors.green("Unset commission: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("unsetCommission");
                console.log(colors.red("Unset commission: ERR"));
                return Promise.reject(error);
            })
    }

    createAnonym() {
        console.time("createAnonym");

        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.createAccount({
                        destination: self.keypairs.anonym.accountId(),
                        accountType: StellarSdk.xdr.AccountType.accountAnonymousUser().value
                    }))
                    .build();

                tx.sign(self.keypairs.admin);

                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("createAnonym");
                console.log(colors.green("Create anonym: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createAnonym");
                console.log(colors.red("Create anonym: ERR"));
                return Promise.reject(error);
            })
    }

    createRegisteredUser() {
        console.time("createRegisteredUser");

        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.createAccount({
                        destination: self.keypairs.registered.accountId(),
                        accountType: StellarSdk.xdr.AccountType.accountRegisteredUser().value
                    }))
                    .build();

                tx.sign(self.keypairs.admin);

                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("createRegisteredUser");
                console.log(colors.green("Create registered user: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createRegisteredUser");
                console.log(colors.red("Create registered user: ERR"));
                return Promise.reject(error);
            })
    }

    limitAgent(agent_acc_id, limits) {
        console.time("limitAgent");

        return Conf.horizon.setAgentLimits(agent_acc_id, Conf.asset, limits, self.keypairs.admin, Conf.master_key)
            .then(() => {
                console.timeEnd("limitAgent");
                console.log(colors.green("Set limits for distr agent: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("limitAgent");
                console.log(colors.red("Set limits for distr agent: ERR"));
                return Promise.reject(error);
            })
    }

    restrictAgent(agent_acc_id, block_outcoming, block_incoming) {
        console.time("restrictAgent");

        return Conf.horizon.restrictAgentAccount(agent_acc_id, block_outcoming, block_incoming, self.keypairs.admin, Conf.master_key)
            .then(() => {
                console.timeEnd("restrictAgent");
                console.log(colors.green("Set restrictions for distr agent: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("restrictAgent");
                console.log(colors.red("Set restrictions for distr agent: ERR"));
                return Promise.reject(error);
            })
    }

    makeEmission(amount) {
        console.time("makeEmission");
        return Conf.horizon.loadAccount(Conf.master_key)
            .then(source => {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.payment({
                        destination: self.keypairs.distr.accountId(),
                        amount: parseFloat(amount).toFixed(2),
                        asset: self.asset
                    }))
                    .build();

                tx.sign(self.keypairs.emission);
                return Conf.horizon.submitTransaction(tx)
            })
            .then(() => {
                console.timeEnd("makeEmission");
                console.log(colors.green("Make emission: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("makeEmission");
                console.log(colors.red("Make emission: ERR"));
                return Promise.reject(error);
            })
    }

    sendMoney(from_keypair, to, amount) {
        console.time("sendMoney");

        return Conf.horizon.loadAccount(from_keypair.accountId())
            .then(source => {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.payment({
                        destination: to,
                        amount: parseFloat(amount).toFixed(2),
                        asset: self.asset
                    }))
                    .build();
                tx.sign(from_keypair);
                return Conf.horizon.submitTransaction(tx);
            })
            .then(() => {
                console.timeEnd("sendMoney");
                console.log(colors.green("Send money: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("sendMoney");
                console.log(colors.red("Send money: ERR"));
                return Promise.reject(error);
            })
    }

    createCard(amount) {
        console.time("createCard");

        return Conf.horizon.loadAccount(self.keypairs.distr.accountId())
            .then((source) => {

                var memo = StellarSdk.Memo.text("card_creation");
                var txBuilder = new StellarSdk.TransactionBuilder(source, {memo: memo});
                var accounts_data = {};

                accounts_data[self.keypairs.card.accountId()] = new Buffer(sjcl.encrypt(self.keypairs.distr.seed(), self.keypairs.card.seed())).toString('base64');

                txBuilder.addOperation(StellarSdk.Operation.createAccount({
                    accountType: StellarSdk.xdr.AccountType.accountScratchCard().value,
                    destination: self.keypairs.card.accountId(),
                    amount: parseFloat(amount).toFixed(2),
                    asset: self.asset
                }));

                var tx = txBuilder.build();
                tx.sign(self.keypairs.distr);

                Conf.SmartApi.setKeypair(self.keypairs.distr);

                return Conf.SmartApi.Cards.create({
                    tx: tx.toEnvelope().toXDR().toString("base64"),
                    data: JSON.stringify(accounts_data)
                });
            })
            .then(() => {
                console.timeEnd("createCard");
                console.log(colors.green("Create card: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("createCard");
                console.log(colors.red("Create card: ERR"));
                return Promise.reject(error);
            })
    }

    useCard(card_keypair, to, amount) {
        console.time("useCard");

        return Conf.horizon.accounts()
            .accountId(card_keypair.accountId())
            .call()
            .then((account) => {
                var card_balance = null;
                account.balances.map(function(balance){
                    if (typeof balance.asset_code != 'undefined' && balance.asset_code == Conf.asset) {
                        card_balance = balance.balance;
                    }
                });

                if (!card_balance) {
                    return Promise.reject('Can not get card balance');
                }

                if (card_balance != amount) {
                    return Promise.reject('Card have unexpected balance');
                }

                return self.sendMoney(card_keypair, to, amount);
            })
            .then(() => {
                console.timeEnd("useCard");
                console.log(colors.green("Use card: OK"));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("useCard");
                console.log(colors.red("Use card: ERR"));
                return Promise.reject(error);
            })
    }

    makeExternalPayment(amount, destinationBankId, destinationAccountId) {
        console.log("makeExternalPayment started...");
        console.time("makeExternalPayment");
        return Conf.horizon.loadAccount(self.keypairs.anonym.accountId())
            .then(source => {
                var tx = new StellarSdk.TransactionBuilder(source)
                    .addOperation(StellarSdk.Operation.externalPayment({
                        exchangeAgent: self.keypairs.exchange.accountId(),
                        destinationBank: destinationBankId,
                        destinationAccount: destinationAccountId,
                        amount: parseFloat(amount).toFixed(2),
                        asset: self.asset
                    }))
                    .build();

                tx.sign(self.keypairs.anonym);
                return Conf.horizon.submitTransaction(tx)
            })
            .then(() => {
                console.timeEnd("makeExternalPayment");
                console.log(colors.green("OK : makeExternalPayment finished."));
                return Promise.resolve(true);
            })
            .catch(function (error) {
                console.timeEnd("makeExternalPayment");
                console.log(colors.red("makeExternalPayment: ERR"));
                return Promise.reject(error);
            })
    }

}

module.exports = new Test();