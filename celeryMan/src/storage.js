/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The Session class stores all game states for the user
     */
    function Session(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                sequences: [],
                actions: {}
            };
        }
        this._session = session;
    }

    Session.prototype = {
        save: function (callback) {
            // Save the sequence states in the session,
            // so next time we can save a read from dynamoDB
            this._session.attributes.currentSession = this.data;
            dynamodb.putItem({
                TableName: 'CeleryManUserData',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadSession: function (session, callback) {
            if (session.attributes.currentSession) {
                console.log('get session from session=' + session.attributes.currentSession);
                callback(new Session(session, session.attributes.currentSession));
                return;
            }
            dynamodb.getItem({
                TableName: 'CeleryManUserData',
                Key: {
                    CustomerId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var currentSession;
                if (err) {
                    console.log(err, err.stack);
                    currentSession = new Session(session);
                    session.attributes.currentSession = currentSession.data;
                    callback(currentSession);
                } else if (data.Item === undefined) {
                    currentSession = new Session(session);
                    session.attributes.currentSession = currentSession.data;
                    callback(currentSession);
                } else {
                    console.log('get session from dynamodb=' + data.Item.Data.S);
                    currentSession = new Session(session, JSON.parse(data.Item.Data.S));
                    session.attributes.currentSession = currentSession.data;
                    callback(currentSession);
                }
            });
        },
        newSession: function (session) {
            return new Session(session);
        }
    };
})();
module.exports = storage;
