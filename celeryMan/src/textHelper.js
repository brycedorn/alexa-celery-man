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
        + ' add celery man.'
        + ' give tayne a hat wobble.'
        + ' what sequences are running'
        + ' clear sequences'
        + ' reset',
        nextHelp: 'You can give a sequence an action, add a sequence, get a description of the sequences running, or say help. What would you like?',

        getSequenceName: function (recognizedSequenceName) {
            if (!recognizedSequenceName) {
                return undefined;
            }
            var split = recognizedSequenceName.indexOf(' '), newSequence;

            if (split < 0) {
                newSequence = recognizedSequenceName;
            } else {
                //the name should only contain a first name, so ignore the second part if any
                newSequence = recognizedSequenceName.substring(0, split);
            }
            return newSequence;
        }
    };
})();
module.exports = textHelper;
