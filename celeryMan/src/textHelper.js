/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = (function () {
    return {
        completeHelp: 'Here\'s some things you can say,'
            + ' load up celery man.'
            + ' give tayne a hat wobble.'
            + ' what sequences are running?'
            + ' clear sequences.'
            + ' reset.',
        nextHelp: 'You can give a sequence an action, add a sequence, get a description of the sequences running, or say help. What would you like?',

        getSequenceName: function (recognizedSequenceName) {
            if (!recognizedSequenceName) {
                return undefined;
            } else {
                return recognizedSequenceName;
            }
        },

        getActionType: function (recognizedActionType) {
            if (!recognizedActionType) {
                return undefined;
            }
            var split = recognizedActionType.indexOf(' '), newAction;

            if (split < 0) {
                newAction = recognizedActionType;
            } else {
                // The action should only be one word
                newAction = recognizedActionType.substring(0, split);
            }
            return newAction;
        }
    };
})();
module.exports = textHelper;
