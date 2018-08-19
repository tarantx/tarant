/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class Mailbox {
    constructor(owner, queue) {
        this.owner = owner;
        this.busyPulling = false;
        this.queue = queue || [];
        this.supportQueue = [];
    }

    push(message) {
        if (this.busyPulling) {
            this.supportQueue.push(message);
        } else {
            this.queue.push(message);
        }
    }

    pull(transaction) {
        if (this.busyPulling || this.queue.length === 0) {
            return Promise.resolve(undefined);
        }

        this.busyPulling = true;
        let [ messageToProcess, ... resultQueue ] = this.queue;
        return new Promise((_resolve, _reject) => {
            this.owner.materializer.onBeforePullingMessage(this.owner, messageToProcess);

            let resolve = (result) => _resolve(this.__triggerMessageProcessed(messageToProcess, result, resultQueue));
            let reject = (error) => _reject(this.__triggerMessageFailed(messageToProcess, error, resultQueue));

            try {
                let result = transaction(messageToProcess);
                if (result) {
                    if (result.then !== undefined && result.catch !== undefined) {
                        result.then(resolve).catch(reject);
                    } else {
                        result.then(resolve);
                    }
                }
            } catch (ex) {
                reject(ex);
            }
        });
    }

    isEmpty() {
        return this.queue.length === 0 && this.supportQueue.length === 0;
    }

    __triggerMessageProcessed(message, result, resultQueue) {
        let queueSize = resultQueue.length + this.supportQueue.length;

        if (queueSize > 0) {
            this.owner.system.requestTime(this.owner.id);
        }

        this.__flushSupportQueue(resultQueue);

        this.owner.materializer.onAfterMessageProcessed(this.owner, message, result);
        return result;
    }

    __triggerMessageFailed(message, error, resultQueue) {
        let queueSize = resultQueue.length + this.supportQueue.length;

        if (queueSize > 0) {
            this.owner.system.requestTime(this.owner.id);
        }

        this.__flushSupportQueue(resultQueue);

        this.owner.materializer.onError(this.owner, message, error);
        return error;
    }

    __flushSupportQueue(resultQueue) {
        this.queue = resultQueue.concat(this.supportQueue);
        this.supportQueue = [];
        this.busyPulling = false;
    }
}

export default Mailbox;