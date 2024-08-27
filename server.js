// Startup //
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Configure the root folder as a static directory //
app.use(express.static(__dirname));

// Route to Login page //
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Router to Dashboaard page //
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

// Database //
mongoose.connect('mongodb://localhost:27017/employeeDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Database Users //
const User = mongoose.model('User', {
    name: String,
    username: String,
    password: String,
    type: String
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Login //
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password }).exec();
    if (user) {
        res.send({ success: true, message: 'Login successful!' });
    } else {
        res.send({ success: false, message: 'Invalid username or password.' });
    }
});

// Create Users //
app.post('/api/createUser', async (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.send({ success: true, message: 'User created successfully!' });
});

// Register //
app.post('/api/register', async (req, res) => {
    const { name, username, password, type } = req.body;
    const newUser = new User({ name, username, password, type });
    await newUser.save();
    res.send({ success: true, message: 'User created successfully!' });
});

// New Employeer //
const employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    position: String,
    department: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// GET Employees //
app.get('/api/employees', async (req, res) => {
    const employees = await Employee.find();
    res.json(employees.map(employee => ({
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department
    })));
});

// POST Employees //
app.post('/api/employees', async (req, res) => {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).send();
});

// Update Employees //
app.put('/api/employees/:id', async (req, res) => {
    await Employee.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).send();
});

// Delete Employees //
app.delete('/api/employees/:id', async (req, res) => {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Find User Before Delete //
app.get('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username }).exec();
    if (user) {
        res.json({ type: user.type });
    } else {
        res.status(404).send('User not found');
    }
});

// Server Port URL //
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});