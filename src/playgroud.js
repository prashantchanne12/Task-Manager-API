require('./db/mongoose');
const Task = require('./models/task');

// Task.findByIdAndDelete('5fa8fc6f4fc39d462ce8f093')
//     .then(() => {
//         return Task.countDocuments({ completed: false });
//     })
//     .then(res => {
//         console.log(res);
//     }).catch(err => {
//         console.log('Error: ', err);
//     });


const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({ completed: false });

    return count;
}

deleteTaskAndCount('5fa8fc6f4fc39d462ce8f093')
    .then(count => {
        console.log(count);
    })
    .catch(err => {
        console.log(err);
    });