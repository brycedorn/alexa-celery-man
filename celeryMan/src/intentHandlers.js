/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.ResetSequencesIntent = function (intent, session, response) {
        storage.newSession(session).save(function () {
            response.ask('What will your first sequence of the day be?',
                'Please tell me which sequence you would like to see first.');
        });
    };

    intentHandlers.AddSequenceIntent = function (intent, session, response) {
        var newSequenceName = textHelper.getSequenceName(intent.slots.SequenceName.value),
            newBetaSequenceName = (newSequenceName === 'tayne');
        if (!newSequenceName) {
            response.ask('I\'m sorry, that isn\'t in my list of sequences.', 'What sequence would you like to add?');
            return;
        }
        storage.loadSession(session, function (currentSession) {
            var speechOutput, reprompt;
            if (currentSession.data.sequences.indexOf(newSequenceName) !== -1) {
                speechOutput = newSequenceName + ' has already been loaded.';
            } else {
                if (!newBetaSequenceName) { 
                    speechOutput = newSequenceName + ' has been loaded. ';
                } else {
                    speechOutput = ' Hi I\'m Tayne. I can\'t wait to entertain you. ';
                }
                currentSession.data.sequences.push(newSequenceName);
                currentSession.data.actions[newSequenceName] = '';
            }
            if (skillContext.needMoreHelp) {
                if (currentSession.data.sequences.length === 3) {
                    speechOutput += 'You\'re currently running all available sequences.';
                    reprompt = textHelper.nextHelp;
                } else {
                    speechOutput += 'What other sequences would you like to add?';
                    reprompt = textHelper.nextHelp;
                }
            }
            currentSession.save(function () {
                if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    };

    intentHandlers.RemoveSequenceIntent = function (intent, session, response) {
        var SequenceName = textHelper.getSequenceName(intent.slots.SequenceName.value);
        if (!SequenceName) {
            response.ask('Sorry, I didn\'t hear the sequence name, please say that again', 'Please say the name of the sequence again');
            return;
        }
        storage.loadSession(session, function (currentSession) {
            var targetSequence, speechOutput = '';
            if (currentSession.data.sequences.length < 1) {
                response.ask('Sorry, no sequences are running yet, what can I do for you?', 'What can I do for you?');
                return;
            }
            for (var i = 0; i < currentSession.data.sequences.length; i++) {
                if (currentSession.data.sequences[i] === SequenceName) {
                    targetSequence = currentSession.data.sequences[i];
                    currentSession.data.sequences.splice(i,1);
                    break;
                }
            }
            if (!targetSequence) {
                response.ask('Sorry, ' + SequenceName + ' has not been loaded yet.', SequenceName + ' has not been loaded yet.');
                return;
            }

            currentSession.data.actions[targetSequence] = '';
            speechOutput += 'Stopped ' + SequenceName + '. ';
            
            currentSession.save(function () {
                response.tell(speechOutput);
            });
        });
    };

    intentHandlers.AddActionIntent = function (intent, session, response) {
        var SequenceName = textHelper.getSequenceName(intent.slots.SequenceName.value),
            ActionType = textHelper.getActionType(intent.slots.ActionType.value);
        if (!SequenceName) {
            response.ask('Sorry, I didn\'t hear the sequence name, please say that again', 'Please say the name of the sequence again');
            return;
        }
        if (!ActionType) {
            response.ask('Sorry, I didn\'t quite get what you wanted, please say that again', 'Please say that again');
            return;
        }
        storage.loadSession(session, function (currentSession) {
            var targetSequence, speechOutput = '';
            if (currentSession.data.sequences.length < 1) {
                response.ask('Sorry, no sequences are running yet, what would you like to do?', 'What can I do for you?');
                return;
            }
            for (var i = 0; i < currentSession.data.sequences.length; i++) {
                if (currentSession.data.sequences[i] === SequenceName) {
                    targetSequence = currentSession.data.sequences[i];
                    break;
                }
            }
            if (!targetSequence) {
                response.ask('Sorry, ' + SequenceName + ' has not been loaded yet.', SequenceName + ' has not been loaded.');
                return;
            }

            currentSession.data.actions[targetSequence] = ActionType;
            speechOutput += 'Ok, loaded ' + ActionType + ' for ' + targetSequence + '. ';
            
            currentSession.save(function () {
                response.tell(speechOutput);
            });
        });
    };

    intentHandlers.DescribeSequencesIntent = function (intent, session, response) {
        // Describes the sequences currently running and
        // the action (if any) associated with each.
        storage.loadSession(session, function (currentSession) {
            var speechOutput = '',
                description = '',
                sequenceAction,
                genericRunningString = ' is currently running. ';
            if (currentSession.data.sequences.length === 0) {
                response.tell('There are no sequences currently running.');
                return;
            }
            currentSession.data.sequences.forEach(function (sequence) {
                sequenceAction = currentSession.data.actions[sequence];

                if (sequenceAction) {
                    speechOutput += sequence + ' is currently doing a ' + sequenceAction + '. ';
                    description  += sequence + ': ' + sequenceAction + '. ';
                } else {
                    speechOutput += sequence + genericRunningString;
                    description  += sequence + genericRunningString;
                }
            });
            response.tellWithCard(speechOutput, "Description", description);
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Sequences now running in background. Say, Load up Celery Man to play some more sequences.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Sequences now running in background. Say, Load up Celery Man to play some more sequences.');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;
