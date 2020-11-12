const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const taskRouter = express.Router();

taskRouter.post('/tasks', auth, async (req, res, next) => {

    // const task = new Task(req.body);

    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }

});

// GET /tasks?completed=false or true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc or asc
taskRouter.get('/tasks', auth, async (req, res, next) => {

    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        // ascending : 1
        // descending : -1
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 0;
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id });
        await req.user
            .populate({
                path: 'tasks',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                }
            })
            .execPopulate();

        res.send(req.user.tasks);
    } catch (err) {
        res.status(500).send(err);
    }

});

taskRouter.get('/tasks/:id', auth, async (req, res, next) => {

    const id = req.params.id;

    try {
        // const task = await Task.findById(id);

        const task = await Task.findOne({ _id: id, owner: req.user._id })

        if (!task) {
            return res.status(400).send();
        }

        res.send(task);

    } catch (err) {
        res.status(404).send(err);
    }

});

taskRouter.patch('/tasks/:id', auth, async (req, res, next) => {

    const updates = Object.keys(req.body);
    const allowedUpdate = ['completed', 'description'];

    const isValidOperation = updates.every(update => allowedUpdate.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Operation' });
    }

    const id = req.params.id;

    try {

        const task = await Task.findOne({ _id: id, owner: req.user._id });


        if (!task) {
            res.status(404).send();
        }

        updates.forEach(update => {
            task[update] = req.body[update];
        });

        await task.save();
        res.send(task);

    } catch (err) {
        res.status(400).send(err);
    }

});

taskRouter.delete('/tasks/:id', auth, async (req, res, next) => {

    const id = req.params.id;

    try {
        // const task = await Task.findByIdAndDelete(id);
        const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);

    } catch (err) {
        res.status(500).send(err)
    }

});

module.exports = taskRouter;