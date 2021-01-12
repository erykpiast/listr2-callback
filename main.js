const { Listr } = require('listr2');

function wait(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const TASK_TIME = 5000;

(async () => {
    const outerList = new Listr([{
        title: 'Some initial work',
        task: () => wait(TASK_TIME),
    }, {
        title: 'Handles both error and success properly, but does not display inner list while it is in progress',
        task: async (_, task) => {
            try {
                await task.newListr([{
                    title: 'OK',
                    task: () => wait(TASK_TIME * 1.5),
                }, {
                    title: 'OK too',
                    task: () => wait(TASK_TIME),
                }, {
                    title: 'I am gonna fail',
                    task: async () => {
                        await wait(TASK_TIME * 2);
                        throw new Error('Miserable fail');
                    },
                }, {
                    title: 'I am OK as well, but will never finish because of the previous task fails',
                    task: () => wait(TASK_TIME * 3),
                }], {
                    concurrent: true
                }).run();

                task.title += ' (success)';
            } catch (err) {
                task.title += ' (failed)';
                // plus some cleanup logic, to restore state of things before
                // the whole process started
            }
        }
    }, {
        title: 'Displays inner list properly but does not allow to cleanup things when something fails',
        task: async (_, task) => task.newListr([{
            title: 'OK',
            task: () => wait(TASK_TIME * 1.5),
        }, {
            title: 'OK too',
            task: () => wait(TASK_TIME),
        }, {
            title: 'I am gonna fail',
            task: async () => {
                await wait(TASK_TIME * 2);
                throw new Error('Miserable fail');
            },
        }, {
            title: 'I am OK as well, but will never finish because of the previous task fails',
            task: () => wait(TASK_TIME * 3),
        }], {
            concurrent: true
        })
    }], {
        exitOnError: false,
    });

    await outerList.run();


})();